# Lista de tareas verificable

## Base

- [x] Inspeccionar repositorio.
- [x] Inicializar proyecto Next.js.
- [x] Crear `AGENTS.md`.
- [x] Crear plan de implementación.
- [x] Configurar scripts de verificación.

## Dominio y seguridad

- [x] Modelar categorías, plataformas, productos, variantes y stock.
- [x] Implementar cálculo de carrito, descuentos, envío e impuestos internos sin confiar en el cliente.
- [x] Implementar cupones con validación de servidor.
- [x] Implementar creación de pedidos con snapshot histórico.
- [x] Implementar estados de pago y webhook idempotente.
- [x] Implementar autorización server-side para admin y operador.
- [x] Preparar entrega digital manual protegida.

## Persistencia e integraciones

- [x] Crear migración Supabase con tablas esperadas.
- [x] Crear políticas RLS.
- [x] Crear migración `0003_complete_order_management.sql`.
- [x] Crear migración `0004_standard_auth_flow.sql` para perfiles y OAuth.
- [x] Crear bucket privado `transfer-proofs` y políticas de Storage.
- [x] Persistir pedidos con número público, email invitado y eventos.
- [x] Vincular pedidos invitados a usuario por email verificado.
- [x] Guardar y revisar comprobantes de transferencia.
- [x] Crear seed local eliminable/reemplazable.
- [x] Preparar Mercado Pago con modo desarrollo.
- [x] Preparar email transaccional desacoplado.
- [x] Preparar WhatsApp contextual.

## UI

- [x] Inicio.
- [x] Inicio fase 2 con hero visual, beneficios, FAQ, categorías y CTA.
- [x] Catálogo con filtros y ordenamiento.
- [x] Búsqueda con sugerencias.
- [x] Página de producto.
- [x] Galería de producto reutilizable con thumbnails, zoom, blur y fallback.
- [x] Carrito persistente en invitado.
- [x] Checkout físico/digital/mixto.
- [x] Resultado de pago.
- [x] Cuenta, pedidos y favoritos.
- [x] Perfil editable en `Mi cuenta`.
- [x] Recuperación y actualización de contraseña.
- [x] Login/registro estándar, Google OAuth, callback seguro y sesión persistente.
- [x] Header condicionado por sesión y acceso admin por rol.
- [x] Checkout con datos de cuenta precargados y alternativa invitado.
- [x] Recibos imprimibles para cuenta, invitado y admin.
- [x] Páginas legales e informativas.
- [x] Panel admin/operador.
- [x] Panel admin de pedidos con filtros, historial y comprobantes.
- [x] Panel de inventario.
- [x] Capturas visuales before/after.
- [x] Capturas de autenticación desktop/mobile en `artifacts/auth-flow-review`.

## Contenido y assets

- [x] Assets originales T.PlayGames en `public/brand`.
- [x] Imágenes diferenciadas para Consolas, Controles y Juegos.
- [x] Reemplazar 9 productos genéricos por 27 productos reales verificados.
- [x] Descargar 72 imágenes oficiales WebP en `public/products`.
- [x] Agregar derivados optimizados para tarjetas con fondo transparente.
- [x] Documentar procedencia en `docs/PRODUCT_ASSETS_SOURCES.md`.
- [x] Guía de reemplazo de imágenes documentada.
- [x] Avisos de contenido legal pendiente conservados.

## Verificación

- [x] Pruebas unitarias de dominio.
- [x] Pruebas unitarias de comprobantes y sincronización de cuenta.
- [x] Pruebas E2E mínimas escritas.
- [x] `npm ci`.
- [x] `npm run lint`.
- [x] `npm run typecheck`.
- [x] `npm run test`.
- [x] `npm run build`.
- [x] `npm run test:e2e`.
- [ ] `npm run audit` sin hallazgos: queda pendiente de parche compatible de Next/PostCSS; `npm audit fix --force` propone downgrade incompatible.
