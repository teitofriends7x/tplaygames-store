import { PackageOpen } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { EmptyState } from "@/components/empty-state";
import { PAYMENT_STATUS_LABELS, STATUS_LABELS } from "@/lib/constants";
import { formatARS, formatDateTimeAR } from "@/lib/money";
import { listAccountOrders } from "@/lib/order-persistence";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Mis pedidos",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function OrdersPage() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = supabase ? await supabase.auth.getUser() : { data: { user: null } };
  const orders =
    user?.id && user.email
      ? await listAccountOrders({ userId: user.id, email: user.email })
      : [];

  return (
    <section className="tpg-container py-10">
      <p className="section-eyebrow">Seguimiento</p>
      <h1 className="mt-2 text-3xl font-black text-white">Mis pedidos</h1>
      {!user ? (
        <div className="mt-8">
          <EmptyState
            icon={PackageOpen}
            title="Iniciá sesión para ver tus pedidos"
            body="Los pedidos realizados con tu cuenta aparecen acá junto con estado, pago y recibos."
            href="/login"
            action="Ingresar"
          />
        </div>
      ) : !orders.length ? (
        <div className="mt-8">
          <EmptyState
            icon={PackageOpen}
            title="Todavía no hay pedidos"
            body="Cuando completes una compra, vas a poder consultar estado, pago y entrega desde esta sección."
            href="/catalogo"
            action="Explorar catálogo"
          />
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/mis-pedidos/${order.id}`}
              className="tpg-card grid gap-3 p-4 text-sm hover:border-[#1D6DFF] md:grid-cols-5"
            >
              <span className="font-black text-white">{order.orderNumber}</span>
              <span className="text-[#A7ACB8]">
                {STATUS_LABELS[order.status]}
              </span>
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
