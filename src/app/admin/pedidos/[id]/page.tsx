import { notFound } from "next/navigation";
import Link from "next/link";

import {
  DigitalDeliveryForm,
  OrderStatusForm,
  ResendOrderEmailButton,
  TransferProofReviewActions,
} from "@/components/admin-actions";
import {
  PAYMENT_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  PRODUCT_TYPE_LABELS,
  STATUS_LABELS,
} from "@/lib/constants";
import { formatARS, formatDateTimeAR } from "@/lib/money";
import { getOrderDetailsForAdmin } from "@/lib/order-persistence";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrderDetailsForAdmin(id);
  if (!order) {
    notFound();
  }

  const hasDigital = order.items.some((item) => item.type === "digital");

  return (
    <section>
      <p className="section-eyebrow">Pedido</p>
      <h1 className="mt-2 text-3xl font-black text-white">
        {order.orderNumber}
      </h1>
      <div className="mt-3 flex flex-wrap gap-2">
        <span className="badge badge-blue">{STATUS_LABELS[order.status]}</span>
        <span
          className={
            order.paymentStatus === "approved"
              ? "badge badge-green"
              : order.paymentStatus === "rejected"
                ? "badge badge-red"
                : "badge badge-muted"
          }
        >
          {PAYMENT_STATUS_LABELS[order.paymentStatus]}
        </span>
        <span className="badge badge-muted">
          {PAYMENT_METHOD_LABELS[order.paymentMethod ?? "mercadopago"]}
        </span>
        <Link
          href={`/admin/pedidos/${order.id}/comprobante`}
          className="badge badge-muted hover:border-[#8FB7FF] hover:text-white"
        >
          Recibo imprimible
        </Link>
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <section className="tpg-card p-5">
            <h2 className="text-xl font-black text-white">Ítems</h2>
            {order.items.map((item) => (
              <div
                key={`${item.productId}-${item.variantId ?? "base"}`}
                className="flex justify-between gap-4 border-b border-white/10 py-3 text-sm last:border-0"
              >
                <span className="text-white">
                  {item.productName} x {item.quantity}
                  <span className="ml-2 text-[#A7ACB8]">
                    {PRODUCT_TYPE_LABELS[item.type]}
                  </span>
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
          </section>
          <section className="tpg-card p-5">
            <h2 className="text-xl font-black text-white">Comprador</h2>
            <p className="mt-2 text-[#A7ACB8]">
              {order.customer.firstName} {order.customer.lastName}
            </p>
            <p className="text-[#A7ACB8]">{order.customer.email}</p>
            <p className="text-[#A7ACB8]">{order.customer.phone}</p>
          </section>
          {order.address ? (
            <section className="tpg-card p-5">
              <h2 className="text-xl font-black text-white">Entrega</h2>
              <p className="mt-2 text-sm leading-6 text-[#A7ACB8]">
                {order.address.street}, {order.address.city},{" "}
                {order.address.province} ({order.address.postalCode})
              </p>
              {order.shipment?.trackingNumber ? (
                <p className="mt-2 text-sm text-[#A7ACB8]">
                  Tracking: {order.shipment.trackingNumber}
                </p>
              ) : (
                <p className="mt-2 text-sm text-[#A7ACB8]">
                  Sin tracking registrado todavía.
                </p>
              )}
            </section>
          ) : null}
          {order.transferProofs?.length ? (
            <section className="tpg-card p-5">
              <h2 className="text-xl font-black text-white">
                Comprobantes de transferencia
              </h2>
              <div className="mt-3 space-y-4">
                {order.transferProofs.map((proof) => (
                  <article
                    key={proof.id}
                    className="rounded-xl border border-white/10 bg-white/[0.03] p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-black text-white">
                          {proof.fileName}
                        </p>
                        <p className="mt-1 text-sm text-[#A7ACB8]">
                          {proof.mimeType} ·{" "}
                          {(proof.fileSizeBytes / 1024 / 1024).toFixed(2)} MB ·{" "}
                          {formatDateTimeAR(proof.createdAt)}
                        </p>
                      </div>
                      <span
                        className={
                          proof.status === "approved"
                            ? "badge badge-green"
                            : proof.status === "rejected"
                              ? "badge badge-red"
                              : "badge badge-muted"
                        }
                      >
                        {proof.status === "approved"
                          ? "Aprobado"
                          : proof.status === "rejected"
                            ? "Rechazado"
                            : "Pendiente"}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <a
                        href={`/api/admin/orders/${order.id}/transfer-proof/signed-url?proofId=${proof.id}`}
                        className="btn btn-secondary"
                        target="_blank"
                        rel="noreferrer"
                      >
                        Ver archivo
                      </a>
                    </div>
                    {proof.status === "pending" ? (
                      <TransferProofReviewActions
                        orderId={order.id}
                        proofId={proof.id}
                      />
                    ) : null}
                    {proof.rejectionReason ? (
                      <p className="mt-3 text-sm text-[#FCA5A5]">
                        Motivo: {proof.rejectionReason}
                      </p>
                    ) : null}
                  </article>
                ))}
              </div>
            </section>
          ) : null}
          {order.digitalDelivery ? (
            <section className="tpg-card p-5">
              <h2 className="text-xl font-black text-white">
                Entrega digital registrada
              </h2>
              <p className="mt-2 text-sm text-[#A7ACB8]">
                Canal: {order.digitalDelivery.channel} ·{" "}
                {formatDateTimeAR(order.digitalDelivery.deliveredAt)}
              </p>
              <p className="mt-3 rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-[#DDE7FF]">
                {order.digitalDelivery.secureReference}
              </p>
            </section>
          ) : null}
          {order.events?.length ? (
            <section className="tpg-card p-5">
              <h2 className="text-xl font-black text-white">Historial</h2>
              <div className="mt-3 space-y-3">
                {order.events.map((event) => (
                  <div
                    key={event.id}
                    className="border-l border-[#1D6DFF]/35 pl-3 text-sm"
                  >
                    <p className="font-bold text-white">{event.eventType}</p>
                    <p className="text-[#A7ACB8]">
                      {formatDateTimeAR(event.createdAt)}
                      {event.actorRole ? ` · ${event.actorRole}` : ""}
                    </p>
                    {event.internalNote ? (
                      <p className="mt-1 text-[#A7ACB8]">
                        {event.internalNote}
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
            </section>
          ) : null}
        </div>
        <aside className="space-y-4">
          <OrderStatusForm orderId={order.id} />
          <ResendOrderEmailButton orderId={order.id} />
          {hasDigital ? <DigitalDeliveryForm orderId={order.id} /> : null}
        </aside>
      </div>
    </section>
  );
}
