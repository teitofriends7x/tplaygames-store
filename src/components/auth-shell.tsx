import {
  Headphones,
  Heart,
  PackageCheck,
  ReceiptText,
} from "lucide-react";

const benefits = [
  {
    title: "Historial de pedidos",
    body: "Estados, pagos y comprobantes siempre a mano.",
    icon: ReceiptText,
  },
  {
    title: "Favoritos sincronizados",
    body: "Guardá productos y retomá tu compra cuando quieras.",
    icon: Heart,
  },
  {
    title: "Seguimiento de compras",
    body: "Consultá cada etapa desde una sola cuenta.",
    icon: PackageCheck,
  },
  {
    title: "Atención personalizada",
    body: "Tu información nos ayuda a resolver consultas más rápido.",
    icon: Headphones,
  },
] as const;

export function AuthShell({
  children,
  mode,
}: {
  children: React.ReactNode;
  mode: "login" | "register";
}) {
  const isLogin = mode === "login";

  return (
    <section className="relative isolate overflow-hidden border-b border-white/8 bg-[linear-gradient(135deg,#070707_0%,#0A0D14_58%,#071127_100%)]">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(90deg,transparent_0%,rgba(29,109,255,0.05)_50%,transparent_100%)]" />
      <div className="tpg-container grid items-center gap-10 py-6 sm:py-8 lg:min-h-[calc(100svh-5rem)] lg:grid-cols-[minmax(0,1fr)_minmax(460px,500px)] lg:gap-14 lg:py-12">
        <div data-auth-benefits className="hidden max-w-2xl lg:block">
          <p className="section-eyebrow">Cuenta T.PlayGames</p>
          <h2 className="mt-4 max-w-xl text-4xl font-black leading-tight text-white xl:text-5xl">
            {isLogin
              ? "Volvé a tus compras sin perder el ritmo."
              : "Una cuenta para tener cada compra bajo control."}
          </h2>
          <p className="mt-5 max-w-xl text-base leading-7 text-[#B8BDC8]">
            {isLogin
              ? "Accedé de forma segura y seguí desde donde dejaste tu última visita."
              : "Creala en pocos pasos y encontrá pedidos, favoritos y seguimiento en un mismo lugar."}
          </p>

          <div className="mt-9 grid max-w-2xl grid-cols-2 gap-x-8 gap-y-6">
            {benefits.map(({ title, body, icon: Icon }) => (
              <div key={title} className="flex gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-[#1D6DFF]/35 bg-[#1D6DFF]/12 text-[#8FB7FF]">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="text-sm font-black text-white">{title}</h3>
                  <p className="mt-1 text-sm leading-5 text-[#9299A8]">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mx-auto w-full max-w-[500px] lg:mx-0 lg:justify-self-end">
          {children}
        </div>
      </div>
    </section>
  );
}
