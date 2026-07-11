"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  CheckCircle2,
  CreditCard,
  LockKeyhole,
  MapPin,
  PackageCheck,
  ShieldCheck,
  Truck,
} from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import type { z } from "zod";

import { clearCart, readCart, useCartItems } from "@/lib/cart-client";
import { calculateCart } from "@/lib/cart";
import { PRODUCT_TYPE_LABELS } from "@/lib/constants";
import { checkoutSchema } from "@/lib/validation";
import { formatARS } from "@/lib/money";
import type { Product } from "@/lib/types";
import { EmptyState } from "@/components/empty-state";

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
  const [serverError, setServerError] = useState("");
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutClientSchema),
    defaultValues: {
      termsAccepted: true,
      address: {
        province: "Buenos Aires",
      },
    },
  });
  const province =
    useWatch({ control, name: "address.province" }) || "Buenos Aires";
  const cart = useMemo(
    () =>
      calculateCart({
        items,
        couponCode,
        province,
        products,
      }),
    [couponCode, items, products, province],
  );

  async function onSubmit(values: CheckoutFormData) {
    setSubmitting(true);
    setServerError("");
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
      setServerError(data.error ?? "No se pudo crear el pedido.");
      return;
    }

    clearCart();
    setResult(data);
  }

  if (!items.length && !result) {
    return (
      <section className="tpg-container py-16">
        <EmptyState
          icon={PackageCheck}
          title="No hay productos para pagar"
          body="Tu carrito está vacío o el navegador no tiene productos guardados para continuar."
          href="/catalogo"
          action="Ir al catálogo"
        />
      </section>
    );
  }

  if (result) {
    return (
      <section className="tpg-container py-16">
        <div className="tpg-card mx-auto max-w-2xl p-8 text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl border border-[#22C55E]/30 bg-[#22C55E]/10 text-[#BFF7D2]">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h1 className="mt-5 text-3xl font-black text-white">Pedido creado</h1>
          <p className="mt-3 text-[#A7ACB8]">
            Pedido {result.orderNumber}. El pago se genera desde servidor.
          </p>
          <a href={result.paymentUrl} className="btn btn-primary mt-6">
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
    <section className="tpg-container grid gap-6 py-8 lg:grid-cols-[1fr_390px]">
      <form onSubmit={handleSubmit(onSubmit)} className="tpg-card p-5 md:p-6">
        <p className="section-eyebrow">Pago seguro</p>
        <h1 className="mt-2 text-3xl font-black text-white">Checkout</h1>
        <div className="mt-6 grid gap-3 md:grid-cols-3">
          <CheckoutStep icon={PackageCheck} label="Carrito" active />
          <CheckoutStep icon={MapPin} label="Entrega" active />
          <CheckoutStep icon={CreditCard} label="Pago" active />
        </div>
        <div className="mt-6 grid gap-3 md:grid-cols-2">
          <CheckoutNotice
            icon={LockKeyhole}
            title="Privacidad"
            body="Usamos estos datos solo para crear el pedido y coordinar entrega."
          />
          <CheckoutNotice
            icon={ShieldCheck}
            title="Validación"
            body="El servidor confirma stock, cupón y total antes del pago."
          />
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field label="Nombre" error={errors.customer?.firstName?.message}>
            <input {...register("customer.firstName")} className="input" />
          </Field>
          <Field label="Apellido" error={errors.customer?.lastName?.message}>
            <input {...register("customer.lastName")} className="input" />
          </Field>
          <Field label="Email" error={errors.customer?.email?.message}>
            <input
              type="email"
              {...register("customer.email")}
              className="input"
            />
          </Field>
          <Field label="Teléfono" error={errors.customer?.phone?.message}>
            <input {...register("customer.phone")} className="input" />
          </Field>
        </div>
        {cart.hasPhysicalItems ? (
          <>
            <h2 className="mt-8 text-xl font-black text-white">Envío</h2>
            <p className="mt-2 text-sm leading-6 text-[#A7ACB8]">
              Como el pedido incluye productos físicos, necesitamos domicilio.
              Si también hay productos digitales, se procesan manualmente luego
              de confirmar el pago.
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Dirección" error={errors.address?.street?.message}>
                <input {...register("address.street")} className="input" />
              </Field>
              <Field label="Localidad" error={errors.address?.city?.message}>
                <input {...register("address.city")} className="input" />
              </Field>
              <Field
                label="Provincia"
                error={errors.address?.province?.message}
              >
                <input
                  {...register("address.province")}
                  className="input"
                  defaultValue="Buenos Aires"
                />
              </Field>
              <Field
                label="Código postal"
                error={errors.address?.postalCode?.message}
              >
                <input {...register("address.postalCode")} className="input" />
              </Field>
            </div>
          </>
        ) : (
          <p className="mt-6 rounded-xl border border-[#1D6DFF]/30 bg-[#1D6DFF]/10 p-4 text-sm leading-6 text-[#C8D9FF]">
            Tu carrito es digital. No solicitamos domicilio; la entrega queda
            pendiente hasta confirmar el pago y procesarla desde administración.
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
          <span>
            Acepto términos y condiciones. El contenido legal actual es
            plantilla pendiente de revisión profesional.
          </span>
        </label>
        {errors.termsAccepted?.message ? (
          <p className="mt-2 text-xs text-[#FCA5A5]" role="alert">
            {errors.termsAccepted.message}
          </p>
        ) : null}
        {serverError ? (
          <p
            className="mt-5 rounded-xl border border-[#EF4444]/30 bg-[#EF4444]/10 p-4 text-sm font-semibold text-[#FCA5A5]"
            role="alert"
          >
            {serverError}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={submitting}
          className="btn btn-primary mt-6 w-full"
        >
          {submitting ? "Creando pedido..." : "Crear pedido y pagar"}
        </button>
      </form>
      <aside className="tpg-card h-fit p-5 lg:sticky lg:top-24">
        <h2 className="text-lg font-black text-white">Resumen</h2>
        <label className="mt-4 block text-sm font-semibold text-[#A7ACB8]">
          Cupón
          <input
            value={couponCode}
            onChange={(event) => setCouponCode(event.currentTarget.value)}
            placeholder="DEMO10"
            className="form-control mt-2"
          />
        </label>
        {couponCode && cart.coupon ? (
          <p className="mt-2 text-sm font-semibold text-[#86EFAC]">
            Cupón aplicado: {cart.coupon.code}
          </p>
        ) : null}
        <div className="mt-4 space-y-2">
          {cart.lines.map((line) => (
            <div
              key={`${line.product.id}-${line.variant?.id ?? "base"}`}
              className="grid grid-cols-[56px_1fr_auto] items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-2 text-sm text-[#A7ACB8]"
            >
              <div className="relative aspect-square overflow-hidden rounded-lg bg-[#070707]">
                <Image
                  src={line.product.mainImage}
                  alt={line.product.images[0]?.alt ?? line.product.name}
                  fill
                  sizes="56px"
                  placeholder={
                    line.product.images[0]?.blurDataUrl ? "blur" : "empty"
                  }
                  blurDataURL={line.product.images[0]?.blurDataUrl}
                  className="object-cover"
                />
              </div>
              <span className="min-w-0">
                <span className="block truncate font-semibold text-white">
                  {line.product.name}
                </span>
                <span className="text-xs">
                  {PRODUCT_TYPE_LABELS[line.product.type]} x {line.quantity}
                </span>
              </span>
              <span className="font-bold text-white">
                {formatARS(line.lineTotalCents)}
              </span>
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
            <span>Envío</span>
            <span>{formatARS(cart.totals.shippingCents)}</span>
          </div>
          <div className="mt-4 flex justify-between text-lg font-black text-white">
            <span>Total</span>
            <span>{formatARS(cart.totals.totalCents)}</span>
          </div>
        </div>
        {cart.warnings.length ? (
          <ul className="mt-4 space-y-2 text-sm text-[#FBBF24]">
            {cart.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        ) : null}
        <p className="mt-4 flex gap-2 text-xs leading-5 text-[#A7ACB8]">
          <Truck className="mt-0.5 h-4 w-4 shrink-0 text-[#8FB7FF]" />
          <span>
            {cart.hasPhysicalItems
              ? "El costo final de entrega queda visible antes de crear el pedido."
              : "La entrega digital es manual y se procesa después del pago."}
          </span>
        </p>
      </aside>
    </section>
  );
}

function CheckoutStep({
  icon: Icon,
  label,
  active,
}: {
  icon: typeof CreditCard;
  label: string;
  active?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-xl border p-3 text-sm font-black ${
        active
          ? "border-[#1D6DFF]/35 bg-[#1D6DFF]/10 text-white"
          : "border-white/10 bg-white/[0.03] text-[#A7ACB8]"
      }`}
    >
      <Icon className="h-4 w-4 text-[#8FB7FF]" />
      {label}
    </div>
  );
}

function CheckoutNotice({
  icon: Icon,
  title,
  body,
}: {
  icon: typeof CreditCard;
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
