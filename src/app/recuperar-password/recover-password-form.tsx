"use client";

import { Mail } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { useAuth } from "@/components/auth-provider";

export function RecoverPasswordForm() {
  const { resetPassword, configured } = useAuth();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);
    const result = await resetPassword(email);
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setMessage(
      "Si el email existe, vas a recibir un enlace para crear una nueva contraseña.",
    );
  }

  return (
    <section className="tpg-container grid gap-8 py-12 lg:grid-cols-[1fr_420px]">
      <div className="flex min-h-[420px] flex-col justify-center rounded-3xl border border-white/10 bg-[#111318] p-6 md:p-10">
        <p className="section-eyebrow">Cuenta T.PlayGames</p>
        <h1 className="mt-3 max-w-2xl text-4xl font-black leading-tight text-white md:text-5xl">
          Recuperá el acceso a tu cuenta.
        </h1>
        <p className="mt-5 max-w-xl text-base leading-7 text-[#A7ACB8]">
          Te enviamos un enlace seguro al email registrado para que definas una
          nueva contraseña.
        </p>
      </div>
      <form onSubmit={submit} className="tpg-card h-fit p-6 md:p-8">
        <div className="grid h-12 w-12 place-items-center rounded-xl bg-[#1D6DFF]/13 text-[#8FB7FF]">
          <Mail className="h-6 w-6" />
        </div>
        <h2 className="mt-5 text-2xl font-black text-white">
          Recuperar contraseña
        </h2>
        {!configured ? (
          <p className="mt-4 rounded-xl border border-[#F59E0B]/30 bg-[#F59E0B]/10 p-4 text-sm leading-6 text-[#FDE68A]" role="status">
            La recuperación de cuentas no está disponible en este momento. Intentá nuevamente más tarde.
          </p>
        ) : null}
        <label className="mt-6 block text-sm font-semibold text-[#A7ACB8]">
          Email
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.currentTarget.value)}
            className="input mt-2"
            placeholder="tu@email.com"
            required
          />
        </label>
        {message ? (
          <p className="mt-3 text-sm text-[#86EFAC]">{message}</p>
        ) : null}
        {error ? <p className="mt-3 text-sm text-[#FCA5A5]" role="alert">{error}</p> : null}
        <button
          disabled={loading || !configured}
          className="btn btn-primary mt-5 w-full"
        >
          {loading ? "Enviando..." : "Enviar enlace"}
        </button>
        <Link
          href="/login"
          className="mt-4 block text-sm font-bold text-[#8FB7FF]"
        >
          Volver al ingreso
        </Link>
      </form>
    </section>
  );
}
