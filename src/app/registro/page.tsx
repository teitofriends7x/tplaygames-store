import { ShieldCheck, UserPlus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Registro",
  robots: {
    index: false,
    follow: false,
  },
};

export default function RegisterPage() {
  return (
    <section className="tpg-container grid gap-8 py-12 lg:grid-cols-[1fr_420px]">
      <div className="flex min-h-[520px] flex-col justify-center rounded-3xl border border-white/10 bg-[#111318] p-6 md:p-10">
        <p className="section-eyebrow">Registro</p>
        <h1 className="mt-3 max-w-2xl text-4xl font-black leading-tight text-white md:text-5xl">
          Creá tu cuenta y accedé a beneficios exclusivos.
        </h1>
        <p className="mt-5 max-w-xl text-base leading-7 text-[#A7ACB8]">
          Con tu cuenta podés seguir el estado de tus pedidos, guardar
          productos favoritos y recibir atención personalizada.
        </p>
        <div className="mt-8 rounded-2xl border border-[#22C55E]/25 bg-[#22C55E]/10 p-5 text-sm leading-6 text-[#BFF7D2]">
          Podés comprar como invitado sin necesidad de crear una cuenta.
          La cuenta te permite acceder a tu historial y favoritos.
        </div>
      </div>
      <div className="tpg-card h-fit p-6 md:p-8">
        <div className="grid h-12 w-12 place-items-center rounded-xl bg-[#1D6DFF]/13 text-[#8FB7FF]">
          <UserPlus className="h-6 w-6" />
        </div>
        <h2 className="mt-5 text-2xl font-black text-white">Crear cuenta</h2>
        <p className="mt-2 text-sm leading-6 text-[#A7ACB8]">
          Completá tus datos para crear tu cuenta en T.PlayGames.
        </p>
        <form className="mt-6 space-y-4">
          <label className="block text-sm font-semibold text-[#A7ACB8]">
            Nombre
            <input className="input mt-2" placeholder="Tu nombre" disabled />
          </label>
          <label className="block text-sm font-semibold text-[#A7ACB8]">
            Email
            <input
              type="email"
              className="input mt-2"
              placeholder="tu@email.com"
              disabled
            />
          </label>
          <label className="block text-sm font-semibold text-[#A7ACB8]">
            Contraseña
            <input
              type="password"
              className="input mt-2"
              placeholder="Mínimo 8 caracteres"
              disabled
            />
          </label>
          <button type="button" disabled className="btn btn-primary w-full">
            Crear cuenta
          </button>
        </form>
        <div className="mt-5 rounded-xl border border-[#1D6DFF]/25 bg-[#1D6DFF]/10 p-4 text-sm leading-6 text-[#C8D9FF]">
          <ShieldCheck className="mb-2 h-5 w-5" />
          Tus datos están protegidos y no se comparten con terceros.
        </div>
        <p className="mt-5 text-sm text-[#A7ACB8]">
          ¿Ya tenés cuenta?{" "}
          <Link href="/login" className="font-bold text-[#8FB7FF]">
            Iniciá sesión
          </Link>
        </p>
      </div>
    </section>
  );
}
