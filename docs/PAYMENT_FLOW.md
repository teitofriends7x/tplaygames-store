# Flujo de pagos

## Mercado Pago

La preferencia se crea solo en servidor desde el pedido calculado por backend.
La URL de retorno no aprueba pagos.

El webhook:

- valida idempotencia por evento;
- consulta el pago contra Mercado Pago;
- actualiza `payment_status`;
- aplica transición de estado según tipo de pedido;
- no confía en montos enviados por el cliente.

Sin `MERCADOPAGO_ACCESS_TOKEN`, el adaptador local de desarrollo permite probar
checkout y pago aprobado sin activar cobros reales.

## Transferencia

El checkout por transferencia:

- crea pedido en `pending_payment`;
- registra `payment_method = transfer`;
- calcula vencimiento con `transferExpirationHours`;
- muestra cuenta de transferencia configurada;
- no promete entrega inmediata.

El cliente puede subir comprobante desde seguimiento o detalle de cuenta.
Subir archivo solo marca `transfer_proof_submitted`.

Admin/operador revisa:

- aprobar: pago aprobado y estado de pedido según productos físicos/digitales;
- rechazar: pago rechazado, pedido pendiente y motivo opcional para el cliente.

## Emails

Plantillas disponibles:

- pedido recibido;
- estado actualizado;
- comprobante recibido;
- transferencia aprobada;
- transferencia rechazada;
- entrega digital disponible;
- cancelación/envío/entrega cuando el estado corresponda.

Resend es opcional. Si falta `RESEND_API_KEY` o `EMAIL_FROM`, el intento se
registra en consola. Si Resend falla, la operación de pedido no se revierte.

## Límites

- No activar cobros reales sin autorización expresa.
- No inventar cuotas, garantía oficial ni envío gratis.
- No entregar productos digitales sin pago aprobado.
- No exponer comprobantes ni entregas digitales desde componentes cliente.
