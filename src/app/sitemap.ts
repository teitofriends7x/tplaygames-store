import type { MetadataRoute } from "next";

import { listProducts } from "@/lib/store";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const staticRoutes = [
    "",
    "/catalogo",
    "/consolas",
    "/controles",
    "/juegos",
    "/ofertas",
    "/preguntas-frecuentes",
    "/contacto",
    "/envios",
  ];

  return [
    ...staticRoutes.map((route) => ({
      url: `${siteUrl}${route}`,
      lastModified: new Date(),
    })),
    ...listProducts()
      .filter((product) => product.publicationStatus === "published")
      .map((product) => ({
        url: `${siteUrl}/catalogo/${product.slug}`,
        lastModified: new Date(product.updatedAt),
      })),
  ];
}
