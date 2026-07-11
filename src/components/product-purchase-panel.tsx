"use client";

import { CheckCircle2, Minus, Plus, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";

import { addCartItem } from "@/lib/cart-client";
import { getVariantPrice } from "@/lib/catalog";
import { formatARS } from "@/lib/money";
import type { Product } from "@/lib/types";
import { FavoriteButton } from "@/components/add-to-cart-button";

export function ProductPurchasePanel({ product }: { product: Product }) {
  const [variantId, setVariantId] = useState(product.variants[0]?.id);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const variant = product.variants.find((item) => item.id === variantId);
  const stock = variant ? variant.stock : product.stock;
  const isPreorder = product.availabilityStatus === "preorder";
  const price = useMemo(
    () => getVariantPrice(product, variantId),
    [product, variantId],
  );
  const isAvailable =
    !isPreorder && stock > 0 && (variant ? variant.available : true);

  function addProduct() {
    addCartItem({ productId: product.id, variantId, quantity });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1600);
  }

  return (
    <section className="tpg-card p-5">
      {product.variants.length > 0 ? (
        <div>
          <label htmlFor="variant" className="text-sm font-black text-white">
            Variante
          </label>
          <select
            id="variant"
            value={variantId}
            onChange={(event) => {
              setVariantId(event.target.value);
              setQuantity(1);
            }}
            className="form-control mt-2"
          >
            {product.variants.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label} ·{" "}
                {formatARS(item.priceCents ?? product.priceCents)}
                {item.stock <= 0 ? " · Sin stock" : ""}
              </option>
            ))}
          </select>
        </div>
      ) : null}
      <div className="mt-5 grid gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4 sm:grid-cols-2">
        <div>
          <p className="text-sm text-[#A7ACB8]">Disponibilidad</p>
          <p
            className={
              isAvailable
                ? "font-black text-[#86EFAC]"
                : isPreorder
                  ? "font-black text-[#8FB7FF]"
                  : "font-black text-[#FCA5A5]"
            }
          >
            {isAvailable
              ? `${stock} unidades`
              : isPreorder
                ? (product.releaseDateLabel ?? "Preventa sin entrega inmediata")
                : "Sin stock"}
          </p>
        </div>
        <div className="sm:text-right">
          <p className="text-sm text-[#A7ACB8]">Precio</p>
          <p className="text-2xl font-black text-white">{formatARS(price)}</p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <div className="flex h-12 items-center overflow-hidden rounded-xl border border-white/10 bg-[#070707]">
          <button
            type="button"
            aria-label="Restar cantidad"
            onClick={() => setQuantity((value) => Math.max(1, value - 1))}
            className="grid h-12 w-12 place-items-center text-white transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8FB7FF]"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-10 text-center text-sm font-black text-white">
            {quantity}
          </span>
          <button
            type="button"
            aria-label="Sumar cantidad"
            onClick={() =>
              setQuantity((value) => Math.min(Math.max(stock, 1), value + 1))
            }
            className="grid h-12 w-12 place-items-center text-white transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8FB7FF]"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <button
          type="button"
          disabled={!isAvailable}
          onClick={addProduct}
          className="btn btn-primary h-12 min-w-44 flex-1"
        >
          {isPreorder ? "Preventa no habilitada" : "Comprar"}
        </button>
        <FavoriteButton productId={product.id} compact />
      </div>
      {added ? (
        <p className="mt-4 flex items-center gap-2 rounded-xl border border-[#22C55E]/30 bg-[#22C55E]/10 p-3 text-sm font-semibold text-[#BFF7D2]">
          <CheckCircle2 className="h-4 w-4" />
          Agregado al carrito.
        </p>
      ) : null}
      <p className="mt-4 flex gap-2 text-xs leading-5 text-[#A7ACB8]">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#8FB7FF]" />
        <span>
          El precio, el stock y la variante se vuelven a validar en servidor
          durante el checkout.
        </span>
      </p>
    </section>
  );
}
