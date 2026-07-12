# Persistencia de pedidos

## Objetivo

Los pedidos deben sobrevivir reinicios, conservar snapshots históricos y
mantener trazabilidad de cambios operativos.

## Tablas principales

- `orders`: pedido, cliente snapshot, dirección snapshot, totales, método de
  pago, estado y número público.
- `order_items`: snapshot de producto, variante, SKU, precio y cantidad.
- `order_status_history`: cambios de estado.
- `order_events`: timeline operativo con payloads no sensibles.
- `transfer_proofs`: metadata de comprobantes de transferencia.
- `guest_order_access`: tokens de acceso invitado preparados para evolución.

## Número de pedido

`public_order_number` usa formato `TPG-YYMMDD-XXXXXX`. La app sigue aceptando
`order_number` legacy cuando hace falta, pero el número público es el que se
muestra al cliente.

## Comprobantes

Los archivos se guardan en Storage privado, bucket `transfer-proofs`.

Reglas:

- JPG, PNG o PDF;
- máximo 10 MB;
- validación de firma real, MIME y extensión;
- URL firmada temporal solo para admin/operador;
- subir comprobante cambia el pedido a `transfer_proof_submitted`;
- aprobar comprobante cambia pago a aprobado y aplica el estado de pedido
  correspondiente;
- rechazar comprobante devuelve pago a rechazado y pedido a pendiente de pago.

## Fallback de desarrollo

Sin Supabase configurado:

- pedidos, eventos y comprobantes quedan en memoria;
- storage path usa prefijo `development://`;
- emails se registran en consola.

Ese modo sirve para desarrollo y E2E, no para operación real.

## Recibos

Hay recibo imprimible para:

- cuenta autenticada: `/mi-cuenta/pedidos/[id]/comprobante`;
- seguimiento invitado: `/seguimiento/comprobante`;
- administración: `/admin/pedidos/[id]/comprobante`.

El recibo no reemplaza factura fiscal.
