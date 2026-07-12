import { SignUp } from "@clerk/nextjs";
import type { Metadata } from "next";

import { clerkAppearance } from "@/lib/clerk-appearance";

export const metadata: Metadata = {
  title: "Crear cuenta",
  robots: { index: false, follow: false },
};

export default function RegisterPage() {
  return (
    <section className="tpg-container grid gap-6 py-8 lg:grid-cols-[1fr_450px] lg:py-12">
      <div className="flex min-h-[540px] flex-col justify-center rounded-2xl border border-white/10 bg-[#111318] p-6 md:p-10">
        <p className="section-eyebrow">Cuenta T.PlayGames</p>
        <h1 className="mt-3 max-w-2xl text-4xl font-black leading-tight text-white md:text-5xl">
          Creá tu cuenta y tené cada compra a mano.
        </h1>
        <p className="mt-5 max-w-xl text-base leading-7 text-[#A7ACB8]">
          Registrate con Google o email. La verificación, recuperación y seguridad de tu sesión quedan protegidas.
        </p>
        <div className="mt-8 rounded-xl border border-[#22C55E]/25 bg-[#22C55E]/10 p-5 text-sm leading-6 text-[#BFF7D2]">
          Tus pedidos autenticados quedan asociados automáticamente y los anteriores pueden vincularse por email verificado.
        </div>
      </div>
      <div className="h-fit">
        <SignUp
          appearance={clerkAppearance}
          routing="path"
          path="/registro"
          signInUrl="/login"
          fallbackRedirectUrl="/mi-cuenta"
        />
      </div>
    </section>
  );
}
