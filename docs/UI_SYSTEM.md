# Sistema visual

## Autenticación Clerk

`src/lib/clerk-appearance.ts` aplica el tema oficial `simple` y personaliza los
componentes preconstruidos mediante `appearance.options`, `variables` y
`elements`. Usa los tokens cromáticos de la tienda, campos de 50 px, foco azul,
card de hasta 500 px y enlaces legales reales. No se apuntan clases internas de
Clerk.

`src/components/auth-shell.tsx` aporta la composición exterior. En escritorio
muestra beneficios comerciales junto al formulario; por debajo de `lg` oculta
ese panel y deja una única columna fluida. Los textos del flujo viven en
`src/lib/clerk-localization.ts` para conservar español argentino en login,
registro y recuperación.

La marca **Secured by Clerk** se conserva con jerarquía secundaria. La etiqueta
**Development mode** no se oculta: solo desaparece al conectar claves de una
instancia Clerk Production.

## Identidad

T.PlayGames mantiene fondo oscuro, azul principal y estética gamer sobria. La
dirección visual busca sentirse premium, tecnológica, comercial y confiable para
Argentina, sin caer en una estética infantil.

## Tokens

Los tokens base viven en `src/app/globals.css`:

- fondo: `--background`;
- superficies: `--surface`, `--surface-secondary`, `--surface-elevated`;
- borde: `--border-subtle`, `--border-strong`;
- acción primaria: `--primary`, `--primary-hover`;
- estados: `--success`, `--warning`, `--danger`;
- radios: `--radius-sm`, `--radius-md`, `--radius-lg`;
- sombras: `--shadow-blue`, `--shadow-card`.

## Componentes base

- `tpg-container`: ancho consistente y responsive.
- `tpg-card` / `tpg-card-soft`: superficies oscuras con borde y sombra.
- `btn`, `btn-primary`, `btn-secondary`: botones con hover, active, disabled y
  focus accesible.
- `icon-button`: botones de icono para header, favoritos y galería.
- `badge`: estados, formato, stock, preventa, datos de prueba y descuentos.
- `form-control` / `input`: inputs, selects y textareas.
- `admin-table`: tablas operativas con scroll horizontal controlado.
- `skeleton`: shimmer respetando `prefers-reduced-motion`.

## Reglas

- No prometer envío gratis, garantía oficial, cuotas sin interés o entrega
  inmediata si no está configurado.
- Usar `next/image` para imágenes de producto, categorías, carrito, checkout e
  inventario.
- Reservar `priority` para hero y primer contenido visible.
- Mantener foco visible y nombres accesibles en iconos.
- Las tablas admin deben estar dentro de wrappers con `overflow-x-auto`.
