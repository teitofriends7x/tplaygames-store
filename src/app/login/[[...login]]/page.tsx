import { SignIn } from "@clerk/nextjs";
import type { Metadata } from "next";

import { clerkAppearance } from "@/lib/clerk-appearance";

export const metadata: Metadata = {
  title: "Iniciar sesión",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <section className="tpg-container grid gap-6 py-8 lg:grid-cols-[1fr_430px] lg:py-12">
      <div className="flex min-h-[520px] flex-col justify-center rounded-2xl border border-white/10 bg-[#111318] p-6 md:p-10">
        <p className="section-eyebrow">Cuenta T.PlayGames</p>
        <h1 className="mt-3 max-w-2xl text-4xl font-black leading-tight text-white md:text-5xl">
          Todo tu historial, listo para la próxima partida.
        </h1>
        <p className="mt-5 max-w-xl text-base leading-7 text-[#A7ACB8]">
          Ingresá con Google o email para ver pedidos, guardar favoritos y comprar más rápido.
        </p>
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <Benefit title="Pedidos" body="Estados, pagos y recibos en un solo lugar." />
          <Benefit title="Compra rápida" body="Completamos tus datos guardados en checkout." />
          <Benefit title="Favoritos" body="Retomá fácilmente los productos que te interesan." />
          <Benefit title="Acceso seguro" body="Sesión protegida y disponible cuando volvés." />
        </div>
      </div>
      <div className="h-fit">
        <SignIn
          appearance={clerkAppearance}
          routing="path"
          path="/login"
          signUpUrl="/registro"
          fallbackRedirectUrl="/mi-cuenta"
        />
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
