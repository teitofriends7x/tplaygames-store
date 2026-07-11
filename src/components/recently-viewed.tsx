"use client";

import { useEffect, useMemo, useState } from "react";

import { ProductCard } from "@/components/product-card";
import type { Product } from "@/lib/types";

const KEY = "tplaygames.recentlyViewed.v1";

export function RecentlyViewedProducts({
  currentProductId,
  products,
}: {
  currentProductId: string;
  products: Product[];
}) {
  const [ids] = useState<string[]>(() => {
    if (typeof window === "undefined") {
      return [currentProductId];
    }

    return buildRecentlyViewed(currentProductId);
  });

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(ids));
  }, [ids]);

  const viewed = useMemo(
    () =>
      ids
        .filter((id) => id !== currentProductId)
        .map((id) => products.find((product) => product.id === id))
        .filter((product): product is Product => Boolean(product))
        .slice(0, 4),
    [currentProductId, ids, products],
  );

  if (!viewed.length) {
    return null;
  }

  return (
    <section className="mt-12">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="section-eyebrow">Historial local</p>
          <h2 className="text-2xl font-black text-white">
            Vistos recientemente
          </h2>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {viewed.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

function buildRecentlyViewed(currentProductId: string) {
  try {
    const existing = JSON.parse(localStorage.getItem(KEY) || "[]") as string[];
    return [
      currentProductId,
      ...existing.filter((id) => id !== currentProductId),
    ].slice(0, 8);
  } catch {
    return [currentProductId];
  }
}
