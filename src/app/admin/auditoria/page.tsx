import { formatDateTimeAR } from "@/lib/money";
import { getStoreState } from "@/lib/store";

export default function AdminAuditPage() {
  const logs = getStoreState().auditLogs;

  return (
    <section>
      <h1 className="text-3xl font-black text-white">Auditoria</h1>
      {!logs.length ? (
        <div className="mt-6 rounded-lg border border-white/10 bg-[#111318] p-6 text-[#A7ACB8]">
          No hay eventos administrativos todavia.
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {logs.map((log) => (
            <div key={log.id} className="rounded-lg border border-white/10 bg-[#111318] p-4">
              <p className="font-black text-white">{log.action}</p>
              <p className="mt-1 text-sm text-[#A7ACB8]">
                {log.entity} · {formatDateTimeAR(log.createdAt)} · {log.actorRole}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
