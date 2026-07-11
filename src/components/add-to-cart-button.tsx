"use client";

import { Heart, ShoppingCart } from "lucide-react";
import { useState } from "react";

import {
  addCartItem,
  toggleFavorite,
  useFavoriteProductIds,
} from "@/lib/cart-client";
import { cn } from "@/lib/utils";

export function AddToCartButton({
  productId,
  variantId,
  quantity = 1,
  compact = false,
  disabled = false,
}: {
  productId: string;
  variantId?: string;
  quantity?: number;
  compact?: boolean;
  disabled?: boolean;
}) {
  const [added, setAdded] = useState(false);

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => {
        if (disabled) {
          return;
        }
        addCartItem({ productId, variantId, quantity });
        setAdded(true);
        window.setTimeout(() => setAdded(false), 1400);
      }}
      className={cn("btn btn-primary", compact && "h-10 px-3")}
    >
      <ShoppingCart className="h-4 w-4" />
      {disabled
        ? "Sin stock"
        : added
          ? "Agregado"
          : compact
            ? "Carrito"
            : "Agregar al carrito"}
    </button>
  );
}

export function FavoriteButton({
  productId,
  compact = false,
}: {
  productId: string;
  compact?: boolean;
}) {
  const favorites = useFavoriteProductIds();
  const [active, setActive] = useState(favorites.includes(productId));
  const isActive = active || favorites.includes(productId);

  return (
    <button
      type="button"
      aria-label="Agregar a favoritos"
      onClick={() => {
        const nextFavorites = toggleFavorite(productId);
        setActive(nextFavorites.includes(productId));
      }}
      className={cn(
        "btn btn-secondary",
        isActive && "border-[#1D6DFF] text-[#8FB7FF]",
        compact && "h-10 w-10 px-0",
      )}
    >
      <Heart className={cn("h-4 w-4", isActive && "fill-current")} />
      {compact ? null : "Favorito"}
    </button>
  );
}
