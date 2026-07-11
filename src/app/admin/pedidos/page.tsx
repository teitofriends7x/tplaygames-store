import Link from "next/link";

import { PAYMENT_STATUS_LABELS, STATUS_LABELS } from "@/lib/constants";
import { formatARS, formatDateTimeAR } from "@/lib/money";
import { listOrders } from "@/lib/store";

export default function AdminOrdersPage() {
  const orders = listOrders();

  return (
    <section>
      <h1 className="text-3xl font-black text-white">Pedidos</h1>
      {!orders.length ? (
        <div className="mt-6 rounded-lg border border-white/10 bg-[#111318] p-6 text-[#A7ACB8]">
          No hay pedidos todavia.
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-lg border border-white/10">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/admin/pedidos/${order.id}`}
              className="grid gap-3 border-b border-white/10 bg-[#111318] p-4 text-sm last:border-0 hover:bg-[#1B1D23] md:grid-cols-5"
            >
              <span className="font-black text-white">{order.orderNumber}</span>
              <span className="text-[#A7ACB8]">{STATUS_LABELS[order.status]}</span>
              <span className="text-[#A7ACB8]">
                {PAYMENT_STATUS_LABELS[order.paymentStatus]}
              </span>
              <span className="text-[#A7ACB8]">
                {formatDateTimeAR(order.createdAt)}
              </span>
              <span className="font-black text-white">
                {formatARS(order.totals.totalCents)}
              </span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
