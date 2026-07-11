"use client";

import { useState } from "react";
import { ShieldCheck, UserPlus } from "lucide-react";
import Link from "next/link";

import { useAuth } from "@/components/auth-provider";

export function RegisterForm() {
  const { signUp, configured } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signUp(email, password, firstName, lastName);
    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setSuccess(true);
  }

  if (!configured) {
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
        </div>
        <div className="tpg-card h-fit p-6 md:p-8">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-[#F59E0B]/13 text-[#F8D18A]">
            <UserPlus className="h-6 w-6" />
          </div>
          <h2 className="mt-5 text-2xl font-black text-white">Crear cuenta</h2>
          <p className="mt-2 text-sm leading-6 text-[#A7ACB8]">
            El sistema de cuentas requiere configuración de Supabase.
            Podés comprar como invitado y consultar tu pedido con email y número.
          </p>
          <Link href="/seguimiento" className="btn btn-primary mt-5 w-full">
            Consultar mi pedido
          </Link>
        </div>
      </section>
    );
  }

  if (success) {
    return (
      <section className="tpg-container py-16">
        <div className="tpg-card mx-auto max-w-lg p-8 text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl border border-[#22C55E]/30 bg-[#22C55E]/10 text-[#BFF7D2]">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <h1 className="mt-5 text-3xl font-black text-white">Cuenta creada</h1>
          <p className="mt-3 text-[#A7ACB8]">
            Te enviamos un email de confirmación a <strong className="text-white">{email}</strong>.
            Revisá tu bandeja de entrada y confirmá tu email para acceder a tu cuenta.
          </p>
          <Link href="/login" className="btn btn-primary mt-6">
            Ir a iniciar sesión
          </Link>
        </div>
      </section>
    );
  }

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
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-semibold text-[#A7ACB8]">
              Nombre
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.currentTarget.value)}
                className="input mt-2"
                placeholder="Tu nombre"
                required
              />
            </label>
            <label className="block text-sm font-semibold text-[#A7ACB8]">
              Apellido
              <input
                value={lastName}
                onChange={(e) => setLastName(e.currentTarget.value)}
                className="input mt-2"
                placeholder="Tu apellido"
                required
              />
            </label>
          </div>
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
              placeholder="Mínimo 8 caracteres"
              minLength={8}
              required
            />
          </label>
          {error ? (
            <p className="text-sm text-[#FCA5A5]" role="alert">{error}</p>
          ) : null}
          <button type="submit" disabled={loading} className="btn btn-primary w-full">
            {loading ? "Creando cuenta..." : "Crear cuenta"}
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
