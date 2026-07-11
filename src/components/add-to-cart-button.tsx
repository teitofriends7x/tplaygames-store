"use client";

import { Heart, ShoppingCart } from "lucide-react";
import { useState } from "react";

import { addCartItem, toggleFavorite } from "@/lib/cart-client";
import { cn } from "@/lib/utils";

export function AddToCartButton({
  productId,
  variantId,
  quantity = 1,
  compact = false,
}: {
  productId: string;
  variantId?: string;
  quantity?: number;
  compact?: boolean;
}) {
  const [added, setAdded] = useState(false);

  return (
    <button
      type="button"
      onClick={() => {
        addCartItem({ productId, variantId, quantity });
        setAdded(true);
        window.setTimeout(() => setAdded(false), 1400);
      }}
      className={cn(
        "inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#1D6DFF] px-4 text-sm font-bold text-white transition hover:bg-[#1558D6] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D6DFF]",
        compact && "h-10 px-3",
      )}
    >
      <ShoppingCart className="h-4 w-4" />
      {added ? "Agregado" : compact ? "Carrito" : "Agregar al carrito"}
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
  const [active, setActive] = useState(false);

  return (
    <button
      type="button"
      aria-label="Agregar a favoritos"
      onClick={() => {
        const favorites = toggleFavorite(productId);
        setActive(favorites.includes(productId));
      }}
      className={cn(
        "inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 text-sm font-bold text-white transition hover:border-[#1D6DFF] hover:bg-[#1D6DFF]/10",
        active && "border-[#1D6DFF] text-[#1D6DFF]",
        compact && "h-10 w-10 px-0",
      )}
    >
      <Heart className="h-4 w-4" />
      {compact ? null : "Favorito"}
    </button>
  );
}
