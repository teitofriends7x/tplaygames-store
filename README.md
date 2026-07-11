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

Sin credenciales externas, la app usa modo desarrollo con datos demo claramente marcados. No usar esos datos como publicaciones reales.

## Verificacion

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

No escribir secretos en el cliente.

## Supabase

1. Crear proyecto Supabase.
2. Ejecutar `supabase/migrations/0001_initial_schema.sql`.
3. Ejecutar opcionalmente `supabase/seed/demo_seed.sql`.
4. Configurar Auth con el dominio de Vercel/local.
5. Configurar Storage para imagenes de productos.

## Primer administrador

Procedimiento sin credenciales hardcodeadas:

1. Configurar Supabase.
2. Registrar el primer usuario por Supabase Auth.
3. Iniciar sesion en la app.
4. Ejecutar `POST /api/admin/claim-first-admin` desde esa sesion.

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

Para produccion:

1. Reemplazar token sandbox por token productivo.
2. Validar URLs HTTPS.
3. Probar pagos reales de bajo monto con autorizacion expresa.
4. No activar cobros reales sin revisar `docs/LAUNCH_CHECKLIST.md`.

## Documentacion

- `docs/IMPLEMENTATION_PLAN.md`
- `docs/ARCHITECTURE.md`
- `docs/SECURITY.md`
- `docs/DEPLOYMENT.md`
- `docs/ADMIN_OPERATIONS.md`
- `docs/LAUNCH_CHECKLIST.md`
- `docs/TASKS.md`
