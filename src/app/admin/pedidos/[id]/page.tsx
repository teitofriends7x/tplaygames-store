import { notFound } from "next/navigation";

import { DigitalDeliveryForm, OrderStatusForm } from "@/components/admin-actions";
import { PAYMENT_STATUS_LABELS, STATUS_LABELS } from "@/lib/constants";
import { formatARS } from "@/lib/money";
import { findOrder } from "@/lib/store";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = findOrder(id);
  if (!order) {
    notFound();
  }

  const hasDigital = order.items.some((item) => item.type === "digital");

  return (
    <section>
      <h1 className="text-3xl font-black text-white">{order.orderNumber}</h1>
      <p className="mt-2 text-[#A7ACB8]">
        {STATUS_LABELS[order.status]} · {PAYMENT_STATUS_LABELS[order.paymentStatus]}
      </p>
      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <section className="rounded-lg border border-white/10 bg-[#111318] p-5">
            <h2 className="text-xl font-black text-white">Items</h2>
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
          </section>
          <section className="rounded-lg border border-white/10 bg-[#111318] p-5">
            <h2 className="text-xl font-black text-white">Comprador</h2>
            <p className="mt-2 text-[#A7ACB8]">
              {order.customer.firstName} {order.customer.lastName}
            </p>
            <p className="text-[#A7ACB8]">{order.customer.email}</p>
            <p className="text-[#A7ACB8]">{order.customer.phone}</p>
          </section>
        </div>
        <aside className="space-y-4">
          <OrderStatusForm orderId={order.id} />
          {hasDigital ? <DigitalDeliveryForm orderId={order.id} /> : null}
        </aside>
      </div>
    </section>
  );
}
