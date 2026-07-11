# Sistema visual

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
