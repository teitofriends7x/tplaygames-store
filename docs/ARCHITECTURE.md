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
- funcion segura para primer administrador.

## Pagos

`src/lib/payments.ts` crea preferencias de Mercado Pago exclusivamente del lado servidor. La URL de retorno nunca marca pago como aprobado; el webhook verifica el pago consultando la API y procesa eventos de forma idempotente.

## Entrega digital

La entrega digital se registra manualmente desde admin/operador. El contenido seguro no se muestra en listados y se guarda separado en `digital_deliveries`.
