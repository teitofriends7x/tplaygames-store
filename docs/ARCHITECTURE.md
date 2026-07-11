# Arquitectura

## Capas

- `src/app`: rutas App Router, paginas y route handlers.
- `src/components`: componentes de UI, incluyendo interactividad cliente.
- `src/lib`: dominio, validaciones, integraciones y adaptadores.
- `supabase/migrations`: esquema SQL, indices, constraints y RLS.
- `tests`: pruebas unitarias y E2E.

## Dominio

Los calculos de carrito se hacen en `src/lib/cart.ts`. El navegador solo guarda ids, variante y cantidad; el servidor revalida producto, variante, precio, cupon, stock y envio.

Los pedidos guardan snapshot historico en `src/lib/orders.ts` para que cambios posteriores de productos no modifiquen compras anteriores.

## Persistencia

La version local usa un store en memoria para desarrollo sin credenciales. Supabase queda preparado como fuente real mediante:

- tablas normalizadas,
- claves foraneas,
- indices,
- RLS,
- funcion segura para primer administrador.

## Pagos

`src/lib/payments.ts` crea preferencias de Mercado Pago exclusivamente del lado servidor. La URL de retorno nunca marca pago como aprobado; el webhook verifica el pago consultando la API y procesa eventos de forma idempotente.

## Entrega digital

La entrega digital se registra manualmente desde admin/operador. El contenido seguro no se muestra en listados y se guarda separado en `digital_deliveries`.
