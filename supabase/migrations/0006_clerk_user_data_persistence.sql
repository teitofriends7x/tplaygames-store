-- 0006_clerk_user_data_persistence.sql
-- Persistent cart and favorites for Clerk users

-- Customer carts table
create table if not exists public.customer_carts (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists idx_customer_carts_clerk_user
  on public.customer_carts (clerk_user_id);

-- Customer cart items table
create table if not exists public.customer_cart_items (
  cart_id uuid not null references public.customer_carts(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  variant_id uuid references public.product_variants(id) on delete cascade,
  quantity integer not null default 1 check (quantity > 0 and quantity <= 99),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (cart_id, product_id, variant_id)
);

create index if not exists idx_customer_cart_items_cart
  on public.customer_cart_items (cart_id);

-- Enable RLS (service-role only access, validated in Next.js)
alter table public.customer_carts enable row level security;
alter table public.customer_cart_items enable row level security;

-- Function to upsert cart items (merge logic)
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

-- Function to clear cart
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
