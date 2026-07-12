"use client";

import { Eye, EyeOff, LogIn, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useAuth } from "@/components/auth-provider";

export function LoginForm({
  next = "/mi-cuenta",
  pageError,
}: {
  next?: string;
  pageError?: string;
}) {
  const { signIn, signInWithGoogle, configured } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(pageError ?? "");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (loading) return;
    setError("");
    setLoading(true);
    const result = await signIn(email.trim(), password);
    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    router.replace(next);
    router.refresh();
  }

  async function handleGoogle() {
    if (googleLoading) return;
    setError("");
    setGoogleLoading(true);
    const result = await signInWithGoogle(next);
    if (result.error) {
      setError(result.error);
      setGoogleLoading(false);
    }
  }

  return (
    <section className="tpg-container grid gap-6 py-8 lg:grid-cols-[1fr_430px] lg:py-12">
      <div className="flex min-h-[500px] flex-col justify-center rounded-2xl border border-white/10 bg-[#111318] p-6 md:p-10">
        <p className="section-eyebrow">Cuenta T.PlayGames</p>
        <h1 className="mt-3 max-w-2xl text-4xl font-black leading-tight text-white md:text-5xl">
          Tu próxima partida empieza acá.
        </h1>
        <p className="mt-5 max-w-xl text-base leading-7 text-[#A7ACB8]">
          Ingresá para ver tus pedidos, guardar favoritos y comprar más rápido.
        </p>
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <Benefit title="Todos tus pedidos" body="Historial y seguimiento en un solo lugar." />
          <Benefit title="Compra más rápida" body="Completamos tus datos guardados en checkout." />
          <Benefit title="Favoritos" body="Retomá fácilmente los productos que te interesan." />
          <Benefit title="Sesión protegida" body="Autenticación segura y datos de pago fuera de la tienda." />
        </div>
      </div>

      <div className="tpg-card h-fit p-6 md:p-8">
        <div className="grid h-12 w-12 place-items-center rounded-xl bg-[#1D6DFF]/13 text-[#8FB7FF]">
          <LogIn className="h-6 w-6" />
        </div>
        <h2 className="mt-5 text-2xl font-black text-white">Iniciar sesión</h2>
        <p className="mt-2 text-sm leading-6 text-[#A7ACB8]">
          Accedé con tu email o continuá con Google.
        </p>

        {!configured ? (
          <p className="mt-3 rounded-lg border border-[#F59E0B]/30 bg-[#F59E0B]/10 px-3 py-2 text-sm leading-5 text-[#FDE68A]" role="status">
            En este momento no podemos iniciar sesión. Intentá nuevamente más tarde.
          </p>
        ) : null}

        <button
          type="button"
          onClick={handleGoogle}
          disabled={!configured || googleLoading || loading}
          className="btn btn-secondary mt-6 w-full"
        >
          <span aria-hidden="true" className="grid h-5 w-5 place-items-center rounded-full bg-white text-xs font-black text-[#111318]">G</span>
          {googleLoading ? "Conectando..." : "Continuar con Google"}
        </button>

        <div className="my-5 flex items-center gap-3 text-xs font-bold uppercase text-[#737986]" aria-hidden="true">
          <span className="h-px flex-1 bg-white/10" />
          o con email
          <span className="h-px flex-1 bg-white/10" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <label className="block text-sm font-semibold text-[#A7ACB8]">
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.currentTarget.value)}
              className="input mt-2"
              placeholder="tu@email.com"
              autoComplete="email"
              required
            />
          </label>
          <div>
            <label htmlFor="login-password" className="block text-sm font-semibold text-[#A7ACB8]">Contraseña</label>
            <div className="relative mt-2">
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.currentTarget.value)}
                className="input pr-12"
                placeholder="Tu contraseña"
                autoComplete="current-password"
                minLength={8}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute inset-y-0 right-0 grid w-11 place-items-center text-[#A7ACB8] hover:text-white"
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>
          <div className="flex justify-end">
            <Link href="/recuperar-contrasena" className="text-sm font-bold text-[#8FB7FF] hover:text-white">
              Olvidé mi contraseña
            </Link>
          </div>
          {error ? <p className="text-sm leading-6 text-[#FCA5A5]" role="alert">{error}</p> : null}
          <button type="submit" disabled={!configured || loading || googleLoading} className="btn btn-primary w-full">
            {loading ? "Ingresando..." : "Iniciar sesión"}
          </button>
        </form>

        <div className="mt-5 rounded-xl border border-[#1D6DFF]/25 bg-[#1D6DFF]/10 p-4 text-sm leading-6 text-[#C8D9FF]">
          <ShieldCheck className="mb-2 h-5 w-5" />
          Tus credenciales se gestionan de forma segura. No almacenamos información de pago.
        </div>
        <p className="mt-5 text-center text-sm text-[#A7ACB8]">
          ¿No tenés cuenta?{" "}
          <Link href={`/registro?next=${encodeURIComponent(next)}`} className="font-bold text-[#8FB7FF] hover:text-white">
            Crear una cuenta
          </Link>
        </p>
        <p className="mt-4 border-t border-white/10 pt-4 text-center text-sm text-[#A7ACB8]">
          ¿Compraste como invitado?{" "}
          <Link href="/seguimiento" className="font-bold text-[#8FB7FF] hover:text-white">Consultá un pedido</Link>
        </p>
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
