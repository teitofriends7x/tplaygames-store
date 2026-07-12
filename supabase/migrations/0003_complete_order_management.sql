-- 0003_complete_order_management.sql
-- Completes order management, private transfer proofs and account support.
-- Non destructive: only adds missing states, columns, policies, indexes and helpers.

ALTER TYPE public.order_status ADD VALUE IF NOT EXISTS 'transfer_proof_submitted';

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS default_address_id uuid;

ALTER TABLE public.addresses
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

ALTER TABLE public.transfer_proofs
  ADD COLUMN IF NOT EXISTS original_file_name text,
  ADD COLUMN IF NOT EXISTS uploaded_by_role public.user_role,
  ADD COLUMN IF NOT EXISTS uploaded_ip text;

ALTER TABLE public.transfer_proofs
  DROP CONSTRAINT IF EXISTS transfer_proofs_file_size_max,
  ADD CONSTRAINT transfer_proofs_file_size_max CHECK (file_size_bytes > 0 AND file_size_bytes <= 10485760);

ALTER TABLE public.transfer_proofs
  DROP CONSTRAINT IF EXISTS transfer_proofs_mime_type_allowed,
  ADD CONSTRAINT transfer_proofs_mime_type_allowed CHECK (mime_type IN ('image/jpeg', 'image/png', 'application/pdf'));

CREATE INDEX IF NOT EXISTS idx_transfer_proofs_created_at ON public.transfer_proofs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON public.orders (payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON public.orders (lower((customer_snapshot->>'email')));

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'transfer-proofs',
  'transfer-proofs',
  false,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'application/pdf'];

DROP POLICY IF EXISTS "transfer_proofs_storage_staff_read" ON storage.objects;
CREATE POLICY "transfer_proofs_storage_staff_read" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'transfer-proofs'
    AND public.is_staff()
  );

DROP POLICY IF EXISTS "transfer_proofs_storage_staff_write" ON storage.objects;
CREATE POLICY "transfer_proofs_storage_staff_write" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'transfer-proofs'
    AND public.is_staff()
  );

DROP POLICY IF EXISTS "transfer_proofs_storage_staff_update" ON storage.objects;
CREATE POLICY "transfer_proofs_storage_staff_update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'transfer-proofs'
    AND public.is_staff()
  );

DROP POLICY IF EXISTS "transfer_proofs_storage_staff_delete" ON storage.objects;
CREATE POLICY "transfer_proofs_storage_staff_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'transfer-proofs'
    AND public.is_admin()
  );

CREATE OR REPLACE FUNCTION public.link_guest_orders_to_user(p_user_id uuid, p_email text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count integer;
BEGIN
  IF auth.uid() IS NULL AND coalesce(current_setting('request.jwt.claim.role', true), '') <> 'service_role' THEN
    RAISE EXCEPTION 'not allowed';
  END IF;

  IF auth.uid() IS NOT NULL AND auth.uid() <> p_user_id AND NOT public.is_staff() THEN
    RAISE EXCEPTION 'not allowed';
  END IF;

  UPDATE public.orders
  SET user_id = p_user_id, updated_at = now()
  WHERE lower(coalesce(guest_email, customer_snapshot->>'email')) = lower(p_email)
    AND user_id IS NULL;

  GET DIAGNOSTICS v_count = ROW_COUNT;

  INSERT INTO public.audit_logs (actor_id, actor_role, action, entity, metadata, created_at)
  VALUES (p_user_id, 'customer', 'guest_orders_linked', 'orders',
    jsonb_build_object('count', v_count, 'email', p_email), now());

  INSERT INTO public.order_events (order_id, event_type, actor_id, actor_role, payload, internal_note)
  SELECT id, 'guest_order_linked', p_user_id, 'customer',
    jsonb_build_object('email', p_email),
    'Pedido invitado vinculado a cuenta.'
  FROM public.orders
  WHERE user_id = p_user_id
    AND lower(coalesce(guest_email, customer_snapshot->>'email')) = lower(p_email);

  RETURN v_count;
END;
$$;

DROP POLICY IF EXISTS "transfer_proofs_insert_own" ON public.transfer_proofs;
CREATE POLICY "transfer_proofs_insert_own" ON public.transfer_proofs
  FOR INSERT WITH CHECK (
    uploaded_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = transfer_proofs.order_id
        AND orders.user_id = auth.uid()
    )
    OR public.is_staff()
  );

DROP POLICY IF EXISTS "order_events_insert_staff" ON public.order_events;
CREATE POLICY "order_events_insert_staff" ON public.order_events
  FOR INSERT WITH CHECK (public.is_staff());
