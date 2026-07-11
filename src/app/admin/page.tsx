import { formatARS } from "@/lib/money";
import { getDashboardMetrics } from "@/lib/store";

export default function AdminDashboardPage() {
  const metrics = getDashboardMetrics();

  return (
    <section>
      <h1 className="text-3xl font-black text-white">Resumen</h1>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Metric label="Ventas aprobadas" value={formatARS(metrics.salesCents)} />
        <Metric label="Pedidos pendientes" value={String(metrics.pendingOrders)} />
        <Metric label="Pagados" value={String(metrics.paidOrders)} />
        <Metric label="Entregas digitales pendientes" value={String(metrics.digitalPending)} />
        <Metric label="Envios pendientes" value={String(metrics.shippingPending)} />
        <Metric label="Stock bajo" value={String(metrics.lowStock.length)} />
      </div>
      <section className="mt-6 rounded-lg border border-white/10 bg-[#111318] p-5">
        <h2 className="text-xl font-black text-white">Productos mas vendidos</h2>
        <p className="mt-2 text-sm text-[#A7ACB8]">
          No se muestran metricas falsas. Al no haber ventas historicas, se
          listan productos demo como referencia operativa.
        </p>
      </section>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-[#111318] p-5">
      <p className="text-sm text-[#A7ACB8]">{label}</p>
      <p className="mt-2 text-2xl font-black text-white">{value}</p>
    </div>
  );
}
