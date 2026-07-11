import Link from "next/link";

export default function AccountPage() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-black text-white">Mi cuenta</h1>
      <p className="mt-3 text-[#A7ACB8]">
        Supabase Auth queda preparado para registro, inicio de sesion,
        recuperacion de contraseña y perfil. Configurar credenciales para usarlo.
      </p>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <AccountLink href="/mis-pedidos" label="Mis pedidos" />
        <AccountLink href="/favoritos" label="Favoritos" />
        <AccountLink href="/contacto" label="Soporte" />
      </div>
    </section>
  );
}

function AccountLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="rounded-lg border border-white/10 bg-[#111318] p-5 font-black text-white hover:border-[#1D6DFF]"
    >
      {label}
    </Link>
  );
}
