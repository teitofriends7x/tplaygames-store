-- 0002_accounts_orders_persistence.sql
-- Extends the initial schema with:
-- - Transfer proof uploads
-- - Guest order access tokens
-- - Order events timeline
-- - Additional order fields for payment method and transfer expiration
-- - Public order number for customer-facing references

-- ============================================================
-- 1. Extend order_status enum with transfer states
-- ============================================================
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'transfer_receipt_received';
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'transfer_under_review';
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'transfer_expired';

-- ============================================================
-- 2. Add payment_method and transfer fields to orders
-- ============================================================
DO $$ BEGIN
  CREATE TYPE payment_method AS ENUM ('mercadopago', 'transfer');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method payment_method DEFAULT 'mercadopago';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS transfer_expires_at timestamptz;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS public_order_number text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS guest_email text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS guest_phone text;

-- Generate public order numbers for existing orders
UPDATE orders
SET public_order_number = 'TPG-' || to_char(created_at, 'YYMMDD') || '-' || upper(substr(md5(id::text), 1, 6))
WHERE public_order_number IS NULL;

-- Make public_order_number required going forward
ALTER TABLE orders ALTER COLUMN public_order_number SET NOT NULL;
ALTER TABLE orders ALTER COLUMN public_order_number SET DEFAULT '';

-- ============================================================
-- 3. Indexes for new fields
-- ============================================================
CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_public_number ON orders (public_order_number);
CREATE INDEX IF NOT EXISTS idx_orders_guest_email ON orders (lower(guest_email)) WHERE user_id IS NULL;
CREATE INDEX IF NOT EXISTS idx_orders_payment_method ON orders (payment_method);
CREATE INDEX IF NOT EXISTS idx_orders_transfer_expires ON orders (transfer_expires_at) WHERE transfer_expires_at IS NOT NULL;

-- ============================================================
-- 4. Transfer proofs table
-- ============================================================
CREATE TABLE IF NOT EXISTS transfer_proofs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  uploaded_by uuid REFERENCES auth.users(id),
  guest_email text,
  storage_path text NOT NULL,
  file_name text NOT NULL,
  file_size_bytes integer NOT NULL,
  mime_type text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  rejection_reason text,
  reviewed_by uuid REFERENCES auth.users(id),
  reviewed_at timestamptz,
  internal_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_transfer_proofs_order ON transfer_proofs (order_id);
CREATE INDEX IF NOT EXISTS idx_transfer_proofs_status ON transfer_proofs (status);

ALTER TABLE transfer_proofs ENABLE ROW LEVEL SECURITY;

-- Owner or staff can view their proofs
CREATE POLICY "transfer_proofs_select_own" ON transfer_proofs
  FOR SELECT USING (
    uploaded_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM orders WHERE orders.id = transfer_proofs.order_id AND orders.user_id = auth.uid()
    )
    OR is_staff()
  );

-- Owner can insert proofs for their own orders
CREATE POLICY "transfer_proofs_insert_own" ON transfer_proofs
  FOR INSERT WITH CHECK (
    uploaded_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM orders WHERE orders.id = transfer_proofs.order_id AND orders.user_id = auth.uid()
    )
  );

-- Staff can update proofs (approve/reject)
CREATE POLICY "transfer_proofs_update_staff" ON transfer_proofs
  FOR UPDATE USING (is_staff());

-- ============================================================
-- 5. Guest order access tokens
-- ============================================================
CREATE TABLE IF NOT EXISTS guest_order_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  email text NOT NULL,
  access_token text NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  token_expires_at timestamptz NOT NULL DEFAULT (now() + interval '30 days'),
  access_count integer NOT NULL DEFAULT 0,
  last_accessed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_guest_access_token ON guest_order_access (access_token);
CREATE INDEX IF NOT EXISTS idx_guest_access_order ON guest_order_access (order_id);
CREATE INDEX IF NOT EXISTS idx_guest_access_email ON guest_order_access (lower(email));

ALTER TABLE guest_order_access ENABLE ROW LEVEL SECURITY;

-- Only staff can manage guest access tokens
CREATE POLICY "guest_access_select_staff" ON guest_order_access
  FOR SELECT USING (is_staff());

CREATE POLICY "guest_access_insert_staff" ON guest_order_access
  FOR INSERT WITH CHECK (is_staff());

CREATE POLICY "guest_access_update_staff" ON guest_order_access
  FOR UPDATE USING (is_staff());

-- ============================================================
-- 6. Order events timeline
-- ============================================================
CREATE TABLE IF NOT EXISTS order_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  actor_id uuid REFERENCES auth.users(id),
  actor_role user_role,
  payload jsonb DEFAULT '{}',
  internal_note text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_order_events_order ON order_events (order_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_events_type ON order_events (event_type);

ALTER TABLE order_events ENABLE ROW LEVEL SECURITY;

-- Owner can view events for their orders; staff can view all
CREATE POLICY "order_events_select" ON order_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders WHERE orders.id = order_events.order_id AND orders.user_id = auth.uid()
    )
    OR is_staff()
  );

-- Only staff can insert events
CREATE POLICY "order_events_insert_staff" ON order_events
  FOR INSERT WITH CHECK (is_staff());

-- ============================================================
-- 7. Function to link guest orders to a user account
-- ============================================================
CREATE OR REPLACE FUNCTION link_guest_orders_to_user(p_user_id uuid, p_email text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count integer;
BEGIN
  -- Only link orders where guest_email matches and no user_id is set
  UPDATE orders
  SET user_id = p_user_id, updated_at = now()
  WHERE lower(guest_email) = lower(p_email)
    AND user_id IS NULL;

  GET DIAGNOSTICS v_count = ROW_COUNT;

  -- Log the action
  INSERT INTO audit_logs (actor_id, actor_role, action, entity, metadata, created_at)
  VALUES (p_user_id, 'customer', 'guest_orders_linked', 'orders',
    jsonb_build_object('count', v_count, 'email', p_email), now());

  RETURN v_count;
END;
$$;

-- ============================================================
-- 8. Function to check and expire transfer orders
-- ============================================================
CREATE OR REPLACE FUNCTION expire_pending_transfers()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count integer;
BEGIN
  UPDATE orders
  SET status = 'transfer_expired',
      payment_status = 'cancelled',
      updated_at = now()
  WHERE payment_method = 'transfer'
    AND status = 'pending_payment'
    AND transfer_expires_at IS NOT NULL
    AND transfer_expires_at < now();

  GET DIAGNOSTICS v_count = ROW_COUNT;

  RETURN v_count;
END;
$$;

-- ============================================================
-- 9. Update RLS on orders for guest access
-- ============================================================
-- Drop existing select policy and recreate with guest support
DROP POLICY IF EXISTS "orders_select" ON orders;
CREATE POLICY "orders_select" ON orders
  FOR SELECT USING (
    user_id = auth.uid()
    OR is_staff()
  );

-- Allow inserting orders (both authenticated and via service role)
DROP POLICY IF EXISTS "orders_insert" ON orders;
CREATE POLICY "orders_insert" ON orders
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
    OR user_id IS NULL
    OR is_staff()
  );
