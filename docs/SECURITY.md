# Seguridad

## Implementado

- Validaciones Zod en checkout, busqueda, admin, estados y entrega digital.
- Autorizacion server-side en endpoints admin.
- Autorización admin por sesión Clerk validada en servidor o rol demo por
  encabezado solo fuera de producción.
- Roles `customer`, `operator` y `admin`.
- RLS Supabase para perfiles, direcciones, productos, pedidos, pagos, entregas digitales y auditoria.
- RLS y Storage privado para comprobantes de transferencia.
- Secretos solo por variables de entorno.
- Headers de seguridad en `next.config.ts`.
- Rate limiting en busqueda, checkout, seguimiento y carga de comprobantes.
- Webhook de Mercado Pago idempotente.
- No se confirma pago por URL de retorno.
- La aprobación de transferencia solo ocurre desde admin/operador.
- Los comprobantes aceptan JPG, PNG o PDF hasta 10 MB y se validan por firma
  real de archivo, MIME y extensión.
- Entrega digital protegida fuera de listados.
- Páginas admin, cuenta, carrito, checkout y resultado de pago con `noindex`.
- UI de producto/carrito/checkout comunica que precio, stock y cupón se
  revalidan en servidor.
- Productos en preventa no permiten compra inmediata cuando no hay stock o fecha
  de entrega habilitada.
- Pedidos invitados se vinculan a usuario solo con email autenticado y
  verificado.
- Emails transaccionales no bloquean mutaciones críticas si Resend falla.
- Sesiones Clerk protegidas desde Proxy en cuenta, pedidos y administración.
- Login, registro, Google y recuperación delegados a componentes oficiales de Clerk.
- La metadata de rol se obtiene desde Clerk en servidor; valores desconocidos
  se reducen a `customer`.
- El email de checkout autenticado se toma de la identidad verificada en servidor.
- Historial nuevo limitado a `orders.clerk_user_id`; `orders.user_id` se conserva
  para compatibilidad histórica e invitados requieren vinculación explícita.

## Primer administrador

No hay credenciales hardcodeadas. Asignar `{ "role": "admin" }` en Public
metadata del usuario desde Clerk Dashboard. `/admin` vuelve a validar ese rol
del lado del servidor.

## Pendientes antes de produccion

- Configurar Clerk y probar Google/email en localhost, staging y dominio final.
- Aplicar `0005_clerk_auth_compatibility.sql` en Supabase y verificar la capa de
  servicio con usuarios de prueba.
- Verificar bucket privado `transfer-proofs` y expiración de URLs firmadas.
- Configurar storage de imágenes administradas con validación de
  extensión/tamaño, dimensiones máximas y política de reemplazo de imágenes.
- Configurar proveedor de rate limiting persistente si hay alto trafico.
- Revisar textos legales con profesional.
- Revisar `npm audit` y actualizar dependencias si aparece parche compatible.
