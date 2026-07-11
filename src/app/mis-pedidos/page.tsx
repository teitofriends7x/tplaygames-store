import Link from "next/link";

import { PAYMENT_STATUS_LABELS, STATUS_LABELS } from "@/lib/constants";
import { formatARS, formatDateTimeAR } from "@/lib/money";
import { listOrders } from "@/lib/store";

export default function OrdersPage() {
  const orders = listOrders();

  return (
    <section className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-black text-white">Mis pedidos</h1>
      {!orders.length ? (
        <p className="mt-4 text-[#A7ACB8]">
          Todavia no hay pedidos en este entorno.
        </p>
      ) : (
        <div className="mt-6 space-y-3">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/mis-pedidos/${order.id}`}
              className="grid gap-3 rounded-lg border border-white/10 bg-[#111318] p-4 text-sm hover:border-[#1D6DFF] md:grid-cols-5"
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
