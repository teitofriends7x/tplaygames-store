# Operación administrativa

## Cargar primer producto

1. Entrar a `/admin/productos`.
2. Completar formulario de producto.
3. Guardar como borrador.
4. Completar imágenes reales, garantía, condiciones de entrega y SEO.
5. Publicar solo cuando precio, stock y descripción estén verificados.

Las imágenes deben tener procedencia clara, alt text, dimensiones conocidas y
fallback. En producción se recomienda Supabase Storage con URLs firmadas o CDN
permitido.

## Controlar inventario

1. Entrar a `/admin/inventario`.
2. Revisar productos sin stock y stock bajo.
3. Ajustar stock desde la fuente administrativa real cuando Supabase esté
   conectado.
4. No ocultar productos sin stock sin revisar pedidos pendientes.

## Procesar pedido

1. Entrar a `/admin/pedidos`.
2. Abrir pedido.
3. Revisar estado de pago.
4. Cambiar estado interno con comentario.
5. Para físicos, agregar transportista, seguimiento y URL cuando se conecte persistencia real.
6. Para digitales, registrar entrega manual protegida.

## Entrega digital

1. Confirmar pago aprobado.
2. Abrir pedido.
3. Registrar referencia segura y nota interna.
4. Elegir canal: email, WhatsApp o manual.
5. Guardar. El pedido pasa a entrega digital realizada.

No generar licencias ni códigos ficticios.
