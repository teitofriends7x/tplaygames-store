import { notFound } from "next/navigation";

import { PAYMENT_STATUS_LABELS, STATUS_LABELS } from "@/lib/constants";
import { formatARS, formatDateTimeAR } from "@/lib/money";
import { findOrder } from "@/lib/store";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = findOrder(id);
  if (!order) {
    notFound();
  }

  return (
    <section className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-black text-white">{order.orderNumber}</h1>
      <p className="mt-2 text-[#A7ACB8]">
        {STATUS_LABELS[order.status]} · {PAYMENT_STATUS_LABELS[order.paymentStatus]}
      </p>
      <div className="mt-6 rounded-lg border border-white/10 bg-[#111318] p-5">
        {order.items.map((item) => (
          <div
            key={`${item.productId}-${item.variantId ?? "base"}`}
            className="flex justify-between gap-4 border-b border-white/10 py-3 text-sm last:border-0"
          >
            <span className="text-white">
              {item.productName} x {item.quantity}
            </span>
            <span className="font-black text-white">{formatARS(item.totalCents)}</span>
          </div>
        ))}
        <div className="mt-4 flex justify-between text-xl font-black text-white">
          <span>Total</span>
          <span>{formatARS(order.totals.totalCents)}</span>
        </div>
      </div>
      <section className="mt-6 rounded-lg border border-white/10 bg-[#111318] p-5">
        <h2 className="text-xl font-black text-white">Historial</h2>
        <ol className="mt-4 space-y-3">
          {order.statusHistory.map((event) => (
            <li key={event.id} className="text-sm text-[#A7ACB8]">
              <strong className="text-white">{STATUS_LABELS[event.status]}</strong>{" "}
              {formatDateTimeAR(event.createdAt)}
            </li>
          ))}
        </ol>
      </section>
    </section>
  );
}
