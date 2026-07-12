"use client";

import { useState } from "react";
import { PackageCheck, Search, MessageCircle } from "lucide-react";
import Link from "next/link";

import { TransferProofUpload } from "@/components/transfer-proof-upload";
import { formatARS } from "@/lib/money";
import {
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
  STATUS_LABELS,
} from "@/lib/constants";
import type { Order } from "@/lib/types";

export function OrderTrackingForm() {
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setOrder(null);

    try {
      const response = await fetch("/api/orders/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderNumber: orderNumber.trim(),
          email: email.trim(),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "No se encontró el pedido.");
        return;
      }

      setOrder(data.order);
    } catch {
      setError("Error de conexión. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="tpg-container py-10">
      <p className="section-eyebrow">Seguimiento</p>
      <h1 className="mt-2 text-3xl font-black text-white">
        Consultá tu pedido
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-[#A7ACB8]">
        Ingresá el número de pedido y el email que usaste al comprar para ver el
        estado de tu compra.
      </p>
      <div className="mt-5 max-w-xl rounded-xl border border-[#1D6DFF]/30 bg-[#1D6DFF]/10 p-4 text-sm leading-6 text-[#C8D9FF]">
        ¿Tenés una cuenta?{" "}
        <Link href="/login" className="font-black text-white hover:text-[#8FB7FF]">
          Iniciá sesión para ver todos tus pedidos.
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="tpg-card mt-6 max-w-xl p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-semibold text-[#A7ACB8]">
            Número de pedido
            <input
              type="text"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.currentTarget.value)}
              placeholder="TPG-260711-A1B2C3"
              className="input mt-2"
              required
            />
          </label>
          <label className="block text-sm font-semibold text-[#A7ACB8]">
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.currentTarget.value)}
              placeholder="tu@email.com"
              className="input mt-2"
              required
            />
          </label>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary mt-5 w-full"
        >
          {loading ? (
            "Buscando..."
          ) : (
            <>
              <Search className="h-4 w-4" />
              Buscar pedido
            </>
          )}
        </button>
      </form>

      {error ? (
        <div className="mt-5 max-w-xl rounded-xl border border-[#EF4444]/30 bg-[#EF4444]/10 p-4 text-sm text-[#FCA5A5]">
          {error}
        </div>
      ) : null}

      {order ? (
        <OrderDetail
          order={order}
          email={email.trim()}
          onOrderChange={setOrder}
        />
      ) : null}
    </section>
  );
}

function OrderDetail({
  order,
  email,
  onOrderChange,
}: {
  order: Order;
  email: string;
  onOrderChange: (order: Order) => void;
}) {
  const whatsappUrl = `https://wa.me/34699463647?text=${encodeURIComponent(
    `Hola, quiero consultar por mi pedido ${order.orderNumber}.`,
  )}`;

  return (
    <div className="tpg-card mt-6 max-w-2xl p-6">
      <div className="flex items-center gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-xl bg-[#1D6DFF]/13 text-[#8FB7FF]">
          <PackageCheck className="h-6 w-6" />
        </div>
        <div>
          <p className="text-xs font-bold uppercase text-[#A7ACB8]">Pedido</p>
          <h2 className="text-xl font-black text-white">{order.orderNumber}</h2>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <InfoCard
          label="Estado del pedido"
          value={STATUS_LABELS[order.status]}
        />
        <InfoCard
          label="Estado del pago"
          value={PAYMENT_STATUS_LABELS[order.paymentStatus]}
        />
        <InfoCard
          label="Método de pago"
          value={PAYMENT_METHOD_LABELS[order.paymentMethod ?? "mercadopago"]}
        />
        <InfoCard
          label="Fecha"
          value={new Date(order.createdAt).toLocaleDateString("es-AR", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        />
      </div>

      {order.transferExpiresAt && order.paymentStatus === "pending" ? (
        <div className="mt-4 rounded-xl border border-[#F59E0B]/30 bg-[#F59E0B]/10 p-4 text-sm text-[#FDE68A]">
          <p className="font-bold">Transferencia pendiente</p>
          <p className="mt-1">
            Tenés hasta el{" "}
            {new Date(order.transferExpiresAt).toLocaleDateString("es-AR", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}{" "}
            para realizar la transferencia.
          </p>
        </div>
      ) : null}

      {order.transferProofs?.length ? (
        <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm">
          <p className="font-bold text-white">Comprobante enviado</p>
          <p className="mt-1 text-[#A7ACB8]">
            Estado:{" "}
            {order.transferProofs[0]?.status === "approved"
              ? "aprobado"
              : order.transferProofs[0]?.status === "rejected"
                ? "rechazado"
                : "pendiente de revisión"}
          </p>
          {order.transferProofs[0]?.rejectionReason ? (
            <p className="mt-1 text-[#FCA5A5]">
              Motivo: {order.transferProofs[0].rejectionReason}
            </p>
          ) : null}
        </div>
      ) : null}

      <TransferProofUpload
        order={order}
        email={email}
        onUploaded={onOrderChange}
      />

      <div className="mt-5">
        <h3 className="text-sm font-black uppercase text-[#A7ACB8]">
          Productos
        </h3>
        <div className="mt-2 space-y-2">
          {order.items.map((item) => (
            <div
              key={`${item.productId}-${item.variantId ?? "base"}`}
              className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm"
            >
              <div>
                <p className="font-semibold text-white">{item.productName}</p>
                <p className="text-xs text-[#A7ACB8]">
                  {item.variantLabel ?? ""} x {item.quantity}
                </p>
              </div>
              <p className="font-bold text-white">
                {formatARS(item.totalCents)}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 border-t border-white/10 pt-4">
        <div className="flex justify-between text-sm text-[#A7ACB8]">
          <span>Subtotal</span>
          <span>{formatARS(order.totals.subtotalCents)}</span>
        </div>
        {order.totals.productDiscountCents > 0 ? (
          <div className="mt-1 flex justify-between text-sm text-[#A7ACB8]">
            <span>Descuentos</span>
            <span>-{formatARS(order.totals.productDiscountCents)}</span>
          </div>
        ) : null}
        {order.totals.shippingCents > 0 ? (
          <div className="mt-1 flex justify-between text-sm text-[#A7ACB8]">
            <span>Envío</span>
            <span>{formatARS(order.totals.shippingCents)}</span>
          </div>
        ) : null}
        <div className="mt-3 flex justify-between text-lg font-black text-white">
          <span>Total</span>
          <span>{formatARS(order.totals.totalCents)}</span>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <a
          href={whatsappUrl}
          className="btn btn-secondary inline-flex items-center gap-2"
        >
          <MessageCircle className="h-4 w-4" />
          Consultar por WhatsApp
        </a>
        <Link
          href={`/seguimiento/comprobante?orderNumber=${encodeURIComponent(order.orderNumber)}&email=${encodeURIComponent(email)}`}
          className="btn btn-secondary"
        >
          Ver recibo
        </Link>
      </div>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
      <p className="text-xs font-bold uppercase text-[#A7ACB8]">{label}</p>
      <p className="mt-1 font-black text-white">{value}</p>
    </div>
  );
}
