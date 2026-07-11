insert into public.banners (title, body, cta_label, href, active)
values (
  'Juga mas. Paga menos.',
  'Catalogo gamer seed con productos reales verificados. Reemplazar condiciones comerciales antes de vender.',
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

-- Catalogo local fase 3:
-- Los productos seed se cargan desde src/lib/demo-data.ts para desarrollo sin
-- credenciales. Reemplazan los 9 productos genericos anteriores por nombres
-- reales, slugs/SKUs unicos e imagenes oficiales documentadas en
-- docs/PRODUCT_ASSETS_SOURCES.md.
--
-- Precios, stock, garantias y condiciones de entrega son valores temporales de
-- prueba. Si se importan a Supabase antes de produccion, mantener demo=true
-- hasta que un responsable comercial confirme precios y disponibilidad reales.
--
-- Productos seed actuales:
-- playstation-5-slim-digital-edition
-- playstation-5-slim-standard-edition-lectora
-- playstation-5-pro
-- xbox-series-s-512-gb
-- xbox-series-s-1-tb
-- xbox-series-x-1-tb
-- nintendo-switch-oled
-- nintendo-switch-lite
-- nintendo-switch-2
-- dualsense-wireless-controller-blanco
-- dualsense-wireless-controller-midnight-black
-- dualsense-wireless-controller-cosmic-red
-- dualsense-edge-wireless-controller
-- xbox-wireless-controller-carbon-black
-- xbox-wireless-controller-robot-white
-- nintendo-switch-pro-controller
-- joy-con-neon-red-neon-blue
-- grand-theft-auto-vi
-- ea-sports-fc-26
-- marvels-spider-man-2
-- god-of-war-ragnarok
-- astro-bot
-- call-of-duty-black-ops-7
-- forza-horizon-5
-- mario-kart-8-deluxe
-- the-legend-of-zelda-tears-of-the-kingdom
-- super-mario-bros-wonder
