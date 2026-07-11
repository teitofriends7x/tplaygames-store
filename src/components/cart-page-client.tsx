"use client";

import { PackageOpen, ShieldCheck, Trash2, Truck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

import { useCartItems, writeCart } from "@/lib/cart-client";
import { calculateCart } from "@/lib/cart";
import { defaultStoreSettings } from "@/lib/demo-data";
import { formatARS } from "@/lib/money";
import type { Product } from "@/lib/types";
import { EmptyState } from "@/components/empty-state";

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

  const transferCart = useMemo(
    () =>
      calculateCart({
        items,
        couponCode: coupon,
        province,
        products,
        paymentMethod: "transfer",
      }),
    [coupon, items, products, province],
  );

  const transferSavings =
    cart.totals.totalCents - transferCart.totals.totalCents;

  function updateItem(
    productId: string,
    variantId: string | undefined,
    quantity: number,
  ) {
    const next = items.map((item) =>
      item.productId === productId && item.variantId === variantId
        ? { ...item, quantity }
        : item,
    );
    writeCart(next);
  }

  function removeItem(productId: string, variantId: string | undefined) {
    const next = items.filter(
      (item) => item.productId !== productId || item.variantId !== variantId,
    );
    writeCart(next);
  }

  if (!items.length) {
    return (
      <section className="tpg-container py-16">
        <EmptyState
          icon={PackageOpen}
          title="Tu carrito está vacío"
          body="Elegí una consola, un control o un juego y seguí el checkout cuando tengas todo listo."
          href="/catalogo"
          action="Ver catálogo"
        />
      </section>
    );
  }

  const remainingForFreeShipping = Math.max(
    0,
    defaultStoreSettings.freeShippingFromCents -
      (cart.totals.subtotalCents -
        cart.totals.productDiscountCents -
        cart.totals.couponDiscountCents),
  );
  const showShippingGoal =
    cart.hasPhysicalItems && remainingForFreeShipping > 0;

  return (
    <section className="tpg-container grid gap-6 py-8 lg:grid-cols-[1fr_380px]">
      <div>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="section-eyebrow">Compra</p>
            <h1 className="mt-2 text-3xl font-black text-white">Carrito</h1>
          </div>
          <Link href="/catalogo" className="btn btn-secondary">
            Seguir comprando
          </Link>
        </div>
        <div className="mt-6 space-y-3">
          {cart.lines.map((line) => (
            <article
              key={`${line.product.id}-${line.variant?.id ?? "base"}`}
              className="tpg-card grid gap-4 p-4 sm:grid-cols-[112px_1fr] lg:grid-cols-[128px_1fr_auto]"
            >
              <Link
                href={`/catalogo/${line.product.slug}`}
                className="relative aspect-square overflow-hidden rounded-xl border border-white/10 bg-[#070707]"
                aria-label={`Ver ${line.product.name}`}
              >
                <Image
                  src={line.product.mainImage}
                  alt={line.product.images[0]?.alt ?? line.product.name}
                  fill
                  unoptimized
                  sizes="128px"
                  placeholder={
                    line.product.images[0]?.blurDataUrl ? "blur" : "empty"
                  }
                  blurDataURL={line.product.images[0]?.blurDataUrl}
                  className="object-contain p-2"
                />
              </Link>
              <div className="min-w-0">
                <Link
                  href={`/catalogo/${line.product.slug}`}
                  className="text-lg font-black text-white hover:text-[#8FB7FF]"
                >
                  {line.product.name}
                </Link>
                <p className="mt-1 text-sm text-[#A7ACB8]">
                  {line.variant?.label ?? "Producto base"} ·{" "}
                  {line.isPhysical ? "Físico" : "Digital"}
                </p>
                <p className="mt-3 inline-flex rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-[#A7ACB8]">
                  Stock disponible: {line.availableStock}
                </p>
              </div>
              <div className="flex items-center justify-between gap-3 sm:col-span-2 lg:col-span-1 lg:justify-end">
                <label className="text-sm font-semibold text-[#A7ACB8]">
                  <span className="sr-only">Cantidad</span>
                  <input
                    aria-label={`Cantidad de ${line.product.name}`}
                    type="number"
                    min={1}
                    max={line.availableStock}
                    value={line.quantity}
                    onChange={(event) =>
                      updateItem(
                        line.product.id,
                        line.variant?.id,
                        Number(event.currentTarget.value),
                      )
                    }
                    className="form-control h-11 w-20"
                  />
                </label>
                <div className="min-w-28 text-right">
                  {line.lineDiscountCents > 0 ? (
                    <p className="text-xs text-[#A7ACB8] line-through">
                      {formatARS(line.lineSubtotalCents)}
                    </p>
                  ) : null}
                  <p className="font-black text-white">
                    {formatARS(line.lineTotalCents)}
                  </p>
                </div>
                <button
                  type="button"
                  aria-label="Eliminar producto"
                  onClick={() => removeItem(line.product.id, line.variant?.id)}
                  className="icon-button text-[#A7ACB8] hover:text-white"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </article>
          ))}
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <CartNote
            icon={ShieldCheck}
            title="Validación segura"
            body="El checkout vuelve a confirmar precio, stock y cupón desde servidor."
          />
          <CartNote
            icon={Truck}
            title={
              cart.hasPhysicalItems
                ? "Entrega física/digital"
                : "Entrega digital"
            }
            body={
              cart.hasPhysicalItems && cart.hasDigitalItems
                ? "Tu pedido combina envío físico y entrega digital manual."
                : cart.hasPhysicalItems
                  ? "El costo de envío se calcula por provincia configurada."
                  : "No pedimos domicilio para productos digitales."
            }
          />
        </div>
      </div>
      <aside className="tpg-card h-fit p-5 lg:sticky lg:top-24">
        <h2 className="text-lg font-black text-white">Resumen</h2>
        <label className="mt-4 block text-sm font-semibold text-[#A7ACB8]">
          Cupón
          <input
            value={coupon}
            onChange={(event) => setCoupon(event.currentTarget.value)}
            placeholder="DEMO10"
            className="form-control mt-2"
          />
        </label>
        {coupon && cart.coupon ? (
          <p className="mt-2 text-sm font-semibold text-[#86EFAC]">
            Cupón aplicado: {cart.coupon.code}
          </p>
        ) : null}
        {cart.hasPhysicalItems ? (
          <label className="mt-4 block text-sm font-semibold text-[#A7ACB8]">
            Provincia de envío
            <select
              value={province}
              onChange={(event) => setProvince(event.currentTarget.value)}
              className="form-control mt-2"
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
        {showShippingGoal ? (
          <div className="mt-4 rounded-xl border border-[#1D6DFF]/25 bg-[#1D6DFF]/10 p-3 text-sm text-[#C8D9FF]">
            Te faltan {formatARS(remainingForFreeShipping)} para envío
            bonificado.
          </div>
        ) : null}
        <SummaryRow label="Subtotal" value={cart.totals.subtotalCents} />
        <SummaryRow
          label="Descuentos"
          value={-cart.totals.productDiscountCents}
        />
        <SummaryRow label="Cupón" value={-cart.totals.couponDiscountCents} />
        <SummaryRow label="Envío" value={cart.totals.shippingCents} />
        <div className="mt-4 border-t border-white/10 pt-4">
          <SummaryRow label="Total" value={cart.totals.totalCents} strong />
        </div>
        {transferSavings > 0 ? (
          <div className="mt-3 rounded-xl border border-[#22C55E]/25 bg-[#22C55E]/10 p-3 text-sm text-[#C7F8D9]">
            <p className="font-bold">
              Podés ahorrar {formatARS(transferSavings)} pagando por
              transferencia.
            </p>
            <p className="mt-1 text-xs text-[#A7ACB8]">
              Total estimado por transferencia:{" "}
              <span className="font-bold text-[#86EFAC]">
                {formatARS(transferCart.totals.totalCents)}
              </span>
            </p>
          </div>
        ) : null}
        {cart.warnings.length ? (
          <ul className="mt-4 space-y-2 text-sm text-[#F59E0B]">
            {cart.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        ) : null}
        <Link href="/checkout" className="btn btn-primary mt-5 w-full">
          Continuar al checkout
        </Link>
        <p className="mt-4 text-xs leading-5 text-[#A7ACB8]">
          No guardamos datos de pago en la tienda. Mercado Pago procesa el pago
          cuando las credenciales están activas.
        </p>
      </aside>
    </section>
  );
}

function CartNote({
  icon: Icon,
  title,
  body,
}: {
  icon: typeof ShieldCheck;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <div className="flex gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[#1D6DFF]/13 text-[#8FB7FF]">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-sm font-black text-white">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-[#A7ACB8]">{body}</p>
        </div>
      </div>
    </div>
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
