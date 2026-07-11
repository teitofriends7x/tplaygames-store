import { ClipboardList } from "lucide-react";
import Link from "next/link";

import { EmptyState } from "@/components/empty-state";
import { PAYMENT_STATUS_LABELS, STATUS_LABELS } from "@/lib/constants";
import { formatARS, formatDateTimeAR } from "@/lib/money";
import { listOrders } from "@/lib/store";

export default function AdminOrdersPage() {
  const orders = listOrders();

  return (
    <section>
      <p className="section-eyebrow">Operación</p>
      <h1 className="mt-2 text-3xl font-black text-white">Pedidos</h1>
      {!orders.length ? (
        <div className="mt-8">
          <EmptyState
            icon={ClipboardList}
            title="No hay pedidos todavía"
            body="Cuando un cliente cree un pedido, aparecerá acá con estado, pago, entrega y acciones operativas."
            href="/catalogo"
            action="Ver tienda pública"
          />
        </div>
      ) : (
        <div className="mt-6 max-w-full overflow-x-auto rounded-2xl border border-white/10">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Pedido</th>
                <th>Estado</th>
                <th>Pago</th>
                <th>Fecha</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>
                    <Link
                      href={`/admin/pedidos/${order.id}`}
                      className="font-black text-white hover:text-[#8FB7FF]"
                    >
                      {order.orderNumber}
                    </Link>
                  </td>
                  <td>
                    <span className="badge badge-blue">
                      {STATUS_LABELS[order.status]}
                    </span>
                  </td>
                  <td>
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
                  </td>
                  <td>{formatDateTimeAR(order.createdAt)}</td>
                  <td className="font-black text-white">
                    {formatARS(order.totals.totalCents)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
