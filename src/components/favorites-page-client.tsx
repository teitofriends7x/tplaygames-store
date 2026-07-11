"use client";

import { Heart } from "lucide-react";
import { useMemo } from "react";

import { EmptyState } from "@/components/empty-state";
import { ProductCard } from "@/components/product-card";
import { useFavoriteProductIds } from "@/lib/cart-client";
import type { Product } from "@/lib/types";

export function FavoritesPageClient({ products }: { products: Product[] }) {
  const favoriteIds = useFavoriteProductIds();
  const favorites = useMemo(
    () =>
      favoriteIds
        .map((id) => products.find((product) => product.id === id))
        .filter((product): product is Product => Boolean(product)),
    [favoriteIds, products],
  );

  if (!favorites.length) {
    return (
      <EmptyState
        icon={Heart}
        title="Todavía no guardaste favoritos"
        body="Usá el corazón de cada tarjeta o ficha de producto para armar tu lista local."
        href="/catalogo"
        action="Explorar productos"
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {favorites.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
