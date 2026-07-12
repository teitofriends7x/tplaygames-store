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
   - `supabase/migrations/0005_clerk_auth_compatibility.sql`
3. Confirmar bucket privado `transfer-proofs` para comprobantes.
4. Configurar storage privado para imágenes subidas desde admin.
5. Definir política de tamaño, peso, MIME type y reemplazo de assets.

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
- `NEXT_PUBLIC_SITE_URL`: requerido para Mercado Pago y recibos.
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: clave pública de la aplicación Clerk.
- `CLERK_SECRET_KEY`: solo servidor; nunca usar prefijo `NEXT_PUBLIC_`.
- `NEXT_PUBLIC_SUPABASE_URL`: URL del proyecto usada por la capa de servidor.
- `SUPABASE_SERVICE_ROLE_KEY`: solo servidor; nunca usar prefijo `NEXT_PUBLIC_`.

## Clerk y Google

1. Crear una aplicación en Clerk Dashboard.
2. Habilitar Google en Social connections; en desarrollo usar la conexión
   simplificada administrada por Clerk.
3. Copiar solo Publishable key y Secret key a Vercel.
4. Configurar las rutas Clerk indicadas en `.env.example`.
5. Hacer redeploy y probar consentimiento y retorno. Ver detalles en
   `docs/AUTH_AND_ACCOUNTS.md`.

## Verificación de autenticación desplegada

1. Confirmar que las variables Clerk existen en Production y
   Preview dentro del proyecto Vercel que sirve el dominio público.
2. Ejecutar un redeploy después de cualquier cambio de variables.
3. Abrir `/registro` y comprobar Google y email.
4. Probar recuperación, persistencia y logout.
5. Asignar un usuario admin mediante Public metadata de Clerk.

Este repositorio tiene checks de tres proyectos Vercel (`tplaygames`,
`tplaygames-store` y `tplaygames-store-web`). Sus variables son independientes.

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
