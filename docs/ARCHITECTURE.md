# Arquitectura

## Capas

- `src/app`: rutas App Router, paginas y route handlers.
- `src/components`: componentes de UI, incluyendo interactividad cliente.
- `src/lib`: dominio, validaciones, integraciones y adaptadores.
- `public/brand`: assets originales de marca, hero y categorías.
- `public/products`: imágenes WebP de productos reales verificadas y
  documentadas por procedencia.
- `artifacts/ui-audit`: evidencia visual before/after generada por Playwright.
- `supabase/migrations`: esquema SQL, indices, constraints y RLS.
- `tests`: pruebas unitarias y E2E.

## UI y design system

La identidad visual se centraliza en `src/app/globals.css` con tokens y clases
reutilizables (`tpg-container`, `tpg-card`, `btn`, `badge`, `form-control`,
`admin-table`, `skeleton`). El storefront y el panel comparten base visual; el
panel usa una composición más densa y operativa.

Las imágenes se renderizan con `next/image` en tarjetas, galería, carrito,
checkout e inventario. El catálogo seed incluye `blurDataUrl`, dimensiones,
alt text y varias imágenes por producto para evitar layout shift.

## Dominio

Los cálculos de carrito se hacen en `src/lib/cart.ts`. El navegador solo guarda
ids, variante y cantidad; el servidor revalida producto, variante, precio,
cupón, stock y envío.

Los pedidos guardan snapshot histórico en `src/lib/orders.ts` para que cambios
posteriores de productos no modifiquen compras anteriores.

## Persistencia

La versión local usa un store en memoria para desarrollo sin credenciales.
`getStoreState()` normaliza settings y catálogo seed para tolerar hot reload
durante desarrollo y purga los IDs genéricos legacy de fase 1/2. Supabase queda
preparado como fuente real mediante:

- tablas normalizadas,
- claves foraneas,
- indices,
- RLS,
- funcion segura para primer administrador,
- pedidos persistentes con `public_order_number`, `guest_email`,
  `payment_method` y `transfer_expires_at`,
- eventos de pedido (`order_events`) para trazabilidad operativa,
- comprobantes de transferencia en tabla `transfer_proofs` y bucket privado
  `transfer-proofs`,
- vinculación de pedidos invitados mediante `link_guest_orders_to_user()`.

Las migraciones se aplican en orden:

1. `0001_initial_schema.sql`
2. `0002_accounts_orders_persistence.sql`
3. `0003_complete_order_management.sql`

## Cuentas

Supabase Auth gestiona registro, login, recuperación y actualización de
contraseña. La app expone:

- `/mi-cuenta` para perfil, pedidos y vinculación de compras anteriores;
- `/mis-pedidos` para historial autenticado;
- `/seguimiento` para consulta invitada por número de pedido y email;
- `/auth/callback` para intercambiar códigos de recuperación/confirmación.

El checkout asocia el pedido al usuario autenticado cuando hay sesión activa.
Si la compra fue invitada, el usuario puede vincularla después solo con email
verificado.

## Pagos

`src/lib/payments.ts` crea preferencias de Mercado Pago exclusivamente del lado servidor. La URL de retorno nunca marca pago como aprobado; el webhook verifica el pago consultando la API y procesa eventos de forma idempotente.

Los pagos por transferencia quedan en estado pendiente hasta que el cliente sube
un comprobante y un operador/admin lo aprueba. Subir el comprobante no aprueba
el pago ni habilita entrega inmediata.

## Entrega digital

La entrega digital se registra manualmente desde admin/operador. El contenido seguro no se muestra en listados y se guarda separado en `digital_deliveries`.

## Emails

`src/lib/email.ts` centraliza plantillas transaccionales. Resend es opcional:
sin credenciales se registra el intento en consola; si Resend falla, la mutación
del pedido no se revierte.
