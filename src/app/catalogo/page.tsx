import type { Metadata } from "next";

import { CatalogView } from "@/components/catalog-view";
import type { CatalogQuery } from "@/lib/catalog";
import { CATEGORIES, PLATFORMS } from "@/lib/constants";
import type { CategoryName, PlatformName } from "@/lib/types";

export const metadata: Metadata = {
  title: "Catalogo",
  description: "Catalogo de consolas, controles y juegos de T.PlayGames.",
};

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const query: CatalogQuery = {
    q: stringParam(params.q),
    category: parseCategory(params.category),
    platform: parsePlatform(params.platform),
    offer: stringParam(params.offer) === "true",
    sort: parseSort(params.sort),
    page: Number(stringParam(params.page) ?? 1),
  };

  return <CatalogView query={query} />;
}

function stringParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function parseCategory(
  value: string | string[] | undefined,
): CategoryName | undefined {
  const raw = stringParam(value);
  return CATEGORIES.find((item) => item === raw);
}

function parsePlatform(
  value: string | string[] | undefined,
): PlatformName | undefined {
  const raw = stringParam(value);
  return PLATFORMS.find((item) => item === raw);
}

function parseSort(
  value: string | string[] | undefined,
): CatalogQuery["sort"] {
  const raw = stringParam(value);
  if (
    raw === "price_asc" ||
    raw === "price_desc" ||
    raw === "newest" ||
    raw === "featured"
  ) {
    return raw;
  }

  return "relevance";
}
