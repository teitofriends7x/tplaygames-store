import Link from "next/link";
import { MessageCircle } from "lucide-react";

import { Logo } from "@/components/logo";
import { whatsappGeneralUrl } from "@/lib/whatsapp";

const columns = [
  {
    title: "Comprar",
    links: [
      ["Consolas", "/consolas"],
      ["Controles", "/controles"],
      ["Juegos", "/juegos"],
      ["Ofertas", "/ofertas"],
    ],
  },
  {
    title: "Ayuda",
    links: [
      ["Envíos", "/envios"],
      ["Garantía y devoluciones", "/garantia-y-devoluciones"],
      ["Preguntas frecuentes", "/preguntas-frecuentes"],
      ["Contacto", "/contacto"],
    ],
  },
  {
    title: "Legal",
    links: [
      ["Privacidad", "/privacidad"],
      ["Términos y condiciones", "/terminos-y-condiciones"],
    ],
  },
] as const;

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#050506]">
      <div className="tpg-container grid gap-10 py-12 lg:grid-cols-[1.1fr_2fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-sm text-sm leading-6 text-[#A7ACB8]">
            Tienda especializada en consolas, controles y juegos.
            Pago seguro, envíos a todo el país y atención personalizada.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <span className="badge badge-blue">Mercado Pago</span>
            <span className="badge badge-muted">Transferencia</span>
            <span className="badge badge-green">Soporte WhatsApp</span>
          </div>
          <div className="mt-5 flex items-center gap-3">
            <a
              href={whatsappGeneralUrl()}
              className="inline-flex items-center gap-2 text-sm font-bold text-[#86EFAC] hover:text-white"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </a>
          </div>
        </div>
        <div className="grid gap-8 sm:grid-cols-3">
          {columns.map((column) => (
            <div key={column.title}>
              <h2 className="text-sm font-black uppercase text-white">
                {column.title}
              </h2>
              <div className="mt-4 grid gap-3">
                {column.links.map(([label, href]) => (
                  <Link
                    key={href}
                    href={href}
                    className="text-sm font-semibold text-[#A7ACB8] hover:text-white"
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-white/10 py-4">
        <div className="tpg-container flex flex-col gap-2 text-xs text-[#7D8492] sm:flex-row sm:items-center sm:justify-between">
          <span>© 2026 T.PlayGames. Todos los derechos reservados.</span>
          <span>Atención: lunes a sábado de 9 a 21 hs.</span>
        </div>
      </div>
    </footer>
  );
}
