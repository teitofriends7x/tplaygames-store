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
- [x] Crear seed demo eliminable.
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
- [x] Páginas legales e informativas.
- [x] Panel admin/operador.
- [x] Panel de inventario.
- [x] Capturas visuales before/after.

## Contenido y assets

- [x] Assets originales T.PlayGames en `public/brand`.
- [x] Imágenes diferenciadas para Consolas, Controles y Juegos.
- [x] Imágenes principales y secundarias para los 9 productos demo.
- [x] Guía de reemplazo de imágenes documentada.
- [x] Avisos de contenido legal pendiente conservados.

## Verificación

- [x] Pruebas unitarias de dominio.
- [x] Pruebas E2E mínimas escritas.
- [x] `npm ci`.
- [x] `npm run lint`.
- [x] `npm run typecheck`.
- [x] `npm run test`.
- [x] `npm run build`.
- [x] `npm run test:e2e`.
- [ ] `npm run audit` sin hallazgos: queda pendiente de parche compatible de Next/PostCSS; `npm audit fix --force` propone downgrade incompatible.
