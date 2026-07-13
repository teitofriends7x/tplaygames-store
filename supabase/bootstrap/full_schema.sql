-- ============================================================================
-- T.PlayGames - Full Database Schema
-- Consolidated from migrations 0001-0006
-- Safe to run on empty database or existing database
-- Idempotent: can be run multiple times without errors
-- ============================================================================

-- Enable required extensions
create extension if not exists pgcrypto;

-- ============================================================================
-- ENUMS
-- ============================================================================

do $$ begin
  create type public.user_role as enum ('customer', 'operator', 'admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.product_category as enum ('Consolas', 'Controles', 'Juegos');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.platform_name as enum ('PlayStation', 'Xbox', 'Nintendo', 'PC');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.product_type as enum ('physical', 'digital');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.product_condition as enum ('new', 'used', 'refurbished');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.publication_status as enum ('draft', 'published', 'paused', 'deleted');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.order_status as enum (
    'draft',
    'pending_payment',
    'payment_review',
    'transfer_receipt_received',
    'transfer_under_review',
    'transfer_expired',
    'transfer_proof_submitted',
    'paid',
    'preparing',
    'ready_for_pickup',
    'shipped',
    'delivered',
    'digital_delivery_pending',
    'digital_delivery_done',
    'cancelled',
    'refunded'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.payment_status as enum ('pending', 'approved', 'rejected', 'cancelled', 'refunded');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.payment_method as enum ('mercadopago', 'transfer');
exception when duplicate_object then null; end $$;

-- ============================================================================
-- CORE TABLES
-- ============================================================================

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.user_role not null default 'customer',
  first_name text,
  last_name text,
  phone text,
  avatar_url text,
  default_address_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.roles (
  name public.user_role primary key,
  description text not null
);

insert into public.roles (name, description) values
  ('customer', 'Cliente'),
  ('operator', 'Operador'),
  ('admin', 'Administrador')
on conflict (name) do nothing;

create table if not exists public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text not null default 'Principal',
  street text not null,
  city text not null,
  province text not null,
  postal_code text not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name public.product_category not null unique,
  slug text not null unique,
  active boolean not null default true
);

create table if not exists public.platforms (
  id uuid primary key default gen_random_uuid(),
  name public.platform_name not null unique,
  active boolean not null default true
);

insert into public.categories (name, slug) values
  ('Consolas', 'consolas'),
  ('Controles', 'controles'),
  ('Juegos', 'juegos')
on conflict (name) do nothing;

insert into public.platforms (name) values
  ('PlayStation'),
  ('Xbox'),
  ('Nintendo'),
  ('PC')
on conflict (name) do nothing;

-- ============================================================================
-- PRODUCTS
-- ============================================================================

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  short_description text not null,
  description text not null,
  category public.product_category not null,
  platform public.platform_name,
  type public.product_type not null,
  condition public.product_condition not null,
  brand text not null,
  model text not null,
  price_cents integer not null check (price_cents > 0),
  promo_price_cents integer check (promo_price_cents is null or promo_price_cents > 0),
  internal_cost_cents integer,
  sku text not null unique,
  stock integer not null default 0 check (stock >= 0),
  low_stock_threshold integer not null default 0 check (low_stock_threshold >= 0),
  warranty text,
  delivery_terms text,
  publication_status public.publication_status not null default 'draft',
  featured boolean not null default false,
  offer boolean not null default false,
  seo_title text,
  seo_description text,
  demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  sku text not null unique,
  label text not null,
  color text,
  capacity text,
  edition text,
  platform public.platform_name,
  format public.product_type,
  condition public.product_condition,
  region text,
  price_cents integer check (price_cents is null or price_cents > 0),
  stock integer not null default 0 check (stock >= 0),
  image_url text,
  available boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  url text not null,
  alt text not null,
  position integer not null default 0,
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.inventory_movements (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete set null,
  variant_id uuid references public.product_variants(id) on delete set null,
  delta integer not null,
  reason text not null,
  actor_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

-- ============================================================================
-- CARTS & FAVORITES (Legacy - Supabase Auth)
-- ============================================================================

create table if not exists public.carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  guest_id text,
  coupon_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (user_id is not null or guest_id is not null)
);

create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references public.carts(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  variant_id uuid references public.product_variants(id) on delete restrict,
  quantity integer not null check (quantity > 0),
  created_at timestamptz not null default now()
);

create table if not exists public.favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

-- ============================================================================
-- ORDERS
-- ============================================================================

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  user_id uuid references auth.users(id) on delete set null,
  clerk_user_id text,
  customer_snapshot jsonb not null,
  address_snapshot jsonb,
  delivery_method text not null check (delivery_method in ('shipping', 'digital', 'mixed', 'pickup')),
  payment_method public.payment_method default 'mercadopago',
  notes text,
  subtotal_cents integer not null,
  product_discount_cents integer not null default 0,
  coupon_discount_cents integer not null default 0,
  shipping_cents integer not null default 0,
  total_cents integer not null,
  coupon_code text,
  status public.order_status not null default 'pending_payment',
  payment_status public.payment_status not null default 'pending',
  transfer_expires_at timestamptz,
  public_order_number text,
  guest_email text,
  guest_phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid,
  variant_id uuid,
  product_name text not null,
  variant_label text,
  sku text not null,
  category public.product_category not null,
  platform public.platform_name,
  type public.product_type not null,
  unit_price_cents integer not null,
  original_unit_price_cents integer not null,
  quantity integer not null check (quantity > 0),
  discount_cents integer not null default 0,
  total_cents integer not null
);

create table if not exists public.order_status_history (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  status public.order_status not null,
  actor_id uuid references auth.users(id) on delete set null,
  actor_clerk_user_id text,
  actor_role public.user_role,
  internal_comment text,
  created_at timestamptz not null default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  provider text not null,
  provider_payment_id text,
  provider_preference_id text,
  status public.payment_status not null,
  amount_cents integer not null,
  raw_event_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider, provider_payment_id)
);

create table if not exists public.payment_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  provider_event_id text not null,
  event_type text not null,
  processed_at timestamptz,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (provider, provider_event_id)
);

create table if not exists public.shipments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references public.orders(id) on delete cascade,
  carrier text,
  tracking_number text,
  tracking_url text,
  shipped_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.digital_deliveries (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references public.orders(id) on delete cascade,
  secure_reference text not null,
  internal_note text not null,
  channel text not null check (channel in ('email', 'whatsapp', 'manual')),
  delivered_by uuid references auth.users(id) on delete set null,
  delivered_by_clerk_user_id text,
  delivered_at timestamptz not null default now()
);

-- ============================================================================
-- TRANSFER PROOFS
-- ============================================================================

create table if not exists public.transfer_proofs (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  uploaded_by uuid references auth.users(id),
  uploaded_by_clerk_user_id text,
  uploaded_by_role public.user_role,
  uploaded_ip text,
  guest_email text,
  storage_path text not null,
  file_name text not null,
  original_file_name text,
  file_size_bytes integer not null,
  mime_type text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  rejection_reason text,
  reviewed_by uuid references auth.users(id),
  reviewed_by_clerk_user_id text,
  reviewed_at timestamptz,
  internal_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint transfer_proofs_file_size_max check (file_size_bytes > 0 and file_size_bytes <= 10485760),
  constraint transfer_proofs_mime_type_allowed check (mime_type in ('image/jpeg', 'image/png', 'application/pdf'))
);

-- ============================================================================
-- ORDER EVENTS & GUEST ACCESS
-- ============================================================================

create table if not exists public.order_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  event_type text not null,
  actor_id uuid references auth.users(id),
  actor_clerk_user_id text,
  actor_role public.user_role,
  payload jsonb default '{}',
  internal_note text,
  created_at timestamptz not null default now()
);

create table if not exists public.guest_order_access (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  email text not null,
  access_token text not null default encode(gen_random_bytes(32), 'hex'),
  token_expires_at timestamptz not null default (now() + interval '30 days'),
  access_count integer not null default 0,
  last_accessed_at timestamptz,
  created_at timestamptz not null default now()
);

-- ============================================================================
-- COUPONS & BANNERS
-- ============================================================================

create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  type text not null check (type in ('percentage', 'fixed')),
  value integer not null,
  min_purchase_cents integer not null default 0,
  starts_at timestamptz not null,
  ends_at timestamptz,
  total_limit integer,
  per_customer_limit integer,
  applicable_categories public.product_category[],
  applicable_products uuid[],
  first_purchase_only boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.coupon_redemptions (
  id uuid primary key default gen_random_uuid(),
  coupon_id uuid not null references public.coupons(id) on delete cascade,
  order_id uuid not null references public.orders(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  redeemed_at timestamptz not null default now(),
  unique (coupon_id, order_id)
);

create table if not exists public.banners (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  cta_label text not null,
  href text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.store_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  actor_clerk_user_id text,
  actor_role public.user_role,
  action text not null,
  entity text not null,
  entity_id uuid,
  metadata jsonb,
  created_at timestamptz not null default now()
);

-- ============================================================================
-- CLERK INTEGRATION
-- ============================================================================

create table if not exists public.clerk_profiles (
  clerk_user_id text primary key,
  email text not null,
  first_name text,
  last_name text,
  phone text,
  street text,
  city text,
  province text,
  postal_code text,
  address_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.clerk_favorites (
  clerk_user_id text not null,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (clerk_user_id, product_id)
);

create table if not exists public.customer_carts (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.customer_cart_items (
  cart_id uuid not null references public.customer_carts(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  variant_id uuid references public.product_variants(id) on delete cascade,
  quantity integer not null default 1 check (quantity > 0 and quantity <= 99),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (cart_id, product_id, variant_id)
);

-- ============================================================================
-- INDEXES
-- ============================================================================

create index if not exists idx_products_publication on public.products(publication_status);
create index if not exists idx_products_category_platform on public.products(category, platform);
create index if not exists idx_products_search on public.products using gin (to_tsvector('spanish', coalesce(name,'') || ' ' || coalesce(description,'') || ' ' || coalesce(sku,'')));
create index if not exists idx_orders_user on public.orders(user_id);
create index if not exists idx_orders_clerk_user on public.orders(clerk_user_id) where clerk_user_id is not null;
create index if not exists idx_orders_status on public.orders(status, payment_status);
create index if not exists idx_orders_payment_status on public.orders(payment_status);
create index if not exists idx_orders_payment_method on public.orders(payment_method);
create index if not exists idx_orders_created_at on public.orders(created_at desc);
create index if not exists idx_orders_customer_email on public.orders(lower((customer_snapshot->>'email')));
create index if not exists idx_orders_guest_email on public.orders(lower(guest_email)) where user_id is null;
create index if not exists idx_orders_transfer_expires on public.orders(transfer_expires_at) where transfer_expires_at is not null;
create unique index if not exists idx_orders_public_number on public.orders(public_order_number);
create index if not exists idx_payment_events_provider on public.payment_events(provider, provider_event_id);
create index if not exists idx_transfer_proofs_order on public.transfer_proofs(order_id);
create index if not exists idx_transfer_proofs_status on public.transfer_proofs(status);
create index if not exists idx_transfer_proofs_created_at on public.transfer_proofs(created_at desc);
create index if not exists idx_order_events_order on public.order_events(order_id, created_at desc);
create index if not exists idx_order_events_type on public.order_events(event_type);
create unique index if not exists idx_guest_access_token on public.guest_order_access(access_token);
create index if not exists idx_guest_access_order on public.guest_order_access(order_id);
create index if not exists idx_guest_access_email on public.guest_order_access(lower(email));
create unique index if not exists idx_clerk_profiles_email on public.clerk_profiles(lower(email));
create unique index if not exists idx_customer_carts_clerk_user on public.customer_carts(clerk_user_id);
create index if not exists idx_customer_cart_items_cart on public.customer_cart_items(cart_id);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and role in ('admin', 'operator')
  );
$$;

create or replace function public.claim_first_admin()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'auth required';
  end if;

  if exists (select 1 from public.profiles where role = 'admin') then
    raise exception 'admin already exists';
  end if;

  insert into public.profiles (id, role)
  values (auth.uid(), 'admin')
  on conflict (id) do update set role = 'admin', updated_at = now();
end;
$$;

-- ============================================================================
-- ORDER MANAGEMENT FUNCTIONS
-- ============================================================================

create or replace function public.link_guest_orders_to_user(p_user_id uuid, p_email text)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  if auth.uid() is null and coalesce(current_setting('request.jwt.claim.role', true), '') <> 'service_role' then
    raise exception 'not allowed';
  end if;

  if auth.uid() is not null and auth.uid() <> p_user_id and not public.is_staff() then
    raise exception 'not allowed';
  end if;

  update public.orders
  set user_id = p_user_id, updated_at = now()
  where lower(coalesce(guest_email, customer_snapshot->>'email')) = lower(p_email)
    and user_id is null;

  get diagnostics v_count = row_count;

  insert into public.audit_logs (actor_id, actor_role, action, entity, metadata, created_at)
  values (p_user_id, 'customer', 'guest_orders_linked', 'orders',
    jsonb_build_object('count', v_count, 'email', p_email), now());

  insert into public.order_events (order_id, event_type, actor_id, actor_role, payload, internal_note)
  select id, 'guest_order_linked', p_user_id, 'customer',
    jsonb_build_object('email', p_email),
    'Pedido invitado vinculado a cuenta.'
  from public.orders
  where user_id = p_user_id
    and lower(coalesce(guest_email, customer_snapshot->>'email')) = lower(p_email);

  return v_count;
end;
$$;

create or replace function public.link_guest_orders_to_clerk_user(
  p_clerk_user_id text,
  p_email text
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  linked_count integer;
begin
  if nullif(trim(p_clerk_user_id), '') is null
    or nullif(trim(p_email), '') is null then
    raise exception 'Clerk user id and email are required';
  end if;

  update public.orders
  set clerk_user_id = p_clerk_user_id,
      updated_at = now()
  where clerk_user_id is null
    and lower(coalesce(guest_email, customer_snapshot ->> 'email', '')) =
      lower(trim(p_email));

  get diagnostics linked_count = row_count;

  insert into public.order_events (
    order_id,
    event_type,
    actor_clerk_user_id,
    actor_role,
    payload,
    internal_note
  )
  select
    id,
    'guest_order_linked',
    p_clerk_user_id,
    'customer',
    jsonb_build_object('email', lower(trim(p_email))),
    'Pedido vinculado a una cuenta Clerk por coincidencia de email verificado.'
  from public.orders
  where clerk_user_id = p_clerk_user_id
    and lower(coalesce(guest_email, customer_snapshot ->> 'email', '')) =
      lower(trim(p_email))
    and not exists (
      select 1
      from public.order_events event
      where event.order_id = orders.id
        and event.event_type = 'guest_order_linked'
        and event.actor_clerk_user_id = p_clerk_user_id
    );

  return linked_count;
end;
$$;

revoke all on function public.link_guest_orders_to_clerk_user(text, text)
  from public, anon, authenticated;
grant execute on function public.link_guest_orders_to_clerk_user(text, text)
  to service_role;

create or replace function public.expire_pending_transfers()
returns integer
language plpgsql
security definer
as $$
declare
  v_count integer;
begin
  update public.orders
  set status = 'transfer_expired',
      payment_status = 'cancelled',
      updated_at = now()
  where payment_method = 'transfer'
    and status = 'pending_payment'
    and transfer_expires_at is not null
    and transfer_expires_at < now();

  get diagnostics v_count = row_count;

  return v_count;
end;
$$;

-- ============================================================================
-- CART MANAGEMENT FUNCTIONS
-- ============================================================================

create or replace function public.upsert_cart_items(
  p_clerk_user_id text,
  p_items jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_cart_id uuid;
  v_item jsonb;
begin
  if nullif(trim(p_clerk_user_id), '') is null then
    raise exception 'Clerk user id is required';
  end if;

  -- Get or create cart
  insert into public.customer_carts (clerk_user_id)
  values (p_clerk_user_id)
  on conflict (clerk_user_id) do update set updated_at = now()
  returning id into v_cart_id;

  -- Clear existing items
  delete from public.customer_cart_items where cart_id = v_cart_id;

  -- Insert new items
  for v_item in select * from jsonb_array_elements(p_items)
  loop
    insert into public.customer_cart_items (cart_id, product_id, variant_id, quantity)
    values (
      v_cart_id,
      (v_item->>'productId')::uuid,
      nullif(v_item->>'variantId', '')::uuid,
      least(99, greatest(1, (v_item->>'quantity')::integer))
    );
  end loop;

  -- Update cart timestamp
  update public.customer_carts set updated_at = now() where id = v_cart_id;
end;
$$;

revoke all on function public.upsert_cart_items(text, jsonb)
  from public, anon, authenticated;
grant execute on function public.upsert_cart_items(text, jsonb)
  to service_role;

create or replace function public.clear_cart(p_clerk_user_id text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.customer_carts where clerk_user_id = p_clerk_user_id;
end;
$$;

revoke all on function public.clear_cart(text)
  from public, anon, authenticated;
grant execute on function public.clear_cart(text)
  to service_role;

-- ============================================================================
-- AUTH TRIGGER
-- ============================================================================

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    role,
    first_name,
    last_name,
    phone,
    avatar_url,
    created_at,
    updated_at
  )
  values (
    new.id,
    'customer',
    coalesce(new.raw_user_meta_data->>'first_name', new.raw_user_meta_data->>'given_name'),
    coalesce(new.raw_user_meta_data->>'last_name', new.raw_user_meta_data->>'family_name'),
    nullif(new.raw_user_meta_data->>'phone', ''),
    nullif(new.raw_user_meta_data->>'avatar_url', ''),
    now(),
    now()
  )
  on conflict (id) do update set
    first_name = coalesce(public.profiles.first_name, excluded.first_name),
    last_name = coalesce(public.profiles.last_name, excluded.last_name),
    phone = coalesce(public.profiles.phone, excluded.phone),
    avatar_url = coalesce(public.profiles.avatar_url, excluded.avatar_url),
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert or update of raw_user_meta_data on auth.users
  for each row execute function public.handle_new_auth_user();

-- Backfill existing auth users
insert into public.profiles (
  id,
  role,
  first_name,
  last_name,
  phone,
  avatar_url,
  created_at,
  updated_at
)
select
  id,
  'customer',
  coalesce(raw_user_meta_data->>'first_name', raw_user_meta_data->>'given_name'),
  coalesce(raw_user_meta_data->>'last_name', raw_user_meta_data->>'family_name'),
  nullif(raw_user_meta_data->>'phone', ''),
  nullif(raw_user_meta_data->>'avatar_url', ''),
  created_at,
  now()
from auth.users
on conflict (id) do nothing;

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

alter table public.profiles enable row level security;
alter table public.addresses enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.product_images enable row level security;
alter table public.inventory_movements enable row level security;
alter table public.carts enable row level security;
alter table public.cart_items enable row level security;
alter table public.favorites enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_status_history enable row level security;
alter table public.payments enable row level security;
alter table public.payment_events enable row level security;
alter table public.shipments enable row level security;
alter table public.digital_deliveries enable row level security;
alter table public.coupons enable row level security;
alter table public.coupon_redemptions enable row level security;
alter table public.banners enable row level security;
alter table public.store_settings enable row level security;
alter table public.audit_logs enable row level security;
alter table public.transfer_proofs enable row level security;
alter table public.order_events enable row level security;
alter table public.guest_order_access enable row level security;
alter table public.clerk_profiles enable row level security;
alter table public.clerk_favorites enable row level security;
alter table public.customer_carts enable row level security;
alter table public.customer_cart_items enable row level security;

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- Profiles
drop policy if exists "profiles own read" on public.profiles;
create policy "profiles own read" on public.profiles for select using (id = auth.uid() or public.is_staff());

drop policy if exists "profiles own update" on public.profiles;
create policy "profiles own update" on public.profiles for update using (id = auth.uid() or public.is_admin());

drop policy if exists "profiles own insert" on public.profiles;
create policy "profiles own insert" on public.profiles for insert with check (id = auth.uid());

-- Addresses
drop policy if exists "addresses own" on public.addresses;
create policy "addresses own" on public.addresses for all using (user_id = auth.uid() or public.is_staff()) with check (user_id = auth.uid() or public.is_staff());

-- Products
drop policy if exists "products public published" on public.products;
create policy "products public published" on public.products for select using (publication_status = 'published' or public.is_staff());

drop policy if exists "products admin write" on public.products;
create policy "products admin write" on public.products for all using (public.is_admin()) with check (public.is_admin());

-- Product Variants
drop policy if exists "variants public published" on public.product_variants;
create policy "variants public published" on public.product_variants for select using (exists (select 1 from public.products p where p.id = product_id and (p.publication_status = 'published' or public.is_staff())));

drop policy if exists "variants admin write" on public.product_variants;
create policy "variants admin write" on public.product_variants for all using (public.is_admin()) with check (public.is_admin());

-- Product Images
drop policy if exists "images public published" on public.product_images;
create policy "images public published" on public.product_images for select using (exists (select 1 from public.products p where p.id = product_id and (p.publication_status = 'published' or public.is_staff())));

drop policy if exists "images admin write" on public.product_images;
create policy "images admin write" on public.product_images for all using (public.is_admin()) with check (public.is_admin());

-- Inventory
drop policy if exists "inventory staff" on public.inventory_movements;
create policy "inventory staff" on public.inventory_movements for all using (public.is_staff()) with check (public.is_staff());

-- Carts
drop policy if exists "carts owner" on public.carts;
create policy "carts owner" on public.carts for all using (user_id = auth.uid() or public.is_staff()) with check (user_id = auth.uid() or public.is_staff());

drop policy if exists "cart items owner" on public.cart_items;
create policy "cart items owner" on public.cart_items for all using (exists (select 1 from public.carts c where c.id = cart_id and (c.user_id = auth.uid() or public.is_staff()))) with check (exists (select 1 from public.carts c where c.id = cart_id and (c.user_id = auth.uid() or public.is_staff())));

-- Favorites
drop policy if exists "favorites own" on public.favorites;
create policy "favorites own" on public.favorites for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Orders
drop policy if exists "orders own or staff" on public.orders;
create policy "orders own or staff" on public.orders for select using (user_id = auth.uid() or public.is_staff());

drop policy if exists "orders staff update" on public.orders;
create policy "orders staff update" on public.orders for update using (public.is_staff());

drop policy if exists "orders_select" on public.orders;
create policy "orders_select" on public.orders for select using (user_id = auth.uid() or public.is_staff());

drop policy if exists "orders_insert" on public.orders;
create policy "orders_insert" on public.orders for insert with check (user_id = auth.uid() or user_id is null or public.is_staff());

-- Order Items
drop policy if exists "order items own or staff" on public.order_items;
create policy "order items own or staff" on public.order_items for select using (exists (select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or public.is_staff())));

-- Order Status History
drop policy if exists "order history own or staff" on public.order_status_history;
create policy "order history own or staff" on public.order_status_history for select using (exists (select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or public.is_staff())));

drop policy if exists "order history staff write" on public.order_status_history;
create policy "order history staff write" on public.order_status_history for insert with check (public.is_staff());

-- Payments
drop policy if exists "payments staff or owner" on public.payments;
create policy "payments staff or owner" on public.payments for select using (public.is_staff() or exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));

-- Payment Events
drop policy if exists "payment events staff" on public.payment_events;
create policy "payment events staff" on public.payment_events for select using (public.is_staff());

-- Shipments
drop policy if exists "shipments staff or owner" on public.shipments;
create policy "shipments staff or owner" on public.shipments for select using (public.is_staff() or exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));

drop policy if exists "shipments staff write" on public.shipments;
create policy "shipments staff write" on public.shipments for all using (public.is_staff()) with check (public.is_staff());

-- Digital Deliveries
drop policy if exists "digital deliveries staff only" on public.digital_deliveries;
create policy "digital deliveries staff only" on public.digital_deliveries for all using (public.is_staff()) with check (public.is_staff());

-- Coupons
drop policy if exists "coupons public active" on public.coupons;
create policy "coupons public active" on public.coupons for select using (active = true or public.is_staff());

drop policy if exists "coupons admin write" on public.coupons;
create policy "coupons admin write" on public.coupons for all using (public.is_admin()) with check (public.is_admin());

-- Coupon Redemptions
drop policy if exists "coupon redemptions staff" on public.coupon_redemptions;
create policy "coupon redemptions staff" on public.coupon_redemptions for select using (public.is_staff());

-- Banners
drop policy if exists "banners public active" on public.banners;
create policy "banners public active" on public.banners for select using (active = true or public.is_staff());

drop policy if exists "banners admin write" on public.banners;
create policy "banners admin write" on public.banners for all using (public.is_admin()) with check (public.is_admin());

-- Store Settings
drop policy if exists "settings staff" on public.store_settings;
create policy "settings staff" on public.store_settings for select using (public.is_staff());

drop policy if exists "settings admin write" on public.store_settings;
create policy "settings admin write" on public.store_settings for all using (public.is_admin()) with check (public.is_admin());

-- Audit Logs
drop policy if exists "audit staff" on public.audit_logs;
create policy "audit staff" on public.audit_logs for select using (public.is_staff());

-- Transfer Proofs
drop policy if exists "transfer_proofs_select_own" on public.transfer_proofs;
create policy "transfer_proofs_select_own" on public.transfer_proofs
  for select using (
    uploaded_by = auth.uid()
    or exists (
      select 1 from public.orders where orders.id = transfer_proofs.order_id and orders.user_id = auth.uid()
    )
    or public.is_staff()
  );

drop policy if exists "transfer_proofs_insert_own" on public.transfer_proofs;
create policy "transfer_proofs_insert_own" on public.transfer_proofs
  for insert with check (
    uploaded_by = auth.uid()
    or exists (
      select 1 from public.orders
      where orders.id = transfer_proofs.order_id
        and orders.user_id = auth.uid()
    )
    or public.is_staff()
  );

drop policy if exists "transfer_proofs_update_staff" on public.transfer_proofs;
create policy "transfer_proofs_update_staff" on public.transfer_proofs
  for update using (public.is_staff());

-- Order Events
drop policy if exists "order_events_select" on public.order_events;
create policy "order_events_select" on public.order_events
  for select using (
    exists (
      select 1 from public.orders where orders.id = order_events.order_id and orders.user_id = auth.uid()
    )
    or public.is_staff()
  );

drop policy if exists "order_events_insert_staff" on public.order_events;
create policy "order_events_insert_staff" on public.order_events
  for insert with check (public.is_staff());

-- Guest Order Access
drop policy if exists "guest_access_select_staff" on public.guest_order_access;
create policy "guest_access_select_staff" on public.guest_order_access
  for select using (public.is_staff());

drop policy if exists "guest_access_insert_staff" on public.guest_order_access;
create policy "guest_access_insert_staff" on public.guest_order_access
  for insert with check (public.is_staff());

drop policy if exists "guest_access_update_staff" on public.guest_order_access;
create policy "guest_access_update_staff" on public.guest_order_access
  for update using (public.is_staff());

-- ============================================================================
-- STORAGE BUCKET
-- ============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'transfer-proofs',
  'transfer-proofs',
  false,
  10485760,
  array['image/jpeg', 'image/png', 'application/pdf']
)
on conflict (id) do update set
  public = false,
  file_size_limit = 10485760,
  allowed_mime_types = array['image/jpeg', 'image/png', 'application/pdf'];

-- Storage policies
drop policy if exists "transfer_proofs_storage_staff_read" on storage.objects;
create policy "transfer_proofs_storage_staff_read" on storage.objects
  for select using (
    bucket_id = 'transfer-proofs'
    and public.is_staff()
  );

drop policy if exists "transfer_proofs_storage_staff_write" on storage.objects;
create policy "transfer_proofs_storage_staff_write" on storage.objects
  for insert with check (
    bucket_id = 'transfer-proofs'
    and public.is_staff()
  );

drop policy if exists "transfer_proofs_storage_staff_update" on storage.objects;
create policy "transfer_proofs_storage_staff_update" on storage.objects
  for update using (
    bucket_id = 'transfer-proofs'
    and public.is_staff()
  );

drop policy if exists "transfer_proofs_storage_staff_delete" on storage.objects;
create policy "transfer_proofs_storage_staff_delete" on storage.objects
  for delete using (
    bucket_id = 'transfer-proofs'
    and public.is_admin()
  );

-- ============================================================================
-- COMPLETE
-- ============================================================================
