# Despliegue

## Vercel

1. Crear proyecto en Vercel conectado al repositorio.
2. Configurar variables de entorno.
3. Ejecutar build:

```bash
npm run build
```

4. Configurar dominio.
5. Configurar `NEXT_PUBLIC_SITE_URL` con HTTPS definitivo.
6. Ejecutar capturas visuales con `node scripts/capture-ui-audit.mjs`.

## Supabase

1. Crear proyecto.
2. Ejecutar migraciones en orden:
   - `supabase/migrations/0001_initial_schema.sql`
   - `supabase/migrations/0002_accounts_orders_persistence.sql`
   - `supabase/migrations/0003_complete_order_management.sql`
   - `supabase/migrations/0004_standard_auth_flow.sql`
3. Configurar Auth redirect URLs:
   - `http://localhost:3000/auth/callback`
   - `https://staging-o-vercel/auth/callback`
   - `https://dominio/auth/callback`
4. Confirmar bucket privado `transfer-proofs` para comprobantes.
5. Configurar storage privado para imágenes subidas desde admin.
6. Definir política de tamaño, peso, MIME type y reemplazo de assets.

## Mercado Pago

1. Usar token sandbox primero.
2. Configurar webhook a `https://dominio/api/payments/mercadopago/webhook`.
3. Confirmar eventos aprobados, rechazados y pendientes.
4. Cambiar a token productivo solo con autorizacion expresa.

## Resend

1. Verificar dominio/remitente.
2. Completar `RESEND_API_KEY` y `EMAIL_FROM`.
3. Probar correos transaccionales en entorno de staging.

## Variables nuevas de cuentas/pedidos

- `SUPABASE_TRANSFER_PROOFS_BUCKET`: por defecto `transfer-proofs`.
- `NEXT_PUBLIC_SITE_URL`: requerido para links de recuperación de contraseña,
  Mercado Pago y recibos.
- `NEXT_PUBLIC_SUPABASE_URL`: URL pública del proyecto Supabase.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: clave pública/anon usada por SSR y navegador.
- `SUPABASE_SERVICE_ROLE_KEY`: solo servidor; nunca usar prefijo `NEXT_PUBLIC_`.

## Google OAuth

1. Crear cliente OAuth Web en Google Cloud.
2. Agregar origins para localhost, staging/Vercel y dominio final.
3. Agregar como redirect URI la callback de Supabase:
   `https://<project-ref>.supabase.co/auth/v1/callback`.
4. Cargar Client ID/Secret y activar Google en Supabase Auth > Providers.
5. Configurar Site URL y allow list de callbacks de la aplicación en Supabase.
6. Probar consentimiento y retorno en cada dominio. Ver detalles en
   `docs/AUTH_AND_ACCOUNTS.md`.

## Pruebas de lanzamiento operativas

1. Registrar usuario, confirmar email y recuperar contraseña.
2. Crear pedido autenticado y verificar `/mi-cuenta`.
3. Crear pedido invitado y vincularlo desde una cuenta con el mismo email.
4. Crear pedido por transferencia, subir comprobante y aprobar/rechazar desde
   admin.
5. Descargar/abrir recibo desde cuenta, seguimiento invitado y admin.

## Assets y performance

- Los assets de marca viven en `public/brand` y son SVG originales.
- Las imágenes seed de productos viven en `public/products` y su procedencia
  está documentada en `docs/PRODUCT_ASSETS_SOURCES.md`.
- En producción, las imágenes administradas deberían cargarse desde Supabase
  Storage o un CDN autorizado y conservar `alt`, dimensiones y fallback.
- Confirmar permiso comercial de assets oficiales antes de usar el catálogo en
  una publicación real.
- Usar `priority` solo para el hero y contenido visible inicialmente.
- Revisar Lighthouse/Web Vitals en staging antes de publicar.
