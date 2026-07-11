# Seguridad

## Implementado

- Validaciones Zod en checkout, busqueda, admin, estados y entrega digital.
- Autorizacion server-side en endpoints admin.
- Roles `customer`, `operator` y `admin`.
- RLS Supabase para perfiles, direcciones, productos, pedidos, pagos, entregas digitales y auditoria.
- Secretos solo por variables de entorno.
- Headers de seguridad en `next.config.ts`.
- Rate limiting en busqueda y checkout.
- Webhook de Mercado Pago idempotente.
- No se confirma pago por URL de retorno.
- Entrega digital protegida fuera de listados.

## Primer administrador

No hay credenciales hardcodeadas. Usar `claim_first_admin()` mediante `POST /api/admin/claim-first-admin` una sola vez, con usuario autenticado.

## Pendientes antes de produccion

- Configurar Supabase real y verificar RLS con usuarios de prueba.
- Configurar storage con validacion de extension/tamano.
- Configurar proveedor de rate limiting persistente si hay alto trafico.
- Revisar textos legales con profesional.
- Revisar `npm audit` y actualizar dependencias si aparece parche compatible.
