"use client";

import { Minus, Plus } from "lucide-react";
import { useMemo, useState } from "react";

import { addCartItem } from "@/lib/cart-client";
import { getVariantPrice } from "@/lib/catalog";
import { formatARS } from "@/lib/money";
import type { Product } from "@/lib/types";
import { FavoriteButton } from "@/components/add-to-cart-button";

export function ProductPurchasePanel({ product }: { product: Product }) {
  const [variantId, setVariantId] = useState(product.variants[0]?.id);
  const [quantity, setQuantity] = useState(1);
  const variant = product.variants.find((item) => item.id === variantId);
  const stock = variant ? variant.stock : product.stock;
  const price = useMemo(
    () => getVariantPrice(product, variantId),
    [product, variantId],
  );

  return (
    <section className="rounded-lg border border-white/10 bg-[#111318] p-4">
      {product.variants.length > 0 ? (
        <div className="space-y-2">
          <label
            htmlFor="variant"
            className="text-sm font-semibold text-[#A7ACB8]"
          >
            Variante
          </label>
          <select
            id="variant"
            value={variantId}
            onChange={(event) => setVariantId(event.target.value)}
            className="h-11 w-full rounded-lg border border-white/10 bg-[#070707] px-3 text-sm text-white outline-none focus:border-[#1D6DFF]"
          >
            {product.variants.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label} - {formatARS(item.priceCents ?? product.priceCents)}
              </option>
            ))}
          </select>
        </div>
      ) : null}
      <div className="mt-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-[#A7ACB8]">Stock disponible</p>
          <p className="font-semibold text-white">{stock} unidades</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-[#A7ACB8]">Precio</p>
          <p className="text-2xl font-black text-white">{formatARS(price)}</p>
        </div>
      </div>
      <div className="mt-4 flex items-center gap-3">
        <div className="flex h-11 items-center rounded-lg border border-white/10 bg-[#070707]">
          <button
            type="button"
            aria-label="Restar cantidad"
            onClick={() => setQuantity((value) => Math.max(1, value - 1))}
            className="grid h-11 w-11 place-items-center text-white hover:bg-white/10"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-9 text-center text-sm font-bold text-white">
            {quantity}
          </span>
          <button
            type="button"
            aria-label="Sumar cantidad"
            onClick={() => setQuantity((value) => Math.min(stock, value + 1))}
            className="grid h-11 w-11 place-items-center text-white hover:bg-white/10"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <button
          type="button"
          disabled={stock <= 0}
          onClick={() => addCartItem({ productId: product.id, variantId, quantity })}
          className="inline-flex h-11 flex-1 items-center justify-center rounded-lg bg-[#1D6DFF] px-4 text-sm font-bold text-white hover:bg-[#1558D6] disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-[#A7ACB8]"
        >
          Comprar
        </button>
        <FavoriteButton productId={product.id} compact />
      </div>
      <p className="mt-4 text-xs leading-5 text-[#A7ACB8]">
        El precio y el stock se vuelven a validar en servidor durante el
        checkout.
      </p>
    </section>
  );
}
