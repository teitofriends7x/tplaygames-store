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

## Supabase

1. Crear proyecto.
2. Ejecutar migracion `supabase/migrations/0001_initial_schema.sql`.
3. Configurar Auth redirect URLs:
   - `http://localhost:3000`
   - URL de Vercel
4. Configurar storage privado para imagenes subidas desde admin.

## Mercado Pago

1. Usar token sandbox primero.
2. Configurar webhook a `https://dominio/api/payments/mercadopago/webhook`.
3. Confirmar eventos aprobados, rechazados y pendientes.
4. Cambiar a token productivo solo con autorizacion expresa.

## Resend

1. Verificar dominio/remitente.
2. Completar `RESEND_API_KEY` y `EMAIL_FROM`.
3. Probar correos transaccionales en entorno de staging.
