"use client";

import { KeyRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useAuth } from "@/components/auth-provider";

export function UpdatePasswordForm() {
  const { updatePassword, configured } = useAuth();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    const result = await updatePassword(password);
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }

    router.push("/mi-cuenta");
    router.refresh();
  }

  return (
    <section className="tpg-container grid gap-8 py-12 lg:grid-cols-[1fr_420px]">
      <div className="flex min-h-[420px] flex-col justify-center rounded-3xl border border-white/10 bg-[#111318] p-6 md:p-10">
        <p className="section-eyebrow">Cuenta T.PlayGames</p>
        <h1 className="mt-3 max-w-2xl text-4xl font-black leading-tight text-white md:text-5xl">
          Definí una nueva contraseña.
        </h1>
        <p className="mt-5 max-w-xl text-base leading-7 text-[#A7ACB8]">
          Usá una clave única y guardala en tu gestor de contraseñas.
        </p>
      </div>
      <form onSubmit={submit} className="tpg-card h-fit p-6 md:p-8">
        <div className="grid h-12 w-12 place-items-center rounded-xl bg-[#1D6DFF]/13 text-[#8FB7FF]">
          <KeyRound className="h-6 w-6" />
        </div>
        <h2 className="mt-5 text-2xl font-black text-white">
          Actualizar contraseña
        </h2>
        {!configured ? (
          <p className="mt-4 text-sm text-[#FCA5A5]">
            La autenticación requiere configurar Supabase.
          </p>
        ) : null}
        <label className="mt-6 block text-sm font-semibold text-[#A7ACB8]">
          Nueva contraseña
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.currentTarget.value)}
            className="input mt-2"
            required
          />
        </label>
        <label className="mt-4 block text-sm font-semibold text-[#A7ACB8]">
          Repetir contraseña
          <input
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.currentTarget.value)}
            className="input mt-2"
            required
          />
        </label>
        {error ? <p className="mt-3 text-sm text-[#FCA5A5]">{error}</p> : null}
        <button
          disabled={loading || !configured}
          className="btn btn-primary mt-5 w-full"
        >
          {loading ? "Guardando..." : "Guardar contraseña"}
        </button>
      </form>
    </section>
  );
}
