import { Heart, Headphones, PackageCheck, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Mi cuenta",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AccountPage() {
  return (
    <section className="tpg-container py-10">
      <p className="section-eyebrow">Cliente</p>
      <h1 className="mt-2 text-3xl font-black text-white">Mi cuenta</h1>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-[#A7ACB8]">
        Supabase Auth queda preparado para registro, inicio de sesión,
        recuperación de contraseña y perfil. Configurar credenciales para usarlo
        con cuentas reales.
      </p>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <AccountLink
          href="/mis-pedidos"
          label="Mis pedidos"
          body="Seguimiento de pedidos y pagos."
          icon={PackageCheck}
        />
        <AccountLink
          href="/favoritos"
          label="Favoritos"
          body="Productos guardados en este navegador."
          icon={Heart}
        />
        <AccountLink
          href="/contacto"
          label="Soporte"
          body="Ayuda por WhatsApp y consultas."
          icon={Headphones}
        />
      </div>
      <div className="mt-8 rounded-2xl border border-[#1D6DFF]/25 bg-[#1D6DFF]/10 p-5 text-sm leading-6 text-[#C8D9FF]">
        <ShieldCheck className="mb-3 h-5 w-5" />
        En desarrollo, el panel administrativo usa un rol de prueba si Supabase
        no está configurado. En producción requiere sesión real y RLS activo.
      </div>
    </section>
  );
}

function AccountLink({
  href,
  label,
  body,
  icon: Icon,
}: {
  href: string;
  label: string;
  body: string;
  icon: typeof PackageCheck;
}) {
  return (
    <Link
      href={href}
      className="tpg-card p-5 transition hover:-translate-y-0.5 hover:border-[#1D6DFF]/45"
    >
      <div className="grid h-11 w-11 place-items-center rounded-xl bg-[#1D6DFF]/13 text-[#8FB7FF]">
        <Icon className="h-5 w-5" />
      </div>
      <h2 className="mt-5 font-black text-white">{label}</h2>
      <p className="mt-2 text-sm leading-6 text-[#A7ACB8]">{body}</p>
    </Link>
  );
}
