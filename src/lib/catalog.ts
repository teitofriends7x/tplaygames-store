import { CATEGORIES } from "@/lib/constants";
import { demoProducts } from "@/lib/demo-data";
import type { CategoryName, PlatformName, Product } from "@/lib/types";

export type CatalogQuery = {
  q?: string;
  category?: CategoryName;
  platform?: PlatformName;
  type?: "physical" | "digital";
  condition?: "new" | "used" | "refurbished";
  brand?: string;
  offer?: boolean;
  available?: boolean;
  minPriceCents?: number;
  maxPriceCents?: number;
  sort?: "relevance" | "price_asc" | "price_desc" | "newest" | "featured";
  page?: number;
  pageSize?: number;
};

export type CatalogResult = {
  products: Product[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export function getPublishedProducts(products = demoProducts): Product[] {
  return products.filter((product) => product.publicationStatus === "published");
}

export function getProductPrice(product: Product): number {
  return product.promoPriceCents ?? product.priceCents;
}

export function getVariantPrice(product: Product, variantId?: string): number {
  const variant = product.variants.find((item) => item.id === variantId);

  return variant?.priceCents ?? getProductPrice(product);
}

export function getProductStock(product: Product, variantId?: string): number {
  const variant = product.variants.find((item) => item.id === variantId);

  return variant ? variant.stock : product.stock;
}

export function findProductBySlug(
  slug: string,
  products = demoProducts,
): Product | undefined {
  return products.find((product) => product.slug === slug);
}

export function findProductById(
  productId: string,
  products = demoProducts,
): Product | undefined {
  return products.find((product) => product.id === productId);
}

export function filterCatalog(
  query: CatalogQuery,
  products = demoProducts,
): CatalogResult {
  const page = Math.max(1, query.page ?? 1);
  const pageSize = Math.min(48, Math.max(1, query.pageSize ?? 12));
  const normalizedQuery = query.q?.trim().toLocaleLowerCase("es-AR");

  const filtered = getPublishedProducts(products).filter((product) => {
    const price = getProductPrice(product);
    const haystack = [
      product.name,
      product.category,
      product.platform,
      product.brand,
      product.model,
      product.sku,
      product.shortDescription,
      product.description,
      ...product.features,
    ]
      .filter(Boolean)
      .join(" ")
      .toLocaleLowerCase("es-AR");

    if (normalizedQuery && !haystack.includes(normalizedQuery)) {
      return false;
    }

    if (query.category && product.category !== query.category) {
      return false;
    }

    if (query.platform && product.platform !== query.platform) {
      return false;
    }

    if (query.type && product.type !== query.type) {
      return false;
    }

    if (query.condition && product.condition !== query.condition) {
      return false;
    }

    if (query.brand && product.brand !== query.brand) {
      return false;
    }

    if (query.offer && !product.offer) {
      return false;
    }

    if (query.available && getProductStock(product) <= 0) {
      return false;
    }

    if (query.minPriceCents && price < query.minPriceCents) {
      return false;
    }

    if (query.maxPriceCents && price > query.maxPriceCents) {
      return false;
    }

    return true;
  });

  filtered.sort((a, b) => {
    switch (query.sort) {
      case "price_asc":
        return getProductPrice(a) - getProductPrice(b);
      case "price_desc":
        return getProductPrice(b) - getProductPrice(a);
      case "newest":
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case "featured":
        return Number(b.featured) - Number(a.featured);
      case "relevance":
      default:
        return (
          Number(b.featured) - Number(a.featured) ||
          Number(b.offer) - Number(a.offer) ||
          a.name.localeCompare(b.name, "es-AR")
        );
    }
  });

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;

  return {
    products: filtered.slice(start, start + pageSize),
    total,
    page,
    pageSize,
    totalPages,
  };
}

export function parseCategory(value?: string | null): CategoryName | undefined {
  return CATEGORIES.find((category) => category === value);
}

export function searchSuggestions(query: string, products = demoProducts) {
  const normalized = query.trim().toLocaleLowerCase("es-AR");

  if (normalized.length < 2 || normalized.length > 80) {
    return [];
  }

  return getPublishedProducts(products)
    .filter((product) =>
      [product.name, product.category, product.platform, product.brand, product.sku]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase("es-AR")
        .includes(normalized),
    )
    .slice(0, 6)
    .map((product) => ({
      id: product.id,
      label: product.name,
      href: `/catalogo/${product.slug}`,
      category: product.category,
      priceCents: getProductPrice(product),
    }));
}
