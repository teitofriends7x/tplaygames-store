import { notFound } from "next/navigation";
import Link from "next/link";

import { EmptyState } from "@/components/empty-state";
import { TransferProofUpload } from "@/components/transfer-proof-upload";
import {
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
  STATUS_LABELS,
} from "@/lib/constants";
import { formatARS, formatDateTimeAR } from "@/lib/money";
import { getOrderForCustomer } from "@/lib/order-persistence";
import { getCurrentClerkUser } from "@/lib/clerk-auth";
import { PackageOpen } from "lucide-react";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentClerkUser();

  if (!user?.id || !user.email) {
    return (
      <section className="tpg-container py-10">
        <EmptyState
          icon={PackageOpen}
          title="Iniciá sesión para ver este pedido"
          body="Por seguridad, los detalles del pedido se muestran solo desde la cuenta asociada."
          href="/login"
          action="Ingresar"
        />
      </section>
    );
  }

  const order = await getOrderForCustomer({
    idOrNumber: id,
    clerkUserId: user.id,
    email: user.email,
  });
  if (!order) {
    notFound();
  }

  return (
    <section className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-black text-white">{order.orderNumber}</h1>
      <p className="mt-2 text-[#A7ACB8]">
        {STATUS_LABELS[order.status]} ·{" "}
        {PAYMENT_STATUS_LABELS[order.paymentStatus]} ·{" "}
        {PAYMENT_METHOD_LABELS[order.paymentMethod ?? "mercadopago"]}
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <Link
          href={`/mi-cuenta/pedidos/${order.id}/comprobante`}
          className="btn btn-secondary"
        >
          Ver recibo imprimible
        </Link>
      </div>
      <div className="mt-6 rounded-lg border border-white/10 bg-[#111318] p-5">
        {order.items.map((item) => (
          <div
            key={`${item.productId}-${item.variantId ?? "base"}`}
            className="flex justify-between gap-4 border-b border-white/10 py-3 text-sm last:border-0"
          >
            <span className="text-white">
              {item.productName} x {item.quantity}
            </span>
            <span className="font-black text-white">
              {formatARS(item.totalCents)}
            </span>
          </div>
        ))}
        <div className="mt-4 flex justify-between text-xl font-black text-white">
          <span>Total</span>
          <span>{formatARS(order.totals.totalCents)}</span>
        </div>
      </div>
      <TransferProofUpload order={order} email={user.email} />
      {order.transferProofs?.length ? (
        <section className="mt-6 rounded-lg border border-white/10 bg-[#111318] p-5">
          <h2 className="text-xl font-black text-white">Comprobantes</h2>
          <div className="mt-3 space-y-2">
            {order.transferProofs.map((proof) => (
              <div key={proof.id} className="text-sm text-[#A7ACB8]">
                <strong className="text-white">{proof.fileName}</strong> ·{" "}
                {proof.status === "approved"
                  ? "aprobado"
                  : proof.status === "rejected"
                    ? "rechazado"
                    : "pendiente"}
                {proof.rejectionReason ? ` · ${proof.rejectionReason}` : ""}
              </div>
            ))}
          </div>
        </section>
      ) : null}
      <section className="mt-6 rounded-lg border border-white/10 bg-[#111318] p-5">
        <h2 className="text-xl font-black text-white">Historial</h2>
        <ol className="mt-4 space-y-3">
          {order.statusHistory.map((event) => (
            <li key={event.id} className="text-sm text-[#A7ACB8]">
              <strong className="text-white">
                {STATUS_LABELS[event.status]}
              </strong>{" "}
              {formatDateTimeAR(event.createdAt)}
            </li>
          ))}
        </ol>
      </section>
    </section>
  );
}
