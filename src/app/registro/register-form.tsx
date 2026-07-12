"use client";

import { Eye, EyeOff, ShieldCheck, UserPlus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useAuth } from "@/components/auth-provider";

export function RegisterForm({
  next = "/mi-cuenta",
  initialEmail = "",
}: {
  next?: string;
  initialEmail?: string;
}) {
  const { signUp, signInWithGoogle, configured } = useAuth();
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState(initialEmail);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (loading) return;
    setError("");

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    if (!acceptedTerms) {
      setError("Aceptá los términos y la política de privacidad para continuar.");
      return;
    }

    setLoading(true);
    const result = await signUp(
      { firstName, lastName, email: email.trim(), phone: phone.trim() || undefined, password },
      next,
    );
    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }
    if (result.signedIn) {
      router.replace(next);
      router.refresh();
      return;
    }
    setSuccess(true);
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

  if (success) {
    return (
      <section className="tpg-container py-16">
        <div className="tpg-card mx-auto max-w-lg p-8 text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl border border-[#22C55E]/30 bg-[#22C55E]/10 text-[#BFF7D2]">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <h1 className="mt-5 text-3xl font-black text-white">Revisá tu email</h1>
          <p className="mt-3 leading-7 text-[#A7ACB8]">
            Creamos tu cuenta y enviamos un enlace de confirmación a{" "}
            <strong className="text-white">{email}</strong>. Después de confirmarlo vas a poder ingresar normalmente.
          </p>
          <Link href="/login" className="btn btn-primary mt-6">Ir a iniciar sesión</Link>
        </div>
      </section>
    );
  }

  return (
    <section className="tpg-container grid gap-6 py-8 lg:grid-cols-[1fr_470px] lg:py-12">
      <div className="flex min-h-[560px] flex-col justify-center rounded-2xl border border-white/10 bg-[#111318] p-6 md:p-10">
        <p className="section-eyebrow">Cuenta T.PlayGames</p>
        <h1 className="mt-3 max-w-2xl text-4xl font-black leading-tight text-white md:text-5xl">
          Creá tu cuenta y tené cada compra a mano.
        </h1>
        <p className="mt-5 max-w-xl text-base leading-7 text-[#A7ACB8]">
          Seguimiento simple, favoritos sincronizados y tus datos listos para el próximo checkout.
        </p>
        <div className="mt-8 rounded-xl border border-[#22C55E]/25 bg-[#22C55E]/10 p-5 text-sm leading-6 text-[#BFF7D2]">
          Crear una cuenta es opcional. También podés comprar como invitado y consultar cada pedido con tu email y número de compra.
        </div>
      </div>

      <div className="tpg-card h-fit p-6 md:p-8">
        <div className="grid h-12 w-12 place-items-center rounded-xl bg-[#1D6DFF]/13 text-[#8FB7FF]">
          <UserPlus className="h-6 w-6" />
        </div>
        <h2 className="mt-5 text-2xl font-black text-white">Crear una cuenta</h2>
        <p className="mt-2 text-sm leading-6 text-[#A7ACB8]">Completá tus datos o registrate con Google.</p>

        {!configured ? (
          <p className="mt-5 rounded-xl border border-[#F59E0B]/30 bg-[#F59E0B]/10 p-4 text-sm leading-6 text-[#FDE68A]" role="status">
            La creación de cuentas no está disponible en este momento. Podés seguir comprando como invitado.
          </p>
        ) : null}

        <button type="button" onClick={handleGoogle} disabled={!configured || googleLoading || loading} className="btn btn-secondary mt-6 w-full">
          <span aria-hidden="true" className="grid h-5 w-5 place-items-center rounded-full bg-white text-xs font-black text-[#111318]">G</span>
          {googleLoading ? "Conectando..." : "Registrarme con Google"}
        </button>
        <div className="my-5 flex items-center gap-3 text-xs font-bold uppercase text-[#737986]" aria-hidden="true">
          <span className="h-px flex-1 bg-white/10" />o con email<span className="h-px flex-1 bg-white/10" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nombre">
              <input value={firstName} onChange={(event) => setFirstName(event.currentTarget.value)} className="input" autoComplete="given-name" required />
            </Field>
            <Field label="Apellido">
              <input value={lastName} onChange={(event) => setLastName(event.currentTarget.value)} className="input" autoComplete="family-name" required />
            </Field>
          </div>
          <Field label="Email">
            <input type="email" value={email} onChange={(event) => setEmail(event.currentTarget.value)} className="input" autoComplete="email" placeholder="tu@email.com" required />
          </Field>
          <Field label="Teléfono (opcional)">
            <input type="tel" value={phone} onChange={(event) => setPhone(event.currentTarget.value)} className="input" autoComplete="tel" />
          </Field>
          <div>
            <label htmlFor="register-password" className="block text-sm font-semibold text-[#A7ACB8]">Contraseña</label>
            <div className="relative mt-2">
              <input id="register-password" type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.currentTarget.value)} className="input pr-12" autoComplete="new-password" placeholder="Mínimo 8 caracteres" minLength={8} required />
              <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute inset-y-0 right-0 grid w-11 place-items-center text-[#A7ACB8] hover:text-white" aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}>
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>
          <Field label="Repetir contraseña">
            <input type={showPassword ? "text" : "password"} value={confirmPassword} onChange={(event) => setConfirmPassword(event.currentTarget.value)} className="input" autoComplete="new-password" required />
          </Field>
          <label className="flex items-start gap-3 text-sm leading-6 text-[#A7ACB8]">
            <input type="checkbox" checked={acceptedTerms} onChange={(event) => setAcceptedTerms(event.currentTarget.checked)} className="mt-1" />
            <span>Acepto los <Link href="/terminos-y-condiciones" className="font-bold text-[#8FB7FF]">términos</Link> y la <Link href="/privacidad" className="font-bold text-[#8FB7FF]">política de privacidad</Link>.</span>
          </label>
          {error ? <p className="text-sm leading-6 text-[#FCA5A5]" role="alert">{error}</p> : null}
          <button type="submit" disabled={!configured || loading || googleLoading} className="btn btn-primary w-full">
            {loading ? "Creando cuenta..." : "Crear cuenta"}
          </button>
        </form>
        <p className="mt-5 text-center text-sm text-[#A7ACB8]">
          ¿Ya tenés una cuenta?{" "}<Link href={`/login?next=${encodeURIComponent(next)}`} className="font-bold text-[#8FB7FF] hover:text-white">Iniciar sesión</Link>
        </p>
      </div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block text-sm font-semibold text-[#A7ACB8]">{label}<span className="mt-2 block">{children}</span></label>;
}
