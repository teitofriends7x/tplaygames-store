# Plan de implementación

Proyecto: T.PlayGames.

## Decisiones técnicas iniciales

- Se usa Next.js 16.2.10 con App Router porque es la versión estable actual disponible en npm al iniciar el proyecto.
- Se usa React 19.2.4, Tailwind CSS 4, TypeScript estricto, Zod, React Hook Form, Vitest y Playwright.
- Supabase queda preparado con migraciones SQL, RLS y clientes SSR/admin. En desarrollo sin credenciales se usa un adaptador local de demostración.
- Mercado Pago Checkout Pro queda encapsulado en un adaptador de servidor. Sin `MERCADOPAGO_ACCESS_TOKEN`, el checkout genera una URL de prueba local y nunca marca pagos reales.
- Resend queda desacoplado. Sin credenciales, los correos transaccionales se registran como eventos de desarrollo.

## Etapas

1. Base del proyecto, documentación, scripts, variables y configuración de seguridad.
2. Modelo de dominio: productos, variantes, carrito, cupones, pedidos, pagos, envíos, roles y auditoría.
3. Supabase: migraciones, RLS, seeds demo y procedimiento de primer administrador.
4. UI pública: inicio, catálogo, filtros, búsqueda, producto, carrito, checkout, estado de pago y páginas informativas.
5. Panel admin/operador: dashboard, pedidos, productos, cupones, inventario, entrega digital y envíos.
6. Integraciones de servidor: Mercado Pago, webhooks, idempotencia, email dev/Resend y WhatsApp contextual.
7. Pruebas unitarias y E2E mínimas.
8. Documentación operativa, seguridad, arquitectura, despliegue y checklist de lanzamiento.

## Pendientes humanos inevitables

- Credenciales de Supabase.
- Credenciales de Mercado Pago de prueba y luego producción.
- Número real de WhatsApp.
- Email remitente validado.
- Textos legales revisados por profesional.
- Datos comerciales reales de envíos, garantías, retiro y catálogo.
