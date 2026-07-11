"use client";

import { useState } from "react";
import { LogIn, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useAuth } from "@/components/auth-provider";

export function LoginForm() {
  const { signIn, configured } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn(email, password);
    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    router.push("/mi-cuenta");
    router.refresh();
  }

  if (!configured) {
    return (
      <section className="tpg-container grid gap-8 py-12 lg:grid-cols-[1fr_420px]">
        <div className="flex min-h-[520px] flex-col justify-center rounded-3xl border border-white/10 bg-[#111318] p-6 md:p-10">
          <p className="section-eyebrow">Cuenta T.PlayGames</p>
          <h1 className="mt-3 max-w-2xl text-4xl font-black leading-tight text-white md:text-5xl">
            Ingresá para seguir tus pedidos y guardar favoritos.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-[#A7ACB8]">
            Creá tu cuenta para acceder a tu historial de pedidos, guardar
            productos favoritos y recibir atención personalizada.
          </p>
        </div>
        <div className="tpg-card h-fit p-6 md:p-8">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-[#F59E0B]/13 text-[#F8D18A]">
            <LogIn className="h-6 w-6" />
          </div>
          <h2 className="mt-5 text-2xl font-black text-white">Iniciar sesión</h2>
          <p className="mt-2 text-sm leading-6 text-[#A7ACB8]">
            El sistema de cuentas requiere configuración de Supabase.
            Contactanos por WhatsApp si necesitás ayuda con un pedido.
          </p>
          <Link href="/seguimiento" className="btn btn-primary mt-5 w-full">
            Consultar mi pedido
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="tpg-container grid gap-8 py-12 lg:grid-cols-[1fr_420px]">
      <div className="flex min-h-[520px] flex-col justify-center rounded-3xl border border-white/10 bg-[#111318] p-6 md:p-10">
        <p className="section-eyebrow">Cuenta T.PlayGames</p>
        <h1 className="mt-3 max-w-2xl text-4xl font-black leading-tight text-white md:text-5xl">
          Ingresá para seguir tus pedidos y guardar favoritos.
        </h1>
        <p className="mt-5 max-w-xl text-base leading-7 text-[#A7ACB8]">
          Con tu cuenta podés ver el historial de pedidos, guardar productos
          favoritos y recibir atención personalizada.
        </p>
        <div className="mt-8 grid gap-3 md:grid-cols-2">
          <Benefit title="Historial" body="Consultá pedidos y estados." />
          <Benefit title="Favoritos" body="Guardá productos para volver después." />
          <Benefit title="Soporte" body="WhatsApp contextual por pedido." />
          <Benefit title="Privacidad" body="Sin datos de pago almacenados." />
        </div>
      </div>
      <div className="tpg-card h-fit p-6 md:p-8">
        <div className="grid h-12 w-12 place-items-center rounded-xl bg-[#1D6DFF]/13 text-[#8FB7FF]">
          <LogIn className="h-6 w-6" />
        </div>
        <h2 className="mt-5 text-2xl font-black text-white">Iniciar sesión</h2>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block text-sm font-semibold text-[#A7ACB8]">
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.currentTarget.value)}
              className="input mt-2"
              placeholder="tu@email.com"
              required
            />
          </label>
          <label className="block text-sm font-semibold text-[#A7ACB8]">
            Contraseña
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.currentTarget.value)}
              className="input mt-2"
              placeholder="••••••••"
              required
            />
          </label>
          {error ? (
            <p className="text-sm text-[#FCA5A5]" role="alert">{error}</p>
          ) : null}
          <button type="submit" disabled={loading} className="btn btn-primary w-full">
            {loading ? "Ingresando..." : "Iniciar sesión"}
          </button>
        </form>
        <div className="mt-5 rounded-xl border border-[#1D6DFF]/25 bg-[#1D6DFF]/10 p-4 text-sm leading-6 text-[#C8D9FF]">
          <ShieldCheck className="mb-2 h-5 w-5" />
          Tus datos están protegidos. No almacenamos información de pago.
        </div>
        <p className="mt-5 text-sm text-[#A7ACB8]">
          ¿No tenés cuenta?{" "}
          <Link href="/registro" className="font-bold text-[#8FB7FF]">
            Registrate
          </Link>
        </p>
        <Link href="/seguimiento" className="mt-3 block text-sm font-bold text-[#6EA2FF]">
          Consultar pedido sin cuenta
        </Link>
      </div>
    </section>
  );
}

function Benefit({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <h2 className="text-sm font-black text-white">{title}</h2>
      <p className="mt-1 text-sm leading-6 text-[#A7ACB8]">{body}</p>
    </div>
  );
}
