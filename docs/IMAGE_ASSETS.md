# Assets de imágenes

## Procedencia

Los assets de marca y categorías son SVG originales generados localmente para
T.PlayGames con `scripts/generate-brand-assets.mjs`.

Los assets de productos de fase 3 fueron descargados desde páginas oficiales o
endpoints oficiales de PlayStation, Xbox, Nintendo, Rockstar Games, Electronic
Arts y Activision/Call of Duty mediante `scripts/download-real-product-assets.mjs`.
Cada descarga está documentada en `docs/PRODUCT_ASSETS_SOURCES.md`.

## Ubicación

- Hero: `public/brand/hero-tplaygames.svg`
- Categorías:
  - `public/brand/categories/consolas.svg`
  - `public/brand/categories/controles.svg`
  - `public/brand/categories/juegos.svg`
- Productos reales:
  - `public/products/consoles/*.webp`
  - `public/products/controllers/*.webp`
  - `public/products/games/*.webp`

Cada producto seed tiene imagen principal y galería cuando existe material
oficial razonable. Los datos viven en `src/lib/demo-data.ts` con `alt`,
`blurDataUrl`, `width`, `height`, SEO y especificaciones.

## Licencia

Assets de marca: originales del proyecto.

Assets de producto: oficiales de fabricante/publisher para catálogo local de
desarrollo y preparación visual. Antes de producción se debe confirmar con el
proveedor/distribuidor el permiso comercial definitivo para cada marca.

## Cómo reemplazar

1. Subir la imagen real a `public/products` o a Supabase Storage cuando
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
