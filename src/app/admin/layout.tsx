import {
  ClipboardList,
  Gauge,
  PackageSearch,
  Percent,
  ScrollText,
  Settings,
  Warehouse,
} from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getRoleFromServerSession } from "@/lib/authz";
import { roleCanAccess } from "@/lib/role-access";

const nav = [
  ["Resumen", "/admin", Gauge],
  ["Pedidos", "/admin/pedidos", ClipboardList],
  ["Productos", "/admin/productos", PackageSearch],
  ["Inventario", "/admin/inventario", Warehouse],
  ["Cupones", "/admin/cupones", Percent],
  ["Auditoría", "/admin/auditoria", ScrollText],
  ["Configuración", "/admin/configuracion", Settings],
] as const;

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

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
    <div className="tpg-container grid min-w-0 gap-6 py-8 lg:grid-cols-[240px_1fr]">
      <aside className="h-fit min-w-0 rounded-2xl border border-white/10 bg-[#111318]/92 p-3 lg:sticky lg:top-24">
        <p className="px-3 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#A7ACB8]">
          Administración
        </p>
        <nav className="flex max-w-full gap-2 overflow-x-auto pb-1 lg:grid lg:gap-1 lg:overflow-visible lg:pb-0">
          {nav.map(([label, href, Icon]) => (
            <Link
              key={href}
              href={href}
              className="inline-flex min-w-max items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-[#A7ACB8] transition hover:bg-white/8 hover:text-white"
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
