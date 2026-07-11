import { ScrollText } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { formatDateTimeAR } from "@/lib/money";
import { getStoreState } from "@/lib/store";

export default function AdminAuditPage() {
  const logs = getStoreState().auditLogs;

  return (
    <section>
      <p className="section-eyebrow">Seguridad</p>
      <h1 className="mt-2 text-3xl font-black text-white">Auditoría</h1>
      {!logs.length ? (
        <div className="mt-8">
          <EmptyState
            icon={ScrollText}
            title="No hay eventos administrativos todavía"
            body="Las acciones de productos, pedidos y entregas se registran en este entorno demo cuando se ejecutan."
          />
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {logs.map((log) => (
            <div key={log.id} className="tpg-card p-4">
              <p className="font-black text-white">{log.action}</p>
              <p className="mt-1 text-sm text-[#A7ACB8]">
                {log.entity} · {formatDateTimeAR(log.createdAt)} ·{" "}
                {log.actorRole}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
