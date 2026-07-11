import Link from "next/link";

import { Logo } from "@/components/logo";

const links = [
  ["Preguntas frecuentes", "/preguntas-frecuentes"],
  ["Contacto", "/contacto"],
  ["Envios", "/envios"],
  ["Garantia y devoluciones", "/garantia-y-devoluciones"],
  ["Privacidad", "/privacidad"],
  ["Terminos y condiciones", "/terminos-y-condiciones"],
] as const;

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#070707]">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-10 md:grid-cols-[1.2fr_2fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-sm text-sm leading-6 text-[#A7ACB8]">
            Tienda argentina especializada en consolas, controles y juegos.
            Datos demo hasta configurar catalogo real.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {links.map(([label, href]) => (
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
    </footer>
  );
}
