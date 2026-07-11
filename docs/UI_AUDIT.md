# Auditoría UI

## Capturas

Baseline:

- `artifacts/ui-audit/before`
- `artifacts/ui-audit/before/manifest.json`

Resultado fase 2:

- `artifacts/ui-audit/after`
- `artifacts/ui-audit/after/manifest.json`
- `artifacts/ui-audit/responsive-check.json`

Resultado fase 3:

- `artifacts/real-catalog-review`
- `artifacts/real-catalog-review/assets-manifest.json`
- `artifacts/real-catalog-review/assets-consoles.png`
- `artifacts/real-catalog-review/assets-controllers.png`
- `artifacts/real-catalog-review/assets-games.png`

El script repetible es:

```bash
node scripts/capture-ui-audit.mjs artifacts/ui-audit/after
```

## Rutas auditadas

Inicio, consolas, controles, juegos, ofertas, búsqueda con resultados, búsqueda
sin resultados, producto, carrito vacío, carrito mixto, checkout físico,
checkout digital, checkout mixto, login, registro, mi cuenta, mis pedidos,
admin, pedidos admin, productos admin, inventario, cupones, configuración y 404.

Viewports capturados:

- desktop: 1440 x 900;
- mobile: 390 x 844.

Responsive check adicional:

- 320 x 568;
- 360 x 800;
- 375 x 812;
- 390 x 844;
- 414 x 896;
- 768 x 1024;
- 1024 x 768;
- 1280 x 800;
- 1440 x 900;
- 1920 x 1080.

Se midieron 60 combinaciones ruta/tamaño sin overflow horizontal efectivo.

## Hallazgos before

- Home con apariencia MVP y mucho espacio sin propósito.
- Categorías sin composición visual fuerte.
- Imágenes iniciales demasiado simples para producto real.
- Producto sin galería profesional ni bloques de confianza suficientes.
- Login, registro e inventario devolvían 404.
- Admin funcional pero plano.
- Estados vacíos poco comerciales.

## Cambios after

- Nuevo hero original con CTA, promo y composición visual.
- Categorías con assets dedicados.
- 27 productos reales con nombres, slugs, SKUs, galerías y fuentes oficiales
  documentadas.
- Tarjetas con badges, stock, formato, descuento, favoritos y CTA.
- Ficha con breadcrumbs, zoom, specs, FAQ, WhatsApp y relacionados.
- Carrito y checkout con imágenes, pasos, resumen y mensajes por tipo de
  entrega.
- Login/registro reales como pantallas preparadas para Supabase, sin simular
  autenticación.
- Admin con navegación, inventario, KPIs reales y tablas responsive.
- Páginas privadas/admin marcadas `noindex`.

## Correcciones durante QA

- Migración defensiva del store en memoria para hot reload con settings y
  catálogo seed actual.
- Purga de productos genéricos legacy de fases anteriores.
- Corrección de overflow horizontal en admin mobile.
- Corrección de textos visibles con acentos.

## Pendiente de auditoría externa

- Lighthouse/Web Vitals en staging con dominio y CDN reales.
- Revisión legal profesional.
- Prueba mobile real en dispositivos físicos.
- Confirmación comercial final de uso de imágenes oficiales.
