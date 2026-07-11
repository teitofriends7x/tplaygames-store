insert into public.banners (title, body, cta_label, href, active)
values (
  'Juga mas. Paga menos.',
  'Banner demo de T.PlayGames. Reemplazar desde administracion antes de lanzar.',
  'Ver catalogo',
  '/catalogo',
  true
) on conflict do nothing;

insert into public.coupons (
  code,
  type,
  value,
  min_purchase_cents,
  starts_at,
  ends_at,
  total_limit,
  per_customer_limit,
  active
) values (
  'DEMO10',
  'percentage',
  10,
  1000000,
  now() - interval '1 day',
  now() + interval '180 days',
  1000,
  1,
  true
) on conflict (code) do nothing;

-- Los productos demo se cargan desde la app local para no confundirlos con
-- publicaciones reales. Si se desean en Supabase, insertarlos marcando demo=true.
