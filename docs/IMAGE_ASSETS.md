# Assets de imágenes

## Procedencia

Todos los assets nuevos de fase 2 son SVG originales generados localmente para
T.PlayGames con `scripts/generate-brand-assets.mjs`. No se usaron imágenes de
tiendas competidoras, recursos con marca de agua ni fotografías oficiales
inventadas.

## Ubicación

- Hero: `public/brand/hero-tplaygames.svg`
- Categorías:
  - `public/brand/categories/consolas.svg`
  - `public/brand/categories/controles.svg`
  - `public/brand/categories/juegos.svg`
- Productos demo:
  - `public/brand/products/*-main.svg`
  - `public/brand/products/*-angle.svg`
  - `public/brand/products/*-detail.svg`

Cada producto demo tiene imagen principal y dos secundarias. Los datos viven en
`src/lib/demo-data.ts` con `alt`, `blurDataUrl`, `width` y `height`.

## Licencia

Assets originales del proyecto. Pueden reemplazarse por imágenes propias o con
licencia comercial compatible. Documentar la procedencia de cada recurso real en
este archivo antes de producción.

## Cómo reemplazar

1. Subir la imagen real a `public/brand/products` o a Supabase Storage cuando
   esté conectado.
2. Actualizar `images[]` y `mainImage` del producto.
3. Mantener `alt` descriptivo, dimensiones y fallback.
4. Verificar la galería, tarjetas, carrito, checkout e inventario.
5. Regenerar capturas con `node scripts/capture-ui-audit.mjs`.

## Supabase Storage

Cuando se active administración real:

- validar MIME type y extensión;
- limitar peso y dimensiones;
- generar thumbnails o variantes optimizadas;
- guardar `alt`, `position`, `isPrimary`, `width`, `height` y URL pública o
  firmada según la política definida;
- no exponer notas internas ni costos.
