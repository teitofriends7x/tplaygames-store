"use client";

import { Trash2 } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { useCartItems, writeCart } from "@/lib/cart-client";
import { calculateCart } from "@/lib/cart";
import { defaultStoreSettings } from "@/lib/demo-data";
import { formatARS } from "@/lib/money";
import type { Product } from "@/lib/types";

export function CartPageClient({ products }: { products: Product[] }) {
  const items = useCartItems();
  const [coupon, setCoupon] = useState("");
  const [province, setProvince] = useState("Buenos Aires");

  const cart = useMemo(
    () =>
      calculateCart({
        items,
        couponCode: coupon,
        province,
        products,
      }),
    [coupon, items, products, province],
  );

  function updateItem(index: number, quantity: number) {
    const next = items.map((item, itemIndex) =>
      itemIndex === index ? { ...item, quantity } : item,
    );
    writeCart(next);
  }

  function removeItem(index: number) {
    const next = items.filter((_, itemIndex) => itemIndex !== index);
    writeCart(next);
  }

  if (!items.length) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-3xl font-black text-white">Tu carrito esta vacio</h1>
        <p className="mt-3 text-[#A7ACB8]">
          Agrega una consola, un control o un juego para empezar.
        </p>
        <Link
          href="/catalogo"
          className="mt-6 inline-flex h-11 items-center rounded-lg bg-[#1D6DFF] px-5 text-sm font-bold text-white"
        >
          Ver catalogo
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-8 lg:grid-cols-[1fr_360px]">
      <div>
        <h1 className="text-3xl font-black text-white">Carrito</h1>
        <div className="mt-6 space-y-3">
          {cart.lines.map((line, index) => (
            <article
              key={`${line.product.id}-${line.variant?.id ?? "base"}`}
              className="grid gap-4 rounded-lg border border-white/10 bg-[#111318] p-4 sm:grid-cols-[1fr_auto]"
            >
              <div>
                <h2 className="font-bold text-white">{line.product.name}</h2>
                <p className="mt-1 text-sm text-[#A7ACB8]">
                  {line.variant?.label ?? "Sin variante"} ·{" "}
                  {line.isPhysical ? "Fisico" : "Digital"}
                </p>
                <p className="mt-2 text-sm text-[#A7ACB8]">
                  Stock validado: {line.availableStock}
                </p>
              </div>
              <div className="flex items-center justify-between gap-3 sm:justify-end">
                <input
                  aria-label={`Cantidad de ${line.product.name}`}
                  type="number"
                  min={1}
                  max={line.availableStock}
                  value={line.quantity}
                  onChange={(event) =>
                    updateItem(index, Number(event.currentTarget.value))
                  }
                  className="h-10 w-20 rounded-lg border border-white/10 bg-[#070707] px-3 text-white"
                />
                <div className="w-28 text-right font-black text-white">
                  {formatARS(line.lineTotalCents)}
                </div>
                <button
                  type="button"
                  aria-label="Eliminar producto"
                  onClick={() => removeItem(index)}
                  className="grid h-10 w-10 place-items-center rounded-lg border border-white/10 text-[#A7ACB8] hover:text-white"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
      <aside className="h-fit rounded-lg border border-white/10 bg-[#111318] p-5">
        <h2 className="text-lg font-black text-white">Resumen</h2>
        <label className="mt-4 block text-sm font-semibold text-[#A7ACB8]">
          Cupon
          <input
            value={coupon}
            onChange={(event) => setCoupon(event.currentTarget.value)}
            placeholder="DEMO10"
            className="mt-2 h-11 w-full rounded-lg border border-white/10 bg-[#070707] px-3 text-white outline-none focus:border-[#1D6DFF]"
          />
        </label>
        {cart.hasPhysicalItems ? (
          <label className="mt-4 block text-sm font-semibold text-[#A7ACB8]">
            Provincia de envio
            <select
              value={province}
              onChange={(event) => setProvince(event.currentTarget.value)}
              className="mt-2 h-11 w-full rounded-lg border border-white/10 bg-[#070707] px-3 text-white outline-none focus:border-[#1D6DFF]"
            >
              {Object.keys(defaultStoreSettings.provinceShippingCents).map(
                (item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ),
              )}
            </select>
          </label>
        ) : null}
        <SummaryRow label="Subtotal" value={cart.totals.subtotalCents} />
        <SummaryRow label="Descuentos" value={-cart.totals.productDiscountCents} />
        <SummaryRow label="Cupon" value={-cart.totals.couponDiscountCents} />
        <SummaryRow label="Envio" value={cart.totals.shippingCents} />
        <div className="mt-4 border-t border-white/10 pt-4">
          <SummaryRow label="Total" value={cart.totals.totalCents} strong />
        </div>
        {cart.warnings.length ? (
          <ul className="mt-4 space-y-2 text-sm text-[#F59E0B]">
            {cart.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        ) : null}
        <Link
          href="/checkout"
          className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-lg bg-[#1D6DFF] px-5 text-sm font-black text-white hover:bg-[#1558D6]"
        >
          Continuar al checkout
        </Link>
      </aside>
    </section>
  );
}

function SummaryRow({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: number;
  strong?: boolean;
}) {
  return (
    <div
      className={`mt-3 flex items-center justify-between gap-4 ${
        strong ? "text-lg font-black text-white" : "text-sm text-[#A7ACB8]"
      }`}
    >
      <span>{label}</span>
      <span>{formatARS(value)}</span>
    </div>
  );
}
