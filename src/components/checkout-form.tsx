"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CreditCard } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import { clearCart, readCart, useCartItems } from "@/lib/cart-client";
import { calculateCart } from "@/lib/cart";
import { checkoutSchema } from "@/lib/validation";
import { formatARS } from "@/lib/money";
import type { Product } from "@/lib/types";

const checkoutClientSchema = checkoutSchema.omit({ items: true });
type CheckoutFormData = z.infer<typeof checkoutClientSchema>;

export function CheckoutForm({ products }: { products: Product[] }) {
  const items = useCartItems();
  const [couponCode, setCouponCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{
    orderNumber: string;
    paymentUrl: string;
    mode: string;
  }>();
  const cart = useMemo(
    () =>
      calculateCart({
        items,
        couponCode,
        products,
      }),
    [couponCode, items, products],
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutClientSchema),
    defaultValues: {
      termsAccepted: true,
    },
  });

  async function onSubmit(values: CheckoutFormData) {
    setSubmitting(true);
    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...values,
        items: readCart(),
        couponCode,
      }),
    });
    setSubmitting(false);

    const data = await response.json();
    if (!response.ok) {
      alert(data.error ?? "No se pudo crear el pedido.");
      return;
    }

    clearCart();
    setResult(data);
  }

  if (!items.length && !result) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-3xl font-black text-white">
          No hay productos para pagar
        </h1>
        <Link
          href="/catalogo"
          className="mt-6 inline-flex h-11 items-center rounded-lg bg-[#1D6DFF] px-5 text-sm font-bold text-white"
        >
          Ir al catalogo
        </Link>
      </section>
    );
  }

  if (result) {
    return (
      <section className="mx-auto max-w-2xl px-4 py-16">
        <div className="rounded-lg border border-white/10 bg-[#111318] p-6 text-center">
          <h1 className="text-3xl font-black text-white">Pedido creado</h1>
          <p className="mt-3 text-[#A7ACB8]">
            Pedido {result.orderNumber}. El pago se genera desde servidor.
          </p>
          <a
            href={result.paymentUrl}
            className="mt-6 inline-flex h-11 items-center gap-2 rounded-lg bg-[#1D6DFF] px-5 text-sm font-black text-white"
          >
            <CreditCard className="h-4 w-4" />
            Continuar pago
          </a>
          {result.mode === "development" ? (
            <p className="mt-4 text-sm text-[#F59E0B]">
              Modo desarrollo: falta `MERCADOPAGO_ACCESS_TOKEN`.
            </p>
          ) : null}
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-8 lg:grid-cols-[1fr_360px]">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="rounded-lg border border-white/10 bg-[#111318] p-5"
      >
        <h1 className="text-3xl font-black text-white">Checkout</h1>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field label="Nombre" error={errors.customer?.firstName?.message}>
            <input {...register("customer.firstName")} className="input" />
          </Field>
          <Field label="Apellido" error={errors.customer?.lastName?.message}>
            <input {...register("customer.lastName")} className="input" />
          </Field>
          <Field label="Email" error={errors.customer?.email?.message}>
            <input type="email" {...register("customer.email")} className="input" />
          </Field>
          <Field label="Telefono" error={errors.customer?.phone?.message}>
            <input {...register("customer.phone")} className="input" />
          </Field>
        </div>
        {cart.hasPhysicalItems ? (
          <>
            <h2 className="mt-8 text-xl font-black text-white">Envio</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Direccion" error={errors.address?.street?.message}>
                <input {...register("address.street")} className="input" />
              </Field>
              <Field label="Localidad" error={errors.address?.city?.message}>
                <input {...register("address.city")} className="input" />
              </Field>
              <Field label="Provincia" error={errors.address?.province?.message}>
                <input
                  {...register("address.province")}
                  className="input"
                  defaultValue="Buenos Aires"
                />
              </Field>
              <Field
                label="Codigo postal"
                error={errors.address?.postalCode?.message}
              >
                <input {...register("address.postalCode")} className="input" />
              </Field>
            </div>
          </>
        ) : (
          <p className="mt-6 rounded-lg border border-[#1D6DFF]/30 bg-[#1D6DFF]/10 p-4 text-sm text-[#C8D9FF]">
            Tu carrito es digital. No solicitamos domicilio; la entrega queda
            pendiente hasta confirmar el pago y procesarla desde administracion.
          </p>
        )}
        <Field label="Notas" error={errors.notes?.message}>
          <textarea {...register("notes")} className="input min-h-24 py-3" />
        </Field>
        <label className="mt-5 flex items-start gap-3 text-sm text-[#A7ACB8]">
          <input
            type="checkbox"
            {...register("termsAccepted")}
            className="mt-1"
            defaultChecked
          />
          Acepto terminos y condiciones. El contenido legal actual es plantilla
          pendiente de revision profesional.
        </label>
        <button
          type="submit"
          disabled={submitting}
          className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-lg bg-[#1D6DFF] px-5 text-sm font-black text-white hover:bg-[#1558D6] disabled:opacity-60"
        >
          {submitting ? "Creando pedido..." : "Crear pedido y pagar"}
        </button>
      </form>
      <aside className="h-fit rounded-lg border border-white/10 bg-[#111318] p-5">
        <h2 className="text-lg font-black text-white">Resumen</h2>
        <label className="mt-4 block text-sm font-semibold text-[#A7ACB8]">
          Cupon
          <input
            value={couponCode}
            onChange={(event) => setCouponCode(event.currentTarget.value)}
            placeholder="DEMO10"
            className="mt-2 h-11 w-full rounded-lg border border-white/10 bg-[#070707] px-3 text-white outline-none focus:border-[#1D6DFF]"
          />
        </label>
        <div className="mt-4 space-y-2">
          {cart.lines.map((line) => (
            <div
              key={`${line.product.id}-${line.variant?.id ?? "base"}`}
              className="flex justify-between gap-4 text-sm text-[#A7ACB8]"
            >
              <span>
                {line.product.name} x {line.quantity}
              </span>
              <span>{formatARS(line.lineTotalCents)}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 border-t border-white/10 pt-4 text-sm text-[#A7ACB8]">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatARS(cart.totals.subtotalCents)}</span>
          </div>
          <div className="mt-2 flex justify-between">
            <span>Descuentos</span>
            <span>
              {formatARS(
                -cart.totals.productDiscountCents -
                  cart.totals.couponDiscountCents,
              )}
            </span>
          </div>
          <div className="mt-2 flex justify-between">
            <span>Envio</span>
            <span>{formatARS(cart.totals.shippingCents)}</span>
          </div>
          <div className="mt-4 flex justify-between text-lg font-black text-white">
            <span>Total</span>
            <span>{formatARS(cart.totals.totalCents)}</span>
          </div>
        </div>
      </aside>
    </section>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="mt-4 block text-sm font-semibold text-[#A7ACB8]">
      {label}
      <div className="mt-2">{children}</div>
      {error ? <p className="mt-1 text-xs text-[#EF4444]">{error}</p> : null}
    </label>
  );
}
