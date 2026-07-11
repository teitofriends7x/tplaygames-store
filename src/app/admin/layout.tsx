import Link from "next/link";
import { redirect } from "next/navigation";

import { getRoleFromServerSession, roleCanAccess } from "@/lib/authz";

const nav = [
  ["Resumen", "/admin"],
  ["Pedidos", "/admin/pedidos"],
  ["Productos", "/admin/productos"],
  ["Cupones", "/admin/cupones"],
  ["Auditoria", "/admin/auditoria"],
  ["Configuracion", "/admin/configuracion"],
] as const;

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const role = await getRoleFromServerSession();
  if (!role || !roleCanAccess(role, ["admin", "operator"])) {
    redirect("/mi-cuenta");
  }

  return (
    <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-8 lg:grid-cols-[220px_1fr]">
      <aside className="h-fit rounded-lg border border-white/10 bg-[#111318] p-3">
        <p className="px-3 py-2 text-xs font-black uppercase text-[#A7ACB8]">
          Administracion
        </p>
        <nav className="grid gap-1">
          {nav.map(([label, href]) => (
            <Link
              key={href}
              href={href}
              className="rounded-lg px-3 py-2 text-sm font-bold text-[#A7ACB8] hover:bg-white/8 hover:text-white"
            >
              {label}
            </Link>
          ))}
        </nav>
      </aside>
      <div>{children}</div>
    </div>
  );
}
