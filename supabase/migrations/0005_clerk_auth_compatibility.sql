-- Clerk replaces Supabase Auth. Existing UUID ownership columns remain intact so
-- historical orders keep their original relationship with auth.users.

alter table public.orders
  add column if not exists clerk_user_id text;

create index if not exists idx_orders_clerk_user
  on public.orders (clerk_user_id)
  where clerk_user_id is not null;

alter table public.transfer_proofs
  add column if not exists uploaded_by_clerk_user_id text,
  add column if not exists reviewed_by_clerk_user_id text;

alter table public.order_events
  add column if not exists actor_clerk_user_id text;

alter table public.order_status_history
  add column if not exists actor_clerk_user_id text;

alter table public.digital_deliveries
  add column if not exists delivered_by_clerk_user_id text;

alter table public.audit_logs
  add column if not exists actor_clerk_user_id text;

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

create unique index if not exists idx_clerk_profiles_email
  on public.clerk_profiles (lower(email));

create table if not exists public.clerk_favorites (
  clerk_user_id text not null,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (clerk_user_id, product_id)
);

alter table public.clerk_profiles enable row level security;
alter table public.clerk_favorites enable row level security;

-- These tables are intentionally service-role only. Clerk authorization is
-- validated in Next.js before the server writes through Supabase Admin.

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
