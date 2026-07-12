# T.PlayGames

Tienda online argentina para consolas, controles y juegos.

## Stack

- Next.js 16 App Router.
- TypeScript estricto.
- Tailwind CSS 4.
- Supabase para PostgreSQL, Auth, RLS y Storage.
- Mercado Pago Checkout Pro desde servidor.
- Zod, React Hook Form, Vitest y Playwright.
- Resend desacoplado para correos.

## Inicio local

```bash
npm install
cp .env.example .env.local
npm run dev
```

Abrir `http://localhost:3000`.

Sin credenciales externas, la app usa modo desarrollo con catálogo seed, precios
temporales y roles de prueba. No usar esos valores como publicaciones
comerciales finales.

## Verificación

```bash
npm run lint
npm run typecheck
npm run test
npm run build
npm run test:e2e
npm run audit
```

## Variables

Completar en `.env.local` o Vercel:

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_WHATSAPP_NUMBER`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `MERCADOPAGO_ACCESS_TOKEN`
- `MERCADOPAGO_WEBHOOK_SECRET`
- `RESEND_API_KEY`
- `EMAIL_FROM`
- `SUPABASE_TRANSFER_PROOFS_BUCKET`

No escribir secretos en el cliente.

## Fase 2 visual

La segunda fase consolidó una identidad visual premium para T.PlayGames:

- sistema visual compartido en `src/app/globals.css`;
- assets SVG originales en `public/brand`;
- galería de producto con `next/image`, blur placeholder y thumbnails;
- home comercial completa con hero, categorías, destacados, confianza, FAQ y CTA;
- carrito/checkout/admin pulidos para desktop y mobile;
- capturas before/after en `artifacts/ui-audit`.

## Fase 3 catálogo real

La tercera fase reemplazó los productos genéricos por un catálogo reconocible de
consolas, controles y juegos:

- 27 productos reales verificados en sitios oficiales de PlayStation, Xbox,
  Nintendo, Rockstar, EA y Activision/Call of Duty;
- 72 imágenes WebP en `public/products/{consoles,controllers,games}`;
- fuentes y observaciones de uso en `docs/PRODUCT_ASSETS_SOURCES.md`;
- seed local actualizado en `src/lib/demo-data.ts` con slugs/SKUs únicos,
  galerías, alt text, SEO y especificaciones verificables;
- Grand Theft Auto VI queda como preventa con fecha oficial
  `19 de noviembre de 2026`.

Los precios, stock, garantías y condiciones de entrega son valores de desarrollo
reemplazables desde administración antes de vender.

## Supabase

1. Crear proyecto Supabase.
2. Ejecutar `supabase/migrations/0001_initial_schema.sql`.
3. Ejecutar `supabase/migrations/0002_accounts_orders_persistence.sql`.
4. Ejecutar `supabase/migrations/0003_complete_order_management.sql`.
5. Ejecutar opcionalmente `supabase/seed/demo_seed.sql`.
6. Configurar Auth con el dominio de Vercel/local y callback
   `/auth/callback`.
7. Verificar el bucket privado `transfer-proofs` para comprobantes.
8. Configurar Storage para imágenes de productos.

## Cuentas y pedidos persistentes

La fase actual completa la persistencia operativa:

- checkout asociado a usuario autenticado cuando existe sesión;
- historial de pedidos en `/mi-cuenta` y `/mis-pedidos`;
- vinculación explícita de pedidos invitados por email verificado;
- recuperación y actualización de contraseña vía Supabase Auth;
- carga privada de comprobantes de transferencia JPG, PNG o PDF hasta 10 MB;
- revisión de comprobantes desde admin con aprobación/rechazo y email;
- recibos imprimibles para cliente, seguimiento invitado y admin;
- emails transaccionales desacoplados, no bloqueantes si Resend falla;
- sincronización de carrito/favoritos al iniciar sesión.

## Primer administrador

Procedimiento sin credenciales hardcodeadas:

1. Configurar Supabase.
2. Registrar el primer usuario por Supabase Auth.
3. Iniciar sesión en la app.
4. Ejecutar `POST /api/admin/claim-first-admin` desde esa sesión.

La funcion `claim_first_admin()` solo funciona si todavia no existe ningun administrador.

## Compra de prueba

1. Agregar un producto al carrito.
2. Completar checkout.
3. Sin `MERCADOPAGO_ACCESS_TOKEN`, la app devuelve una URL de resultado local.
4. En la pagina de resultado, usar “Simular pago aprobado” en desarrollo.
5. Abrir `/admin/pedidos`, cambiar estado o registrar entrega digital.

## Mercado Pago

Para sandbox:

1. Obtener `MERCADOPAGO_ACCESS_TOKEN` de prueba.
2. Configurar `NEXT_PUBLIC_SITE_URL`.
3. Crear preferencia desde checkout.
4. Apuntar webhook a `/api/payments/mercadopago/webhook`.
5. Verificar que el pedido se actualice solo por webhook consultado contra API.

Para producción:

1. Reemplazar token sandbox por token productivo.
2. Validar URLs HTTPS.
3. Probar pagos reales de bajo monto con autorización expresa.
4. No activar cobros reales sin revisar `docs/LAUNCH_CHECKLIST.md`.

## Documentacion

- `docs/IMPLEMENTATION_PLAN.md`
- `docs/ARCHITECTURE.md`
- `docs/SECURITY.md`
- `docs/DEPLOYMENT.md`
- `docs/ADMIN_OPERATIONS.md`
- `docs/UI_SYSTEM.md`
- `docs/CONTENT_GUIDE.md`
- `docs/IMAGE_ASSETS.md`
- `docs/PRODUCT_ASSETS_SOURCES.md`
- `docs/AUTH_AND_ACCOUNTS.md`
- `docs/ORDER_PERSISTENCE.md`
- `docs/PAYMENT_FLOW.md`
- `docs/UI_AUDIT.md`
- `docs/LAUNCH_CHECKLIST.md`
- `docs/TASKS.md`
