create extension if not exists pgcrypto;

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

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.user_role not null default 'customer',
  first_name text,
  last_name text,
  phone text,
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
  created_at timestamptz not null default now()
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

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  user_id uuid references auth.users(id) on delete set null,
  customer_snapshot jsonb not null,
  address_snapshot jsonb,
  delivery_method text not null check (delivery_method in ('shipping', 'digital', 'mixed', 'pickup')),
  notes text,
  subtotal_cents integer not null,
  product_discount_cents integer not null default 0,
  coupon_discount_cents integer not null default 0,
  shipping_cents integer not null default 0,
  total_cents integer not null,
  coupon_code text,
  status public.order_status not null default 'pending_payment',
  payment_status public.payment_status not null default 'pending',
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
  delivered_at timestamptz not null default now()
);

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
  actor_role public.user_role,
  action text not null,
  entity text not null,
  entity_id uuid,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_products_publication on public.products(publication_status);
create index if not exists idx_products_category_platform on public.products(category, platform);
create index if not exists idx_products_search on public.products using gin (to_tsvector('spanish', coalesce(name,'') || ' ' || coalesce(description,'') || ' ' || coalesce(sku,'')));
create index if not exists idx_orders_user on public.orders(user_id);
create index if not exists idx_orders_status on public.orders(status, payment_status);
create index if not exists idx_payment_events_provider on public.payment_events(provider, provider_event_id);

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

create policy "profiles own read" on public.profiles for select using (id = auth.uid() or public.is_staff());
create policy "profiles own update" on public.profiles for update using (id = auth.uid() or public.is_admin());

create policy "addresses own" on public.addresses for all using (user_id = auth.uid() or public.is_staff()) with check (user_id = auth.uid() or public.is_staff());

create policy "products public published" on public.products for select using (publication_status = 'published' or public.is_staff());
create policy "products admin write" on public.products for all using (public.is_admin()) with check (public.is_admin());
create policy "variants public published" on public.product_variants for select using (exists (select 1 from public.products p where p.id = product_id and (p.publication_status = 'published' or public.is_staff())));
create policy "variants admin write" on public.product_variants for all using (public.is_admin()) with check (public.is_admin());
create policy "images public published" on public.product_images for select using (exists (select 1 from public.products p where p.id = product_id and (p.publication_status = 'published' or public.is_staff())));
create policy "images admin write" on public.product_images for all using (public.is_admin()) with check (public.is_admin());

create policy "inventory staff" on public.inventory_movements for all using (public.is_staff()) with check (public.is_staff());

create policy "carts owner" on public.carts for all using (user_id = auth.uid() or public.is_staff()) with check (user_id = auth.uid() or public.is_staff());
create policy "cart items owner" on public.cart_items for all using (exists (select 1 from public.carts c where c.id = cart_id and (c.user_id = auth.uid() or public.is_staff()))) with check (exists (select 1 from public.carts c where c.id = cart_id and (c.user_id = auth.uid() or public.is_staff())));

create policy "favorites own" on public.favorites for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "orders own or staff" on public.orders for select using (user_id = auth.uid() or public.is_staff());
create policy "orders staff update" on public.orders for update using (public.is_staff());
create policy "order items own or staff" on public.order_items for select using (exists (select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or public.is_staff())));
create policy "order history own or staff" on public.order_status_history for select using (exists (select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or public.is_staff())));
create policy "order history staff write" on public.order_status_history for insert with check (public.is_staff());

create policy "payments staff or owner" on public.payments for select using (public.is_staff() or exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));
create policy "payment events staff" on public.payment_events for select using (public.is_staff());
create policy "shipments staff or owner" on public.shipments for select using (public.is_staff() or exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));
create policy "shipments staff write" on public.shipments for all using (public.is_staff()) with check (public.is_staff());
create policy "digital deliveries staff only" on public.digital_deliveries for all using (public.is_staff()) with check (public.is_staff());

create policy "coupons public active" on public.coupons for select using (active = true or public.is_staff());
create policy "coupons admin write" on public.coupons for all using (public.is_admin()) with check (public.is_admin());
create policy "coupon redemptions staff" on public.coupon_redemptions for select using (public.is_staff());

create policy "banners public active" on public.banners for select using (active = true or public.is_staff());
create policy "banners admin write" on public.banners for all using (public.is_admin()) with check (public.is_admin());
create policy "settings staff" on public.store_settings for select using (public.is_staff());
create policy "settings admin write" on public.store_settings for all using (public.is_admin()) with check (public.is_admin());
create policy "audit staff" on public.audit_logs for select using (public.is_staff());
