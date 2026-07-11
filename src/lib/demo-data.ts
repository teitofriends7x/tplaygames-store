import type { Banner, Coupon, Product, StoreSettings } from "@/lib/types";

const now = "2026-07-11T12:00:00.000-03:00";
const blurDataUrl =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0nMTIwMCcgaGVpZ2h0PSc5MDAnIHZpZXdCb3g9JzAgMCAxMjAwIDkwMCcgeG1sbnM9J2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJz48cmVjdCB3aWR0aD0nMTIwMCcgaGVpZ2h0PSc5MDAnIGZpbGw9JyMwNzA3MDcnLz48Y2lyY2xlIGN4PSc2MDAnIGN5PSczMjAnIHI9JzQwMCcgZmlsbD0nIzFENkRGRicgZmlsbC1vcGFjaXR5PScwLjE4Jy8+PC9zdmc+";

// Catalogo seed con productos reales verificados en fuentes oficiales.
// Precios, stock y SKUs son temporales para desarrollo/pruebas y no son precios oficiales.
const assetDimensions: Record<string, readonly [number, number]> = {
  "/products/consoles/ps5-slim-digital-front.webp": [900, 900],
  "/products/consoles/ps5-slim-digital-box.webp": [900, 900],
  "/products/consoles/ps5-slim-digital-console-dualsense.webp": [900, 900],
  "/products/consoles/ps5-slim-standard-front.webp": [900, 900],
  "/products/consoles/ps5-slim-standard-box.webp": [900, 900],
  "/products/consoles/ps5-pro-angled.webp": [900, 900],
  "/products/consoles/ps5-pro-front.webp": [900, 900],
  "/products/consoles/ps5-pro-box.webp": [900, 900],
  "/products/consoles/xbox-series-s-512-front.webp": [857, 676],
  "/products/consoles/xbox-series-s-512-angle.webp": [857, 676],
  "/products/consoles/xbox-series-s-1tb-front.webp": [857, 676],
  "/products/consoles/xbox-series-s-1tb-angle.webp": [857, 676],
  "/products/consoles/xbox-series-x-1tb-front.webp": [857, 676],
  "/products/consoles/xbox-series-x-1tb-angle.webp": [857, 676],
  "/products/consoles/nintendo-switch-oled-box.webp": [1200, 675],
  "/products/consoles/nintendo-switch-oled-screen.webp": [1065, 600],
  "/products/consoles/nintendo-switch-oled-stand.webp": [1065, 600],
  "/products/consoles/nintendo-switch-lite-box.webp": [1200, 675],
  "/products/consoles/nintendo-switch-lite-handheld.webp": [1600, 1202],
  "/products/consoles/nintendo-switch-lite-gallery.webp": [1600, 900],
  "/products/consoles/nintendo-switch-2-box.webp": [1600, 1600],
  "/products/consoles/nintendo-switch-2-dock.webp": [1600, 1600],
  "/products/consoles/nintendo-switch-2-handheld.webp": [1200, 675],
  "/products/controllers/dualsense-white-front.webp": [900, 900],
  "/products/controllers/dualsense-white-angle.webp": [900, 900],
  "/products/controllers/dualsense-white-box.webp": [900, 900],
  "/products/controllers/dualsense-midnight-black-front.webp": [900, 900],
  "/products/controllers/dualsense-midnight-black-angle.webp": [900, 900],
  "/products/controllers/dualsense-cosmic-red-front.webp": [900, 900],
  "/products/controllers/dualsense-cosmic-red-angle.webp": [900, 900],
  "/products/controllers/dualsense-edge-front.webp": [900, 900],
  "/products/controllers/dualsense-edge-back.webp": [900, 900],
  "/products/controllers/dualsense-edge-case.webp": [900, 900],
  "/products/optimized/dualsense-white-front.webp": [900, 900],
  "/products/optimized/dualsense-white-angle.webp": [900, 900],
  "/products/optimized/dualsense-white-box.webp": [900, 900],
  "/products/optimized/dualsense-midnight-black-front.webp": [900, 900],
  "/products/optimized/dualsense-midnight-black-angle.webp": [900, 900],
  "/products/optimized/dualsense-cosmic-red-front.webp": [900, 900],
  "/products/optimized/dualsense-cosmic-red-angle.webp": [900, 900],
  "/products/optimized/dualsense-edge-front.webp": [900, 900],
  "/products/optimized/dualsense-edge-back.webp": [900, 900],
  "/products/optimized/dualsense-edge-case.webp": [900, 900],
  "/products/controllers/xbox-wireless-carbon-black-front.webp": [1600, 693],
  "/products/controllers/xbox-wireless-carbon-black-angle.webp": [1083, 609],
  "/products/controllers/xbox-wireless-robot-white-front.webp": [1600, 693],
  "/products/controllers/xbox-wireless-robot-white-angle.webp": [1083, 609],
  "/products/controllers/nintendo-switch-pro-controller-box.webp": [1200, 675],
  "/products/controllers/nintendo-switch-pro-controller-angle.webp": [
    1200, 675,
  ],
  "/products/controllers/nintendo-switch-pro-controller-back.webp": [1200, 675],
  "/products/controllers/joy-con-neon-blue-left.webp": [208, 592],
  "/products/controllers/joy-con-neon-red-right.webp": [208, 592],
  "/products/games/grand-theft-auto-vi-key-art.webp": [1600, 900],
  "/products/games/grand-theft-auto-vi-hero.webp": [1600, 900],
  "/products/games/grand-theft-auto-vi-gallery-01.webp": [1350, 759],
  "/products/games/ea-sports-fc-26-cover.webp": [1024, 1024],
  "/products/games/ea-sports-fc-26-key-art.webp": [1600, 900],
  "/products/games/ea-sports-fc-26-icons.webp": [840, 840],
  "/products/games/marvels-spider-man-2-cover.webp": [1024, 1024],
  "/products/games/marvels-spider-man-2-screenshot-01.webp": [1600, 900],
  "/products/games/marvels-spider-man-2-screenshot-02.webp": [1600, 900],
  "/products/games/god-of-war-ragnarok-cover.webp": [1024, 1024],
  "/products/games/god-of-war-ragnarok-screenshot-01.webp": [1600, 900],
  "/products/games/god-of-war-ragnarok-screenshot-02.webp": [1600, 1200],
  "/products/games/astro-bot-cover.webp": [1024, 1024],
  "/products/games/astro-bot-key-art.webp": [1600, 900],
  "/products/games/astro-bot-screenshot-01.webp": [1600, 900],
  "/products/games/call-of-duty-black-ops-7-key-art.webp": [1600, 900],
  "/products/games/call-of-duty-black-ops-7-hero.webp": [1600, 900],
  "/products/games/call-of-duty-black-ops-7-gallery-01.webp": [1350, 759],
  "/products/games/forza-horizon-5-hero.webp": [1600, 900],
  "/products/games/forza-horizon-5-gallery-01.webp": [1350, 759],
  "/products/games/forza-horizon-5-gallery-02.webp": [1350, 759],
  "/products/games/mario-kart-8-deluxe-cover.webp": [1600, 900],
  "/products/games/mario-kart-8-deluxe-screenshot-01.webp": [1280, 720],
  "/products/games/mario-kart-8-deluxe-screenshot-02.webp": [1280, 720],
  "/products/games/zelda-tears-of-the-kingdom-cover.webp": [1600, 900],
  "/products/games/zelda-tears-of-the-kingdom-screenshot-01.webp": [1280, 720],
  "/products/games/zelda-tears-of-the-kingdom-screenshot-02.webp": [1280, 720],
  "/products/games/super-mario-bros-wonder-cover.webp": [1600, 900],
  "/products/games/super-mario-bros-wonder-screenshot-01.webp": [1280, 720],
  "/products/games/super-mario-bros-wonder-screenshot-02.webp": [1280, 720],
};

type ProductSeed = {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  category: Product["category"];
  platform?: Product["platform"];
  type: Product["type"];
  condition?: Product["condition"];
  brand: string;
  model: string;
  priceCents: number;
  promoPriceCents?: number;
  sku: string;
  stock: number;
  lowStockThreshold?: number;
  imageAlt: string;
  imageUrls: string[];
  imageLabels?: string[];
  features: string[];
  specifications?: Product["specifications"];
  warranty: string;
  deliveryTerms: string;
  availabilityStatus?: Product["availabilityStatus"];
  releaseDate?: string;
  releaseDateLabel?: string;
  featured?: boolean;
  offer?: boolean;
  seoTitle: string;
  seoDescription: string;
  variants?: Product["variants"];
};

function productImages(seed: ProductSeed) {
  return seed.imageUrls.map((url, index) => {
    const [width, height] = assetDimensions[url] ?? [1200, 900];
    const label = seed.imageLabels?.[index] ?? `imagen ${index + 1}`;

    return {
      id: `img-${seed.slug}-${index + 1}`,
      url,
      alt: `${seed.imageAlt}, ${label}`,
      position: index + 1,
      isPrimary: index === 0,
      blurDataUrl,
      width,
      height,
    };
  });
}

function realProduct(seed: ProductSeed): Product {
  const images = productImages(seed);

  return {
    id: seed.id,
    slug: seed.slug,
    name: seed.name,
    shortDescription: seed.shortDescription,
    description: seed.description,
    category: seed.category,
    platform: seed.platform,
    type: seed.type,
    condition: seed.condition ?? "new",
    brand: seed.brand,
    model: seed.model,
    priceCents: seed.priceCents,
    promoPriceCents: seed.promoPriceCents,
    sku: seed.sku,
    stock: seed.stock,
    lowStockThreshold: seed.lowStockThreshold ?? 3,
    images,
    mainImage: images[0]?.url ?? "/products/product-placeholder.svg",
    features: seed.features,
    warranty: seed.warranty,
    deliveryTerms: seed.deliveryTerms,
    availabilityStatus:
      seed.availabilityStatus ??
      (seed.stock > 0 ? "available" : "out_of_stock"),
    releaseDate: seed.releaseDate,
    releaseDateLabel: seed.releaseDateLabel,
    publicationStatus: "published",
    featured: seed.featured ?? false,
    offer: seed.offer ?? false,
    transferEnabled: seed.promoPriceCents !== undefined,
    createdAt: now,
    updatedAt: now,
    seoTitle: seed.seoTitle,
    seoDescription: seed.seoDescription,
    specifications: seed.specifications,
    variants: seed.variants ?? [],
    demo: true,
  };
}

const garantiaFisica =
  "Garantía comercial configurable desde administración. Textos legales pendientes de revisión profesional.";
const garantiaDigital =
  "Condiciones de contenido digital pendientes de revisión profesional y configuración comercial.";
const entregaFisica =
  "Envío a domicilio con costo calculado por provincia o retiro si se habilita desde administración.";
const entregaDigital =
  "Entrega digital manual por el canal configurado luego de pago aprobado. No es entrega instantánea.";

export const demoProducts: Product[] = [
  realProduct({
    id: "prod-console-ps5-slim-digital",
    slug: "playstation-5-slim-digital-edition",
    name: "PlayStation 5 Slim Digital Edition",
    shortDescription:
      "PS5 Digital Edition sin lectora, con SSD de 825 GB y control DualSense.",
    description:
      "Consola PlayStation 5 Digital Edition del grupo slim, orientada a juegos descargados desde PlayStation Store. La información oficial indica diseño compacto, SSD ultra veloz, salida 4K, ray tracing, compatibilidad con haptic feedback y adaptive triggers en juegos compatibles.",
    category: "Consolas",
    platform: "PlayStation",
    type: "physical",
    brand: "Sony Interactive Entertainment",
    model: "PS5 Digital Edition - 825GB",
    priceCents: 1_250_000_00,
    promoPriceCents: 1_189_000_00,
    sku: "TPG-PS5-DIG-825",
    stock: 4,
    imageAlt: "PlayStation 5 Slim Digital Edition",
    imageUrls: [
      "/products/consoles/ps5-slim-digital-front.webp",
      "/products/consoles/ps5-slim-digital-console-dualsense.webp",
      "/products/consoles/ps5-slim-digital-box.webp",
    ],
    imageLabels: ["vista frontal", "consola con control", "caja oficial"],
    features: [
      "Edición digital sin lectora de discos",
      "825 GB de almacenamiento interno",
      "SSD ultra veloz, ray tracing y salida 4K con contenido compatible",
      "Incluye control DualSense",
    ],
    specifications: [
      { label: "Almacenamiento", value: "825 GB" },
      { label: "Formato", value: "Digital, sin lectora integrada" },
      { label: "Contenido incluido", value: "Consola y control DualSense" },
    ],
    warranty: garantiaFisica,
    deliveryTerms: entregaFisica,
    featured: true,
    offer: true,
    seoTitle: "PlayStation 5 Slim Digital Edition | T.PlayGames",
    seoDescription:
      "PS5 Digital Edition con SSD de 825 GB, sin lectora y control DualSense. Catálogo T.PlayGames.",
    variants: [
      {
        id: "var-ps5-slim-digital-825",
        sku: "TPG-PS5-DIG-825-WHT",
        label: "825 GB · Digital",
        capacity: "825 GB",
        platform: "PlayStation",
        format: "physical",
        condition: "new",
        stock: 4,
        available: true,
      },
    ],
  }),
  realProduct({
    id: "prod-console-ps5-slim-standard",
    slug: "playstation-5-slim-standard-edition-lectora",
    name: "PlayStation 5 Slim Standard Edition con lectora",
    shortDescription:
      "PS5 Console - 1TB con lectora Blu-ray Disc y control DualSense.",
    description:
      "Consola PlayStation 5 con lectora, listada oficialmente como PS5 Console - 1TB. Permite jugar títulos de PS5 y PS4 en discos Blu-ray y también descargar juegos digitales desde PlayStation Store.",
    category: "Consolas",
    platform: "PlayStation",
    type: "physical",
    brand: "Sony Interactive Entertainment",
    model: "PS5 Console - 1TB",
    priceCents: 1_420_000_00,
    sku: "TPG-PS5-SLIM-DISC-1TB",
    stock: 3,
    imageAlt: "PlayStation 5 Slim Standard Edition con lectora",
    imageUrls: [
      "/products/consoles/ps5-slim-standard-front.webp",
      "/products/consoles/ps5-slim-standard-box.webp",
    ],
    imageLabels: ["vista frontal", "caja oficial"],
    features: [
      "Lectora Blu-ray Disc integrada",
      "1 TB de almacenamiento interno",
      "Compatible con juegos físicos PS5 y PS4 admitidos",
      "Incluye control DualSense",
    ],
    specifications: [
      { label: "Almacenamiento", value: "1 TB" },
      { label: "Formato", value: "Con lectora Blu-ray Disc" },
      { label: "Contenido incluido", value: "Consola y control DualSense" },
    ],
    warranty: garantiaFisica,
    deliveryTerms: entregaFisica,
    featured: true,
    seoTitle: "PlayStation 5 Slim Standard Edition con lectora | T.PlayGames",
    seoDescription:
      "PS5 Console - 1TB con lectora Blu-ray Disc y control DualSense.",
    variants: [
      {
        id: "var-ps5-slim-standard-1tb",
        sku: "TPG-PS5-SLIM-DISC-1TB-WHT",
        label: "1 TB · Con lectora",
        capacity: "1 TB",
        platform: "PlayStation",
        format: "physical",
        condition: "new",
        stock: 3,
        available: true,
      },
    ],
  }),
  realProduct({
    id: "prod-console-ps5-pro",
    slug: "playstation-5-pro",
    name: "PlayStation 5 Pro",
    shortDescription:
      "PS5 Pro con 2 TB, PSSR, ray tracing avanzado y alto rendimiento.",
    description:
      "PlayStation 5 Pro es la consola de mayor rendimiento de la familia PS5. La ficha oficial destaca PlayStation Spectral Super Resolution, ray tracing avanzado, mayor estabilidad de frame rate y 2 TB de almacenamiento. La lectora de discos se vende por separado.",
    category: "Consolas",
    platform: "PlayStation",
    type: "physical",
    brand: "Sony Interactive Entertainment",
    model: "PlayStation 5 Pro Console - 2TB",
    priceCents: 1_980_000_00,
    promoPriceCents: 1_899_000_00,
    sku: "TPG-PS5-PRO-2TB",
    stock: 2,
    lowStockThreshold: 2,
    imageAlt: "PlayStation 5 Pro",
    imageUrls: [
      "/products/consoles/ps5-pro-angled.webp",
      "/products/consoles/ps5-pro-front.webp",
      "/products/consoles/ps5-pro-box.webp",
    ],
    imageLabels: ["vista con control", "vista frontal", "caja oficial"],
    features: [
      "2 TB de almacenamiento interno",
      "PlayStation Spectral Super Resolution",
      "Ray tracing avanzado y mejor rendimiento en juegos compatibles",
      "Lectora de discos compatible vendida por separado",
    ],
    specifications: [
      { label: "Almacenamiento", value: "2 TB" },
      { label: "Formato", value: "Digital, lectora opcional por separado" },
      { label: "Tecnología", value: "PSSR y ray tracing avanzado" },
    ],
    warranty: garantiaFisica,
    deliveryTerms: entregaFisica,
    featured: true,
    offer: true,
    seoTitle: "PlayStation 5 Pro | T.PlayGames",
    seoDescription:
      "PlayStation 5 Pro con 2 TB, PSSR y mejoras visuales para juegos PS5 compatibles.",
  }),
  realProduct({
    id: "prod-console-xbox-series-s-512",
    slug: "xbox-series-s-512-gb",
    name: "Xbox Series S 512 GB",
    shortDescription:
      "Xbox Series S all-digital en Robot White con SSD de 512 GB.",
    description:
      "Xbox Series S es una consola all-digital compacta. La página oficial destaca compatibilidad con juegos digitales, Xbox Velocity Architecture, Quick Resume y gameplay de hasta 120 FPS con contenido y pantalla compatibles.",
    category: "Consolas",
    platform: "Xbox",
    type: "physical",
    brand: "Microsoft",
    model: "Xbox Series S 512GB",
    priceCents: 720_000_00,
    promoPriceCents: 689_000_00,
    sku: "TPG-XSS-512-WHT",
    stock: 6,
    imageAlt: "Xbox Series S 512 GB",
    imageUrls: [
      "/products/consoles/xbox-series-s-512-front.webp",
      "/products/consoles/xbox-series-s-512-angle.webp",
    ],
    imageLabels: ["vista principal", "vista frontal"],
    features: [
      "Consola all-digital sin lectora",
      "512 GB de almacenamiento SSD",
      "Quick Resume y Xbox Velocity Architecture",
      "Hasta 120 FPS con contenido y pantalla compatibles",
    ],
    specifications: [
      { label: "Almacenamiento", value: "512 GB" },
      { label: "Formato", value: "Digital, sin lectora" },
      { label: "Color", value: "Robot White" },
    ],
    warranty: garantiaFisica,
    deliveryTerms: entregaFisica,
    featured: true,
    offer: true,
    seoTitle: "Xbox Series S 512 GB | T.PlayGames",
    seoDescription:
      "Xbox Series S all-digital con SSD de 512 GB y control Xbox Wireless.",
  }),
  realProduct({
    id: "prod-console-xbox-series-s-1tb",
    slug: "xbox-series-s-1-tb",
    name: "Xbox Series S 1 TB",
    shortDescription: "Xbox Series S Carbon Black all-digital con SSD de 1 TB.",
    description:
      "Xbox Series S 1TB en Carbon Black ofrece más almacenamiento en el formato compacto all-digital de Xbox Series S. La información oficial destaca Quick Resume, cargas rápidas y gameplay de hasta 120 FPS en contenido compatible.",
    category: "Consolas",
    platform: "Xbox",
    type: "physical",
    brand: "Microsoft",
    model: "Xbox Series S 1TB Carbon Black",
    priceCents: 890_000_00,
    sku: "TPG-XSS-1TB-BLK",
    stock: 5,
    imageAlt: "Xbox Series S 1 TB Carbon Black",
    imageUrls: [
      "/products/consoles/xbox-series-s-1tb-front.webp",
      "/products/consoles/xbox-series-s-1tb-angle.webp",
    ],
    imageLabels: ["vista principal", "vista frontal"],
    features: [
      "Consola all-digital sin lectora",
      "1 TB de almacenamiento SSD",
      "Quick Resume y Xbox Velocity Architecture",
      "Color Carbon Black",
    ],
    specifications: [
      { label: "Almacenamiento", value: "1 TB" },
      { label: "Formato", value: "Digital, sin lectora" },
      { label: "Color", value: "Carbon Black" },
    ],
    warranty: garantiaFisica,
    deliveryTerms: entregaFisica,
    seoTitle: "Xbox Series S 1 TB Carbon Black | T.PlayGames",
    seoDescription:
      "Xbox Series S 1TB Carbon Black all-digital con SSD y control Xbox Wireless.",
  }),
  realProduct({
    id: "prod-console-xbox-series-x-1tb",
    slug: "xbox-series-x-1-tb",
    name: "Xbox Series X 1 TB",
    shortDescription:
      "Xbox Series X Carbon Black con SSD de 1 TB y lector de discos.",
    description:
      "Xbox Series X es la consola de mayor potencia de la familia Xbox Series. La ficha oficial destaca 1 TB de almacenamiento SSD, gaming 4K verdadero, hasta 120 FPS en contenido compatible y lector de discos integrado.",
    category: "Consolas",
    platform: "Xbox",
    type: "physical",
    brand: "Microsoft",
    model: "Xbox Series X 1TB Carbon Black",
    priceCents: 1_350_000_00,
    sku: "TPG-XSX-1TB-BLK",
    stock: 3,
    imageAlt: "Xbox Series X 1 TB Carbon Black",
    imageUrls: [
      "/products/consoles/xbox-series-x-1tb-front.webp",
      "/products/consoles/xbox-series-x-1tb-angle.webp",
    ],
    imageLabels: ["vista principal", "vista frontal"],
    features: [
      "1 TB de almacenamiento SSD",
      "Gaming 4K verdadero con contenido compatible",
      "Hasta 120 FPS con contenido y pantalla compatibles",
      "Lector de discos integrado",
    ],
    specifications: [
      { label: "Almacenamiento", value: "1 TB" },
      { label: "Formato", value: "Con lectora" },
      { label: "Color", value: "Carbon Black" },
    ],
    warranty: garantiaFisica,
    deliveryTerms: entregaFisica,
    featured: true,
    seoTitle: "Xbox Series X 1 TB | T.PlayGames",
    seoDescription:
      "Xbox Series X Carbon Black con SSD de 1 TB, lector de discos y gaming 4K compatible.",
  }),
  realProduct({
    id: "prod-console-nintendo-switch-oled",
    slug: "nintendo-switch-oled",
    name: "Nintendo Switch OLED",
    shortDescription:
      "Nintendo Switch OLED con pantalla OLED de 7 pulgadas y dock con LAN.",
    description:
      "Nintendo Switch - OLED Model suma pantalla OLED de 7 pulgadas, soporte ajustable ancho, base con puerto LAN por cable, 64 GB de almacenamiento interno y los modos TV, tabletop y portátil de Nintendo Switch.",
    category: "Consolas",
    platform: "Nintendo",
    type: "physical",
    brand: "Nintendo",
    model: "Nintendo Switch - OLED Model",
    priceCents: 680_000_00,
    sku: "TPG-NSW-OLED-WHT",
    stock: 6,
    imageAlt: "Nintendo Switch OLED",
    imageUrls: [
      "/products/consoles/nintendo-switch-oled-box.webp",
      "/products/consoles/nintendo-switch-oled-screen.webp",
      "/products/consoles/nintendo-switch-oled-stand.webp",
    ],
    imageLabels: ["caja oficial", "pantalla OLED", "dock y soporte"],
    features: [
      "Pantalla OLED de 7 pulgadas",
      "Soporte ajustable ancho",
      "Dock con puerto LAN por cable",
      "64 GB de almacenamiento interno",
    ],
    specifications: [
      { label: "Pantalla", value: "OLED de 7 pulgadas" },
      { label: "Almacenamiento", value: "64 GB" },
      { label: "Modos", value: "TV, tabletop y portátil" },
    ],
    warranty: garantiaFisica,
    deliveryTerms: entregaFisica,
    featured: true,
    seoTitle: "Nintendo Switch OLED | T.PlayGames",
    seoDescription:
      "Nintendo Switch OLED con pantalla de 7 pulgadas, dock con LAN y 64 GB.",
  }),
  realProduct({
    id: "prod-console-nintendo-switch-lite",
    slug: "nintendo-switch-lite",
    name: "Nintendo Switch Lite",
    shortDescription:
      "Nintendo Switch Lite compacta para juego portátil compatible.",
    description:
      "Nintendo Switch Lite es una consola compacta y liviana, dedicada al juego portátil. Está pensada para títulos de Nintendo Switch compatibles con modo handheld.",
    category: "Consolas",
    platform: "Nintendo",
    type: "physical",
    brand: "Nintendo",
    model: "Nintendo Switch Lite",
    priceCents: 420_000_00,
    promoPriceCents: 399_000_00,
    sku: "TPG-NSW-LITE-YEL",
    stock: 7,
    imageAlt: "Nintendo Switch Lite",
    imageUrls: [
      "/products/consoles/nintendo-switch-lite-box.webp",
      "/products/consoles/nintendo-switch-lite-handheld.webp",
      "/products/consoles/nintendo-switch-lite-gallery.webp",
    ],
    imageLabels: ["caja oficial", "modo portátil", "imagen lifestyle"],
    features: [
      "Diseño compacto y liviano",
      "Dedicada al juego portátil",
      "Controles integrados",
      "Compatible con juegos de Nintendo Switch con modo handheld",
    ],
    specifications: [
      { label: "Formato", value: "Portátil" },
      { label: "Controles", value: "Integrados" },
      { label: "Compatibilidad", value: "Juegos con modo handheld" },
    ],
    warranty: garantiaFisica,
    deliveryTerms: entregaFisica,
    offer: true,
    seoTitle: "Nintendo Switch Lite | T.PlayGames",
    seoDescription:
      "Nintendo Switch Lite compacta, liviana y dedicada al juego portátil.",
  }),
  realProduct({
    id: "prod-console-nintendo-switch-2",
    slug: "nintendo-switch-2",
    name: "Nintendo Switch 2",
    shortDescription:
      "Sistema Nintendo Switch 2 con Joy-Con 2 y dock, lanzado oficialmente el 5 de junio de 2025.",
    description:
      "Nintendo Switch 2 es el sucesor oficial de Nintendo Switch. La página oficial de Nintendo lista el sistema con fecha de lanzamiento 5 de junio de 2025 e incluye consola, Joy-Con 2 y dock para alternar entre juego en TV, tabletop y portátil.",
    category: "Consolas",
    platform: "Nintendo",
    type: "physical",
    brand: "Nintendo",
    model: "Nintendo Switch 2 System",
    priceCents: 980_000_00,
    sku: "TPG-NSW2-SYS",
    stock: 4,
    imageAlt: "Nintendo Switch 2",
    imageUrls: [
      "/products/consoles/nintendo-switch-2-box.webp",
      "/products/consoles/nintendo-switch-2-dock.webp",
      "/products/consoles/nintendo-switch-2-handheld.webp",
    ],
    imageLabels: ["caja oficial", "dock y accesorios", "modo portátil"],
    features: [
      "Sistema sucesor de Nintendo Switch",
      "Incluye Joy-Con 2 y dock",
      "Compatible con juego en TV, tabletop y portátil",
      "Lanzamiento oficial listado por Nintendo: 5 de junio de 2025",
    ],
    specifications: [
      { label: "Fecha oficial", value: "5 de junio de 2025" },
      { label: "Contenido", value: "Consola, Joy-Con 2 y dock" },
      { label: "Modos", value: "TV, tabletop y portátil" },
    ],
    warranty: garantiaFisica,
    deliveryTerms: entregaFisica,
    featured: true,
    seoTitle: "Nintendo Switch 2 | T.PlayGames",
    seoDescription:
      "Nintendo Switch 2 System con Joy-Con 2 y dock. Catálogo T.PlayGames.",
  }),
  realProduct({
    id: "prod-controller-dualsense-white",
    slug: "dualsense-wireless-controller-blanco",
    name: "DualSense Wireless Controller Blanco",
    shortDescription:
      "Control inalámbrico DualSense White para PS5, PC, Mac y mobile compatibles.",
    description:
      "DualSense Wireless Controller en color White, con haptic feedback, adaptive triggers, micrófono integrado, batería recargable y puerto USB-C, según la ficha oficial de PlayStation Direct.",
    category: "Controles",
    platform: "PlayStation",
    type: "physical",
    brand: "Sony Interactive Entertainment",
    model: "DualSense Wireless Controller White",
    priceCents: 145_000_00,
    promoPriceCents: 135_000_00,
    sku: "TPG-DS-WHT",
    stock: 12,
    imageAlt: "DualSense Wireless Controller Blanco",
    imageUrls: [
      "/products/optimized/dualsense-white-front.webp",
      "/products/optimized/dualsense-white-angle.webp",
      "/products/optimized/dualsense-white-box.webp",
    ],
    imageLabels: ["vista frontal", "vista superior", "caja oficial"],
    features: [
      "Haptic feedback en juegos compatibles",
      "Adaptive triggers en juegos compatibles",
      "Micrófono integrado",
      "Batería recargable y USB-C",
    ],
    specifications: [
      { label: "Color", value: "White" },
      { label: "Conectividad", value: "Inalámbrica" },
      { label: "Carga", value: "USB-C" },
    ],
    warranty: garantiaFisica,
    deliveryTerms: entregaFisica,
    featured: true,
    offer: true,
    seoTitle: "DualSense Wireless Controller Blanco | T.PlayGames",
    seoDescription:
      "Control DualSense White para PS5 con haptic feedback y adaptive triggers.",
  }),
  realProduct({
    id: "prod-controller-dualsense-midnight-black",
    slug: "dualsense-wireless-controller-midnight-black",
    name: "DualSense Wireless Controller Midnight Black",
    shortDescription:
      "Control inalámbrico DualSense Midnight Black para PS5 y dispositivos compatibles.",
    description:
      "DualSense Wireless Controller Midnight Black mantiene las funciones oficiales del control de PS5: haptic feedback, adaptive triggers, micrófono integrado, batería recargable y puerto USB-C.",
    category: "Controles",
    platform: "PlayStation",
    type: "physical",
    brand: "Sony Interactive Entertainment",
    model: "DualSense Wireless Controller Midnight Black",
    priceCents: 155_000_00,
    sku: "TPG-DS-MBLK",
    stock: 10,
    imageAlt: "DualSense Wireless Controller Midnight Black",
    imageUrls: [
      "/products/optimized/dualsense-midnight-black-front.webp",
      "/products/optimized/dualsense-midnight-black-angle.webp",
    ],
    imageLabels: ["vista frontal", "vista superior"],
    features: [
      "Haptic feedback en juegos compatibles",
      "Adaptive triggers en juegos compatibles",
      "Micrófono integrado",
      "Color Midnight Black",
    ],
    specifications: [
      { label: "Color", value: "Midnight Black" },
      { label: "Conectividad", value: "Inalámbrica" },
      { label: "Carga", value: "USB-C" },
    ],
    warranty: garantiaFisica,
    deliveryTerms: entregaFisica,
    seoTitle: "DualSense Wireless Controller Midnight Black | T.PlayGames",
    seoDescription:
      "Control DualSense Midnight Black para PS5 con funciones inmersivas oficiales.",
  }),
  realProduct({
    id: "prod-controller-dualsense-cosmic-red",
    slug: "dualsense-wireless-controller-cosmic-red",
    name: "DualSense Wireless Controller Cosmic Red",
    shortDescription:
      "Control inalámbrico DualSense Cosmic Red para PS5 y dispositivos compatibles.",
    description:
      "DualSense Wireless Controller Cosmic Red combina el color Cosmic Red con las funciones oficiales de DualSense: haptic feedback, adaptive triggers, micrófono integrado, batería recargable y USB-C.",
    category: "Controles",
    platform: "PlayStation",
    type: "physical",
    brand: "Sony Interactive Entertainment",
    model: "DualSense Wireless Controller Cosmic Red",
    priceCents: 165_000_00,
    sku: "TPG-DS-CRED",
    stock: 9,
    imageAlt: "DualSense Wireless Controller Cosmic Red",
    imageUrls: [
      "/products/optimized/dualsense-cosmic-red-front.webp",
      "/products/optimized/dualsense-cosmic-red-angle.webp",
    ],
    imageLabels: ["vista frontal", "vista superior"],
    features: [
      "Haptic feedback en juegos compatibles",
      "Adaptive triggers en juegos compatibles",
      "Micrófono integrado",
      "Color Cosmic Red",
    ],
    specifications: [
      { label: "Color", value: "Cosmic Red" },
      { label: "Conectividad", value: "Inalámbrica" },
      { label: "Carga", value: "USB-C" },
    ],
    warranty: garantiaFisica,
    deliveryTerms: entregaFisica,
    seoTitle: "DualSense Wireless Controller Cosmic Red | T.PlayGames",
    seoDescription:
      "Control DualSense Cosmic Red para PS5 con haptic feedback y adaptive triggers.",
  }),
  realProduct({
    id: "prod-controller-dualsense-edge",
    slug: "dualsense-edge-wireless-controller",
    name: "DualSense Edge Wireless Controller",
    shortDescription:
      "Control profesional DualSense Edge con controles personalizables para PS5.",
    description:
      "DualSense Edge Wireless Controller permite crear controles personalizados, remapear botones, ajustar sensibilidad de sticks, cambiar tapas de sticks, usar botones traseros configurables y transportar el control con su estuche incluido.",
    category: "Controles",
    platform: "PlayStation",
    type: "physical",
    brand: "Sony Interactive Entertainment",
    model: "DualSense Edge Wireless Controller",
    priceCents: 360_000_00,
    promoPriceCents: 339_000_00,
    sku: "TPG-DSE-WHT",
    stock: 5,
    imageAlt: "DualSense Edge Wireless Controller",
    imageUrls: [
      "/products/optimized/dualsense-edge-front.webp",
      "/products/optimized/dualsense-edge-back.webp",
      "/products/optimized/dualsense-edge-case.webp",
    ],
    imageLabels: ["vista frontal", "vista trasera", "estuche abierto"],
    features: [
      "Controles personalizables",
      "Botones remapeables",
      "Tapas de sticks intercambiables",
      "Botones traseros configurables y estuche incluido",
    ],
    specifications: [
      { label: "Linea", value: "DualSense Edge" },
      { label: "Personalización", value: "Perfiles y botones remapeables" },
      { label: "Accesorios", value: "Estuche y tapas de sticks" },
    ],
    warranty: garantiaFisica,
    deliveryTerms: entregaFisica,
    featured: true,
    offer: true,
    seoTitle: "DualSense Edge Wireless Controller | T.PlayGames",
    seoDescription:
      "Control DualSense Edge para PS5 con controles personalizables y estuche.",
  }),
  realProduct({
    id: "prod-controller-xbox-carbon-black",
    slug: "xbox-wireless-controller-carbon-black",
    name: "Xbox Wireless Controller Carbon Black",
    shortDescription:
      "Control Xbox Wireless Carbon Black con grip texturizado y botón Share.",
    description:
      "Xbox Wireless Controller Carbon Black presenta diseño modernizado, superficies texturizadas, D-pad híbrido, botón Share y emparejamiento rápido con Xbox, Windows y dispositivos compatibles.",
    category: "Controles",
    platform: "Xbox",
    type: "physical",
    brand: "Microsoft",
    model: "Xbox Wireless Controller Carbon Black",
    priceCents: 125_000_00,
    sku: "TPG-XWC-CBLK",
    stock: 14,
    imageAlt: "Xbox Wireless Controller Carbon Black",
    imageUrls: [
      "/products/controllers/xbox-wireless-carbon-black-front.webp",
      "/products/controllers/xbox-wireless-carbon-black-angle.webp",
    ],
    imageLabels: ["vista principal", "vista alternativa"],
    features: [
      "Grip texturizado",
      "D-pad híbrido",
      "Botón Share",
      "Emparejamiento rápido con Xbox y dispositivos compatibles",
    ],
    specifications: [
      { label: "Color", value: "Carbon Black" },
      { label: "Conectividad", value: "Inalámbrica" },
      { label: "Compatibilidad", value: "Xbox, Windows, Android e iOS" },
    ],
    warranty: garantiaFisica,
    deliveryTerms: entregaFisica,
    seoTitle: "Xbox Wireless Controller Carbon Black | T.PlayGames",
    seoDescription:
      "Control Xbox Wireless Carbon Black con D-pad híbrido y botón Share.",
  }),
  realProduct({
    id: "prod-controller-xbox-robot-white",
    slug: "xbox-wireless-controller-robot-white",
    name: "Xbox Wireless Controller Robot White",
    shortDescription:
      "Control Xbox Wireless Robot White con diseño moderno y grip texturizado.",
    description:
      "Xbox Wireless Controller Robot White ofrece el diseño actual de Xbox Wireless Controller, con grip texturizado, D-pad híbrido, botón Share y compatibilidad con Xbox, Windows y dispositivos compatibles.",
    category: "Controles",
    platform: "Xbox",
    type: "physical",
    brand: "Microsoft",
    model: "Xbox Wireless Controller Robot White",
    priceCents: 125_000_00,
    promoPriceCents: 116_000_00,
    sku: "TPG-XWC-RWHT",
    stock: 11,
    imageAlt: "Xbox Wireless Controller Robot White",
    imageUrls: [
      "/products/controllers/xbox-wireless-robot-white-front.webp",
      "/products/controllers/xbox-wireless-robot-white-angle.webp",
    ],
    imageLabels: ["vista principal", "vista alternativa"],
    features: [
      "Grip texturizado",
      "D-pad híbrido",
      "Botón Share",
      "Emparejamiento rápido con Xbox y dispositivos compatibles",
    ],
    specifications: [
      { label: "Color", value: "Robot White" },
      { label: "Conectividad", value: "Inalámbrica" },
      { label: "Compatibilidad", value: "Xbox, Windows, Android e iOS" },
    ],
    warranty: garantiaFisica,
    deliveryTerms: entregaFisica,
    offer: true,
    seoTitle: "Xbox Wireless Controller Robot White | T.PlayGames",
    seoDescription:
      "Control Xbox Wireless Robot White con grip texturizado y D-pad híbrido.",
  }),
  realProduct({
    id: "prod-controller-nintendo-switch-pro",
    slug: "nintendo-switch-pro-controller",
    name: "Nintendo Switch Pro Controller",
    shortDescription:
      "Control inalámbrico Nintendo Switch Pro Controller con motion controls y HD rumble.",
    description:
      "Nintendo Switch Pro Controller es el control inalámbrico oficial de Nintendo para jugar con mayor comodidad. La ficha oficial menciona motion controls, HD rumble y funciones compatibles con Nintendo Switch.",
    category: "Controles",
    platform: "Nintendo",
    type: "physical",
    brand: "Nintendo",
    model: "Nintendo Switch Pro Controller",
    priceCents: 135_000_00,
    sku: "TPG-NSW-PRO-CTRL",
    stock: 8,
    imageAlt: "Nintendo Switch Pro Controller",
    imageUrls: [
      "/products/controllers/nintendo-switch-pro-controller-box.webp",
      "/products/controllers/nintendo-switch-pro-controller-angle.webp",
      "/products/controllers/nintendo-switch-pro-controller-back.webp",
    ],
    imageLabels: ["caja oficial", "vista alternativa", "vista trasera"],
    features: [
      "Control inalámbrico oficial Nintendo",
      "Motion controls",
      "HD rumble",
      "Diseño cómodo para sesiones largas",
    ],
    specifications: [
      { label: "Linea", value: "Nintendo Switch Pro Controller" },
      { label: "Funciones", value: "Motion controls y HD rumble" },
      { label: "Compatibilidad", value: "Nintendo Switch" },
    ],
    warranty: garantiaFisica,
    deliveryTerms: entregaFisica,
    seoTitle: "Nintendo Switch Pro Controller | T.PlayGames",
    seoDescription:
      "Control Nintendo Switch Pro Controller con motion controls y HD rumble.",
  }),
  realProduct({
    id: "prod-controller-joycon-neon-red-blue",
    slug: "joy-con-neon-red-neon-blue",
    name: "Joy-Con Neon Red / Neon Blue",
    shortDescription:
      "Par Joy-Con para Nintendo Switch en combinación Neon Blue y Neon Red.",
    description:
      "Par de controles Joy-Con para Nintendo Switch en colores Neon Blue y Neon Red, verificados desde el visor oficial de colores de Nintendo y la página oficial de Joy-Con Set.",
    category: "Controles",
    platform: "Nintendo",
    type: "physical",
    brand: "Nintendo",
    model: "Joy-Con (L)/(R) Neon Red/Neon Blue",
    priceCents: 155_000_00,
    sku: "TPG-JOYCON-NRNB",
    stock: 9,
    imageAlt: "Joy-Con Neon Red y Neon Blue",
    imageUrls: [
      "/products/controllers/joy-con-neon-blue-left.webp",
      "/products/controllers/joy-con-neon-red-right.webp",
    ],
    imageLabels: ["Joy-Con izquierdo Neon Blue", "Joy-Con derecho Neon Red"],
    features: [
      "Joy-Con izquierdo Neon Blue",
      "Joy-Con derecho Neon Red",
      "Uso en modo individual o en par según el juego",
      "Producto oficial Nintendo Switch",
    ],
    specifications: [
      { label: "Colores", value: "Neon Blue / Neon Red" },
      { label: "Formato", value: "Par Joy-Con L/R" },
      { label: "Compatibilidad", value: "Nintendo Switch" },
    ],
    warranty: garantiaFisica,
    deliveryTerms: entregaFisica,
    seoTitle: "Joy-Con Neon Red / Neon Blue | T.PlayGames",
    seoDescription: "Par Joy-Con Neon Blue y Neon Red para Nintendo Switch.",
  }),
  realProduct({
    id: "prod-game-grand-theft-auto-vi",
    slug: "grand-theft-auto-vi",
    name: "Grand Theft Auto VI",
    shortDescription:
      "Preventa informativa. Lanzamiento oficial: 19 de noviembre de 2026 para PS5 y Xbox Series X|S.",
    description:
      "Grand Theft Auto VI fue verificado en fuentes oficiales de Rockstar Games y Xbox. Rockstar lo describe como una experiencia single player y confirma lanzamiento para PlayStation 5 y Xbox Series X|S el 19 de noviembre de 2026. En este entorno queda publicado como preventa informativa, sin entrega inmediata ni venta de códigos.",
    category: "Juegos",
    platform: "PlayStation",
    type: "digital",
    brand: "Rockstar Games",
    model: "Grand Theft Auto VI",
    priceCents: 110_000_00,
    sku: "TPG-GTA-VI-PRE",
    stock: 0,
    lowStockThreshold: 0,
    imageAlt: "Grand Theft Auto VI",
    imageUrls: [
      "/products/games/grand-theft-auto-vi-key-art.webp",
      "/products/games/grand-theft-auto-vi-hero.webp",
      "/products/games/grand-theft-auto-vi-gallery-01.webp",
    ],
    imageLabels: ["key art oficial", "hero oficial", "galería oficial"],
    features: [
      "Experiencia single player anunciada por Rockstar Games",
      "Confirmado para PlayStation 5 y Xbox Series X|S",
      "Lanzamiento oficial: 19 de noviembre de 2026",
      "Sin entrega inmediata en este entorno",
    ],
    specifications: [
      { label: "Estado", value: "Preventa informativa" },
      { label: "Fecha oficial", value: "19 de noviembre de 2026" },
      { label: "Plataformas oficiales", value: "PS5 y Xbox Series X|S" },
    ],
    warranty: garantiaDigital,
    deliveryTerms:
      "Preventa informativa. No se habilita entrega ni venta de códigos hasta configurar condiciones comerciales reales.",
    availabilityStatus: "preorder",
    releaseDate: "2026-11-19",
    releaseDateLabel: "19 de noviembre de 2026",
    featured: true,
    seoTitle: "Grand Theft Auto VI | T.PlayGames",
    seoDescription:
      "Grand Theft Auto VI verificado en fuentes oficiales. Preventa informativa con lanzamiento el 19 de noviembre de 2026.",
    variants: [
      {
        id: "var-gta-vi-ps5-digital-preorder",
        sku: "TPG-GTA-VI-PS5-PRE",
        label: "PlayStation 5 · preventa informativa",
        platform: "PlayStation",
        format: "digital",
        stock: 0,
        available: false,
      },
      {
        id: "var-gta-vi-xbox-digital-preorder",
        sku: "TPG-GTA-VI-XBX-PRE",
        label: "Xbox Series X|S · preventa informativa",
        platform: "Xbox",
        format: "digital",
        stock: 0,
        available: false,
      },
    ],
  }),
  realProduct({
    id: "prod-game-ea-sports-fc-26",
    slug: "ea-sports-fc-26",
    name: "EA Sports FC 26",
    shortDescription:
      "EA SPORTS FC 26 en formato digital para PC con entrega manual.",
    description:
      "EA SPORTS FC 26 fue verificado en las páginas oficiales de EA y PlayStation. La información oficial destaca una experiencia de gameplay trabajada con feedback de la comunidad, Football Ultimate Team, Clubs y autenticidad con jugadores, clubes y ligas licenciadas.",
    category: "Juegos",
    platform: "PC",
    type: "digital",
    brand: "Electronic Arts",
    model: "EA SPORTS FC 26",
    priceCents: 74_000_00,
    promoPriceCents: 69_000_00,
    sku: "TPG-FC26-PC-DIG",
    stock: 25,
    imageAlt: "EA Sports FC 26",
    imageUrls: [
      "/products/games/ea-sports-fc-26-cover.webp",
      "/products/games/ea-sports-fc-26-key-art.webp",
      "/products/games/ea-sports-fc-26-icons.webp",
    ],
    imageLabels: ["portada oficial", "key art oficial", "arte oficial"],
    features: [
      "Gameplay actualizado con feedback de la comunidad",
      "Football Ultimate Team",
      "Clubs y Carrera",
      "20.000+ jugadores auténticos según información oficial",
    ],
    specifications: [
      { label: "Formato", value: "Digital PC" },
      { label: "Publisher", value: "Electronic Arts" },
      { label: "Entrega", value: "Manual desde administración" },
    ],
    warranty: garantiaDigital,
    deliveryTerms: entregaDigital,
    featured: true,
    offer: true,
    seoTitle: "EA Sports FC 26 PC Digital | T.PlayGames",
    seoDescription:
      "EA SPORTS FC 26 para PC en formato digital con entrega manual protegida.",
    variants: [
      {
        id: "var-fc26-pc-digital",
        sku: "TPG-FC26-PC-DIG-STD",
        label: "PC digital",
        platform: "PC",
        format: "digital",
        stock: 25,
        available: true,
      },
    ],
  }),
  realProduct({
    id: "prod-game-marvels-spider-man-2",
    slug: "marvels-spider-man-2",
    name: "Marvel's Spider-Man 2",
    shortDescription:
      "Aventura de Peter Parker y Miles Morales para PlayStation 5.",
    description:
      "Marvel's Spider-Man 2 fue verificado en la página oficial de PlayStation. Peter Parker y Miles Morales vuelven en una aventura para PS5 con Web Wings, cambios entre protagonistas y Venom como amenaza central.",
    category: "Juegos",
    platform: "PlayStation",
    type: "physical",
    brand: "Sony Interactive Entertainment",
    model: "Marvel's Spider-Man 2",
    priceCents: 82_000_00,
    sku: "TPG-SM2-PS5-FIS",
    stock: 18,
    imageAlt: "Marvel's Spider-Man 2",
    imageUrls: [
      "/products/games/marvels-spider-man-2-cover.webp",
      "/products/games/marvels-spider-man-2-screenshot-01.webp",
      "/products/games/marvels-spider-man-2-screenshot-02.webp",
    ],
    imageLabels: ["portada oficial", "captura oficial", "captura oficial"],
    features: [
      "Exclusivo destacado de PS5 en la ficha oficial de PlayStation",
      "Peter Parker y Miles Morales jugables",
      "Web Wings para recorrer Marvel's New York",
      "Venom como amenaza principal",
    ],
    specifications: [
      { label: "Plataforma", value: "PlayStation 5" },
      { label: "Publisher", value: "Sony Interactive Entertainment" },
      { label: "Formato seed", value: "Físico" },
    ],
    warranty: garantiaFisica,
    deliveryTerms: entregaFisica,
    featured: true,
    seoTitle: "Marvel's Spider-Man 2 PS5 | T.PlayGames",
    seoDescription:
      "Marvel's Spider-Man 2 para PS5 con Peter Parker, Miles Morales y Venom.",
  }),
  realProduct({
    id: "prod-game-god-of-war-ragnarok",
    slug: "god-of-war-ragnarok",
    name: "God of War Ragnarok",
    shortDescription:
      "Kratos y Atreus recorren los Nueve Reinos en la aventura de Santa Monica Studio.",
    description:
      "God of War Ragnarok fue verificado en la página oficial de PlayStation. La ficha oficial invita a acompañar a Kratos y Atreus por los Nueve Reinos en busca de respuestas y aliados.",
    category: "Juegos",
    platform: "PlayStation",
    type: "physical",
    brand: "Sony Interactive Entertainment",
    model: "God of War Ragnarok",
    priceCents: 69_000_00,
    promoPriceCents: 62_000_00,
    sku: "TPG-GOWR-PS5-FIS",
    stock: 16,
    imageAlt: "God of War Ragnarok",
    imageUrls: [
      "/products/games/god-of-war-ragnarok-cover.webp",
      "/products/games/god-of-war-ragnarok-screenshot-01.webp",
      "/products/games/god-of-war-ragnarok-screenshot-02.webp",
    ],
    imageLabels: ["portada oficial", "captura oficial", "key art oficial"],
    features: [
      "Aventura de Kratos y Atreus",
      "Exploración de los Nueve Reinos",
      "Combate y progresión de la saga God of War",
      "Ficha oficial disponible para PS5 y PS4",
    ],
    specifications: [
      { label: "Plataforma seed", value: "PlayStation 5" },
      { label: "Publisher", value: "Sony Interactive Entertainment" },
      { label: "Formato seed", value: "Físico" },
    ],
    warranty: garantiaFisica,
    deliveryTerms: entregaFisica,
    offer: true,
    seoTitle: "God of War Ragnarok PS5 | T.PlayGames",
    seoDescription:
      "God of War Ragnarok para PlayStation con Kratos y Atreus en los Nueve Reinos.",
  }),
  realProduct({
    id: "prod-game-astro-bot",
    slug: "astro-bot",
    name: "Astro Bot",
    shortDescription:
      "Aventura completa de Astro para PS5 con más de 300 bots por rescatar.",
    description:
      "Astro Bot fue verificado en la página oficial de PlayStation. La ficha oficial lo describe como una aventura independiente y completa para PS5, con más mundos, más de 300 bots por rescatar y una experiencia single player.",
    category: "Juegos",
    platform: "PlayStation",
    type: "physical",
    brand: "Sony Interactive Entertainment",
    model: "Astro Bot",
    priceCents: 76_000_00,
    sku: "TPG-ASTRO-PS5-FIS",
    stock: 20,
    imageAlt: "Astro Bot",
    imageUrls: [
      "/products/games/astro-bot-cover.webp",
      "/products/games/astro-bot-key-art.webp",
      "/products/games/astro-bot-screenshot-01.webp",
    ],
    imageLabels: ["portada oficial", "key art oficial", "captura oficial"],
    features: [
      "Aventura standalone para PS5",
      "Más de 300 bots por rescatar",
      "Experiencia single player",
      "Uso destacado de poderes y mundos nuevos",
    ],
    specifications: [
      { label: "Plataforma", value: "PlayStation 5" },
      { label: "Experiencia", value: "Single player" },
      { label: "Formato seed", value: "Físico" },
    ],
    warranty: garantiaFisica,
    deliveryTerms: entregaFisica,
    featured: true,
    seoTitle: "Astro Bot PS5 | T.PlayGames",
    seoDescription:
      "Astro Bot para PS5, aventura standalone con más de 300 bots por rescatar.",
  }),
  realProduct({
    id: "prod-game-call-of-duty-black-ops-7",
    slug: "call-of-duty-black-ops-7",
    name: "Call of Duty: Black Ops 7",
    shortDescription:
      "Black Ops 7 en formato digital Xbox con entrega manual protegida.",
    description:
      "Call of Duty: Black Ops 7 fue verificado en el sitio oficial de Call of Duty y en Xbox. La página oficial lo presenta como el Black Ops más grande, disponible para Xbox, Xbox PC, PlayStation, Battle.net y Steam.",
    category: "Juegos",
    platform: "Xbox",
    type: "digital",
    brand: "Activision",
    model: "Call of Duty: Black Ops 7",
    priceCents: 89_000_00,
    sku: "TPG-BO7-XBX-DIG",
    stock: 18,
    imageAlt: "Call of Duty Black Ops 7",
    imageUrls: [
      "/products/games/call-of-duty-black-ops-7-key-art.webp",
      "/products/games/call-of-duty-black-ops-7-hero.webp",
      "/products/games/call-of-duty-black-ops-7-gallery-01.webp",
    ],
    imageLabels: ["key art oficial", "hero oficial", "captura oficial"],
    features: [
      "Disponible oficialmente para Xbox, Xbox PC y PlayStation",
      "Multiplayer y Zombies destacados en la página oficial",
      "Entrega digital manual en este entorno",
      "No se generan códigos ni claves automáticamente",
    ],
    specifications: [
      { label: "Formato seed", value: "Digital Xbox" },
      { label: "Publisher", value: "Activision" },
      { label: "Entrega", value: "Manual desde administración" },
    ],
    warranty: garantiaDigital,
    deliveryTerms: entregaDigital,
    seoTitle: "Call of Duty: Black Ops 7 Xbox Digital | T.PlayGames",
    seoDescription:
      "Call of Duty: Black Ops 7 en formato digital con entrega manual protegida.",
    variants: [
      {
        id: "var-black-ops-7-xbox-digital",
        sku: "TPG-BO7-XBX-DIG-STD",
        label: "Xbox digital",
        platform: "Xbox",
        format: "digital",
        stock: 18,
        available: true,
      },
      {
        id: "var-black-ops-7-pc-digital",
        sku: "TPG-BO7-PC-DIG-STD",
        label: "PC digital",
        platform: "PC",
        format: "digital",
        stock: 10,
        available: true,
      },
    ],
  }),
  realProduct({
    id: "prod-game-forza-horizon-5",
    slug: "forza-horizon-5",
    name: "Forza Horizon 5",
    shortDescription:
      "Forza Horizon 5 digital para Xbox/PC con entrega manual protegida.",
    description:
      "Forza Horizon 5 fue verificado en Xbox y Forza.net. La ficha oficial destaca el mundo abierto de México, cientos de autos, carreras, Horizon Realms, EventLab y disponibilidad en Xbox Series X|S, Xbox One y PC.",
    category: "Juegos",
    platform: "Xbox",
    type: "digital",
    brand: "Xbox Game Studios",
    model: "Forza Horizon 5",
    priceCents: 59_000_00,
    promoPriceCents: 49_000_00,
    sku: "TPG-FH5-XBX-DIG",
    stock: 28,
    imageAlt: "Forza Horizon 5",
    imageUrls: [
      "/products/games/forza-horizon-5-hero.webp",
      "/products/games/forza-horizon-5-gallery-01.webp",
      "/products/games/forza-horizon-5-gallery-02.webp",
    ],
    imageLabels: ["hero oficial", "captura oficial", "captura oficial"],
    features: [
      "Mundo abierto de México",
      "Cientos de autos",
      "EventLab y contenido actualizado",
      "Disponible oficialmente para Xbox y PC",
    ],
    specifications: [
      { label: "Formato seed", value: "Digital Xbox/PC" },
      { label: "Publisher", value: "Xbox Game Studios" },
      { label: "Entrega", value: "Manual desde administración" },
    ],
    warranty: garantiaDigital,
    deliveryTerms: entregaDigital,
    featured: true,
    offer: true,
    seoTitle: "Forza Horizon 5 Xbox Digital | T.PlayGames",
    seoDescription:
      "Forza Horizon 5 digital para Xbox y PC con entrega manual protegida.",
    variants: [
      {
        id: "var-forza-horizon-5-xbox-digital",
        sku: "TPG-FH5-XBX-DIG-STD",
        label: "Xbox digital",
        platform: "Xbox",
        format: "digital",
        stock: 18,
        available: true,
      },
      {
        id: "var-forza-horizon-5-pc-digital",
        sku: "TPG-FH5-PC-DIG-STD",
        label: "PC digital",
        platform: "PC",
        format: "digital",
        stock: 10,
        available: true,
      },
    ],
  }),
  realProduct({
    id: "prod-game-mario-kart-8-deluxe",
    slug: "mario-kart-8-deluxe",
    name: "Mario Kart 8 Deluxe",
    shortDescription:
      "Carreras de Mario Kart para Nintendo Switch con multijugador local y online.",
    description:
      "Mario Kart 8 Deluxe fue verificado en Nintendo Official Site. La ficha oficial destaca carreras locales y online, personajes de Mario y pistas de la versión Wii U con DLC incluido en la edición Deluxe.",
    category: "Juegos",
    platform: "Nintendo",
    type: "physical",
    brand: "Nintendo",
    model: "Mario Kart 8 Deluxe",
    priceCents: 74_000_00,
    sku: "TPG-MK8D-NSW-FIS",
    stock: 22,
    imageAlt: "Mario Kart 8 Deluxe",
    imageUrls: [
      "/products/games/mario-kart-8-deluxe-cover.webp",
      "/products/games/mario-kart-8-deluxe-screenshot-01.webp",
      "/products/games/mario-kart-8-deluxe-screenshot-02.webp",
    ],
    imageLabels: ["portada oficial", "captura oficial", "captura oficial"],
    features: [
      "Carreras locales y online",
      "Personajes de Mario y amigos",
      "Pistas de la versión Wii U con DLC incluido",
      "Juego para Nintendo Switch",
    ],
    specifications: [
      { label: "Plataforma", value: "Nintendo Switch" },
      { label: "Publisher", value: "Nintendo" },
      { label: "Formato seed", value: "Físico" },
    ],
    warranty: garantiaFisica,
    deliveryTerms: entregaFisica,
    featured: true,
    seoTitle: "Mario Kart 8 Deluxe Nintendo Switch | T.PlayGames",
    seoDescription:
      "Mario Kart 8 Deluxe para Nintendo Switch con carreras locales y online.",
  }),
  realProduct({
    id: "prod-game-zelda-tears-of-the-kingdom",
    slug: "the-legend-of-zelda-tears-of-the-kingdom",
    name: "The Legend of Zelda: Tears of the Kingdom",
    shortDescription: "Aventura de Link en Hyrule para Nintendo Switch.",
    description:
      "The Legend of Zelda: Tears of the Kingdom fue verificado en Nintendo Official Site. La ficha oficial presenta la aventura de Link en Hyrule y sus cielos, con exploración, descubrimiento y nuevas formas de crear soluciones.",
    category: "Juegos",
    platform: "Nintendo",
    type: "physical",
    brand: "Nintendo",
    model: "The Legend of Zelda: Tears of the Kingdom",
    priceCents: 82_000_00,
    sku: "TPG-ZELDA-TOTK-NSW-FIS",
    stock: 19,
    imageAlt: "The Legend of Zelda Tears of the Kingdom",
    imageUrls: [
      "/products/games/zelda-tears-of-the-kingdom-cover.webp",
      "/products/games/zelda-tears-of-the-kingdom-screenshot-01.webp",
      "/products/games/zelda-tears-of-the-kingdom-screenshot-02.webp",
    ],
    imageLabels: ["portada oficial", "captura oficial", "captura oficial"],
    features: [
      "Aventura de Link en Hyrule",
      "Exploración de superficie y cielos",
      "Sistemas de creación y descubrimiento",
      "Juego para Nintendo Switch",
    ],
    specifications: [
      { label: "Plataforma", value: "Nintendo Switch" },
      { label: "Publisher", value: "Nintendo" },
      { label: "Formato seed", value: "Físico" },
    ],
    warranty: garantiaFisica,
    deliveryTerms: entregaFisica,
    seoTitle: "The Legend of Zelda: Tears of the Kingdom | T.PlayGames",
    seoDescription:
      "The Legend of Zelda: Tears of the Kingdom para Nintendo Switch.",
  }),
  realProduct({
    id: "prod-game-super-mario-bros-wonder",
    slug: "super-mario-bros-wonder",
    name: "Super Mario Bros. Wonder",
    shortDescription:
      "Aventura 2D de Mario para Nintendo Switch con efectos Wonder.",
    description:
      "Super Mario Bros. Wonder fue verificado en Nintendo Official Site. La ficha oficial presenta una aventura 2D de Mario con Wonder Flowers, nuevos efectos, personajes jugables y opciones multijugador.",
    category: "Juegos",
    platform: "Nintendo",
    type: "physical",
    brand: "Nintendo",
    model: "Super Mario Bros. Wonder",
    priceCents: 72_000_00,
    promoPriceCents: 66_000_00,
    sku: "TPG-SMBW-NSW-FIS",
    stock: 21,
    imageAlt: "Super Mario Bros. Wonder",
    imageUrls: [
      "/products/games/super-mario-bros-wonder-cover.webp",
      "/products/games/super-mario-bros-wonder-screenshot-01.webp",
      "/products/games/super-mario-bros-wonder-screenshot-02.webp",
    ],
    imageLabels: ["portada oficial", "captura oficial", "captura oficial"],
    features: [
      "Aventura 2D de Mario",
      "Wonder Flowers y efectos Wonder",
      "Personajes jugables de la saga Mario",
      "Opciones multijugador",
    ],
    specifications: [
      { label: "Plataforma", value: "Nintendo Switch" },
      { label: "Publisher", value: "Nintendo" },
      { label: "Formato seed", value: "Físico" },
    ],
    warranty: garantiaFisica,
    deliveryTerms: entregaFisica,
    offer: true,
    seoTitle: "Super Mario Bros. Wonder Nintendo Switch | T.PlayGames",
    seoDescription:
      "Super Mario Bros. Wonder para Nintendo Switch con Wonder Flowers y multijugador.",
  }),
];

export const demoCoupons: Coupon[] = [
  {
    id: "coupon-demo10",
    code: "DEMO10",
    type: "percentage",
    value: 10,
    minPurchaseCents: 1000000,
    startsAt: "2026-01-01T00:00:00.000-03:00",
    endsAt: "2027-01-01T00:00:00.000-03:00",
    totalLimit: 1000,
    perCustomerLimit: 1,
    active: true,
    redemptions: 0,
  },
  {
    id: "coupon-juegos5000",
    code: "JUEGOS5000",
    type: "fixed",
    value: 500000,
    minPurchaseCents: 3000000,
    startsAt: "2026-01-01T00:00:00.000-03:00",
    applicableCategories: ["Juegos"],
    active: true,
    redemptions: 0,
  },
];

export const demoBanners: Banner[] = [
  {
    id: "banner-main",
    title: "Jugá más. Pagá menos.",
    body: "Consolas, controles y juegos con checkout seguro, stock validado y soporte por WhatsApp.",
    ctaLabel: "Ver catálogo",
    href: "/catalogo",
    active: true,
  },
];

export const defaultStoreSettings: StoreSettings = {
  pickupEnabled: false,
  pickupLabel: "Retiro en punto acordado",
  freeShippingFromCents: 150000000,
  defaultShippingCents: 650000,
  provinceShippingCents: {
    "Buenos Aires": 650000,
    CABA: 480000,
    Cordoba: 720000,
    "Santa Fe": 720000,
    Mendoza: 850000,
  },
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "34699463647",
  digitalDeliveryChannel: "email",
  paymentMethods: {
    mercadoPago: true,
    transfer: true,
  },
  transferAccount: {
    alias: process.env.TRANSFER_ALIAS || "teitofriends",
    cvu: process.env.TRANSFER_CVU || "0000003100068654717787",
    accountHolder:
      process.env.TRANSFER_ACCOUNT_HOLDER || "Teodoro di Silvestro",
  },
  transferExpirationHours: Number(
    process.env.TRANSFER_EXPIRATION_HOURS || "24",
  ),
  transferDiscountPercent: undefined,
  installments: [],
  socialLinks: {
    instagram: undefined,
    tiktok: undefined,
  },
};
