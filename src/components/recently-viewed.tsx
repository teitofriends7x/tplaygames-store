"use client";

import { useEffect, useMemo, useSyncExternalStore } from "react";

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
  const snapshot = useSyncExternalStore(
    subscribeRecentlyViewed,
    getRecentlyViewedSnapshot,
    getRecentlyViewedServerSnapshot,
  );
  const ids = useMemo(() => parseRecentlyViewed(snapshot), [snapshot]);

  useEffect(() => {
    const nextIds = buildRecentlyViewed(currentProductId);
    const nextSnapshot = JSON.stringify(nextIds);
    if (localStorage.getItem(KEY) !== nextSnapshot) {
      localStorage.setItem(KEY, nextSnapshot);
      window.dispatchEvent(new Event("tplaygames:recently-viewed"));
    }
  }, [currentProductId]);

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

function subscribeRecentlyViewed(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("tplaygames:recently-viewed", callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("tplaygames:recently-viewed", callback);
  };
}

function getRecentlyViewedSnapshot() {
  return localStorage.getItem(KEY) ?? "[]";
}

function getRecentlyViewedServerSnapshot() {
  return "[]";
}

function parseRecentlyViewed(snapshot: string) {
  try {
    const ids = JSON.parse(snapshot) as unknown;
    return Array.isArray(ids)
      ? ids.filter((id): id is string => typeof id === "string")
      : [];
  } catch {
    return [];
  }
}
