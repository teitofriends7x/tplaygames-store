import Link from "next/link";
import type { ReactNode } from "react";

import { formatARS } from "@/lib/money";
import { getDashboardMetrics } from "@/lib/store";

export default function AdminDashboardPage() {
  const metrics = getDashboardMetrics();

  return (
    <section>
      <p className="section-eyebrow">Panel</p>
      <h1 className="mt-2 text-3xl font-black text-white">Resumen</h1>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Metric
          label="Ventas aprobadas"
          value={formatARS(metrics.salesCents)}
        />
        <Metric
          label="Pedidos pendientes"
          value={String(metrics.pendingOrders)}
        />
        <Metric label="Pagados" value={String(metrics.paidOrders)} />
        <Metric
          label="Entregas digitales pendientes"
          value={String(metrics.digitalPending)}
        />
        <Metric
          label="Envíos pendientes"
          value={String(metrics.shippingPending)}
        />
        <Metric label="Stock bajo" value={String(metrics.lowStock.length)} />
      </div>
      <section className="mt-6 grid gap-4 xl:grid-cols-2">
        <Queue title="Atajos operativos">
          <AdminLink href="/admin/pedidos" label="Revisar pedidos" />
          <AdminLink href="/admin/inventario" label="Controlar inventario" />
          <AdminLink href="/admin/productos" label="Cargar producto" />
        </Queue>
        <Queue title="Alertas reales">
          {metrics.lowStock.length ? (
            metrics.lowStock.slice(0, 4).map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm"
              >
                <span className="font-semibold text-white">{product.name}</span>
                <span className="text-[#FBBF24]">Stock {product.stock}</span>
              </div>
            ))
          ) : (
            <p className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-6 text-[#A7ACB8]">
              No hay productos bajo el umbral configurado.
            </p>
          )}
        </Queue>
      </section>
      <section className="mt-6 tpg-card p-5">
        <h2 className="text-xl font-black text-white">Ventas y gráficos</h2>
        <p className="mt-2 text-sm leading-6 text-[#A7ACB8]">
          No se muestran gráficos falsos. Cuando existan pedidos aprobados
          suficientes, esta sección puede incorporar reportes reales por rango
          de fechas.
        </p>
      </section>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="tpg-card p-5">
      <p className="text-sm text-[#A7ACB8]">{label}</p>
      <p className="mt-2 text-2xl font-black text-white">{value}</p>
    </div>
  );
}

function Queue({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="tpg-card p-5">
      <h2 className="text-xl font-black text-white">{title}</h2>
      <div className="mt-4 grid gap-3">{children}</div>
    </div>
  );
}

function AdminLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-black text-white transition hover:border-[#1D6DFF]/45 hover:bg-white/[0.06]"
    >
      {label}
    </Link>
  );
}
