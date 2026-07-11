# Auditoría UI

## Capturas

Baseline:

- `artifacts/ui-audit/before`
- `artifacts/ui-audit/before/manifest.json`

Resultado fase 2:

- `artifacts/ui-audit/after`
- `artifacts/ui-audit/after/manifest.json`
- `artifacts/ui-audit/responsive-check.json`

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
- Imágenes demo demasiado simples.
- Producto sin galería profesional ni bloques de confianza suficientes.
- Login, registro e inventario devolvían 404.
- Admin funcional pero plano.
- Estados vacíos poco comerciales.

## Cambios after

- Nuevo hero original con CTA, promo y composición visual.
- Categorías con assets dedicados.
- Nueve productos demo con assets originales, galería y blur placeholder.
- Tarjetas con badges, stock, formato, descuento, favoritos y CTA.
- Ficha con breadcrumbs, zoom, specs, FAQ, WhatsApp y relacionados.
- Carrito y checkout con imágenes, pasos, resumen y mensajes por tipo de
  entrega.
- Login/registro reales como pantallas preparadas para Supabase, sin simular
  autenticación.
- Admin con navegación, inventario, KPIs reales y tablas responsive.
- Páginas privadas/admin marcadas `noindex`.

## Correcciones durante QA

- Migración defensiva del store en memoria para hot reload con settings e
  imágenes demo actuales.
- Corrección de overflow horizontal en admin mobile.
- Corrección de textos visibles con acentos.

## Pendiente de auditoría externa

- Lighthouse/Web Vitals en staging con dominio y CDN reales.
- Revisión legal profesional.
- Prueba mobile real en dispositivos físicos.
