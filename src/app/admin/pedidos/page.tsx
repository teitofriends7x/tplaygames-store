import { ClipboardList, Filter } from "lucide-react";
import Link from "next/link";

import { EmptyState } from "@/components/empty-state";
import {
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
  STATUS_LABELS,
} from "@/lib/constants";
import { formatARS, formatDateTimeAR } from "@/lib/money";
import {
  listAdminOrders,
  type AdminOrderFilters,
} from "@/lib/order-persistence";
import { adminOrdersQuerySchema } from "@/lib/validation";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const parsed = adminOrdersQuerySchema.safeParse({
    q: firstParam(params.q),
    email: firstParam(params.email),
    from: firstParam(params.from),
    to: firstParam(params.to),
    paymentMethod: firstParam(params.paymentMethod) || undefined,
    status: firstParam(params.status) || undefined,
    paymentStatus: firstParam(params.paymentStatus) || undefined,
    page: firstParam(params.page) || "1",
    pageSize: "12",
  });
  const filters: AdminOrderFilters = parsed.success ? parsed.data : {};
  const { orders, total, page, totalPages } = await listAdminOrders(filters);

  return (
    <section>
      <p className="section-eyebrow">Operación</p>
      <h1 className="mt-2 text-3xl font-black text-white">Pedidos</h1>
      <form className="tpg-card mt-6 grid gap-3 p-4 md:grid-cols-6">
        <label className="text-xs font-bold uppercase text-[#A7ACB8] md:col-span-2">
          Buscar
          <input
            name="q"
            defaultValue={filters.q}
            placeholder="Número de pedido"
            className="input mt-2"
          />
        </label>
        <label className="text-xs font-bold uppercase text-[#A7ACB8] md:col-span-2">
          Email
          <input
            name="email"
            defaultValue={filters.email}
            placeholder="cliente@email.com"
            className="input mt-2"
          />
        </label>
        <label className="text-xs font-bold uppercase text-[#A7ACB8]">
          Desde
          <input
            name="from"
            type="date"
            defaultValue={filters.from}
            className="input mt-2"
          />
        </label>
        <label className="text-xs font-bold uppercase text-[#A7ACB8]">
          Hasta
          <input
            name="to"
            type="date"
            defaultValue={filters.to}
            className="input mt-2"
          />
        </label>
        <button className="btn btn-primary md:col-span-2">
          <Filter className="h-4 w-4" />
          Filtrar pedidos
        </button>
        <Link href="/admin/pedidos" className="btn btn-secondary md:col-span-2">
          Limpiar filtros
        </Link>
        <p className="self-center text-sm text-[#A7ACB8] md:col-span-2">
          {total} pedido{total === 1 ? "" : "s"} encontrado
          {total === 1 ? "" : "s"}.
        </p>
      </form>
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
                <th>Cliente</th>
                <th>Estado</th>
                <th>Pago</th>
                <th>Método</th>
                <th>Comprobante</th>
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
                    <span className="block text-white">
                      {order.customer.firstName} {order.customer.lastName}
                    </span>
                    <span className="text-xs text-[#A7ACB8]">
                      {order.customer.email}
                    </span>
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
                  <td>
                    {
                      PAYMENT_METHOD_LABELS[
                        order.paymentMethod ?? "mercadopago"
                      ]
                    }
                  </td>
                  <td>
                    {order.transferProofs?.length ? (
                      <span className="badge badge-green">
                        {order.transferProofs.length} enviado
                        {order.transferProofs.length === 1 ? "" : "s"}
                      </span>
                    ) : (
                      <span className="badge badge-muted">Sin archivo</span>
                    )}
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
      {totalPages > 1 ? (
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <PaginationLink
            disabled={page <= 1}
            page={page - 1}
            params={params}
            label="Anterior"
          />
          <span className="text-sm text-[#A7ACB8]">
            Página {page} de {totalPages}
          </span>
          <PaginationLink
            disabled={page >= totalPages}
            page={page + 1}
            params={params}
            label="Siguiente"
          />
        </div>
      ) : null}
    </section>
  );
}

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function PaginationLink({
  disabled,
  page,
  params,
  label,
}: {
  disabled: boolean;
  page: number;
  params: Record<string, string | string[] | undefined>;
  label: string;
}) {
  const next = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    const normalized = firstParam(value);
    if (normalized && key !== "page") next.set(key, normalized);
  }
  next.set("page", String(page));

  if (disabled) {
    return <span className="btn btn-secondary opacity-45">{label}</span>;
  }

  return (
    <Link
      href={`/admin/pedidos?${next.toString()}`}
      className="btn btn-secondary"
    >
      {label}
    </Link>
  );
}
