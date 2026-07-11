# AGENTS.md

Reglas del proyecto T.PlayGames.

## Stack

- Next.js 16 con App Router, TypeScript estricto y Tailwind CSS 4.
- Supabase es la fuente de verdad prevista para PostgreSQL, autenticación, RLS y Storage.
- Mercado Pago se integra solo desde servidor. Si faltan credenciales, se usa un adaptador local de desarrollo claramente marcado.
- Los datos demo son exclusivamente para desarrollo y pruebas; no deben publicarse como catálogo real.

## Dominio

- Las únicas categorías admitidas son `Consolas`, `Controles` y `Juegos`.
- Las plataformas admitidas son `PlayStation`, `Xbox`, `Nintendo` y `PC`.
- Los juegos digitales usan entrega manual protegida. No generar licencias, códigos ni cuentas.
- Los precios se guardan y calculan en centavos ARS. El cliente nunca define precios finales.

## Seguridad

- Toda mutación crítica debe validar con Zod y autorizar del lado del servidor.
- No exponer `SUPABASE_SERVICE_ROLE_KEY`, `MERCADOPAGO_ACCESS_TOKEN`, `RESEND_API_KEY` ni datos de entrega digital en componentes cliente.
- Los roles válidos son `customer`, `operator` y `admin`.
- El modo de rol por encabezado (`x-demo-role`) solo existe para desarrollo y pruebas.
- Los pedidos deben guardar snapshot histórico de productos, precios, cliente, entrega y estado de pago.

## UI

- Idioma: español.
- Moneda: ARS.
- Zona horaria: `America/Argentina/Buenos_Aires`.
- Prioridad mobile-first.
- Diseño oscuro premium con la paleta definida en el brief.

## Verificación

Antes de cerrar cambios importantes ejecutar:

- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run build`
- `npm run test:e2e` cuando el entorno tenga navegadores Playwright disponibles.
