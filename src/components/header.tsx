import { Heart, ShoppingBag, UserRound } from "lucide-react";
import Link from "next/link";

import { Logo } from "@/components/logo";
import { SearchBox } from "@/components/search-box";

const nav = [
  { href: "/catalogo", label: "Catalogo" },
  { href: "/consolas", label: "Consolas" },
  { href: "/controles", label: "Controles" },
  { href: "/juegos", label: "Juegos" },
  { href: "/ofertas", label: "Ofertas" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#070707]/92 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-3 lg:flex-row lg:items-center">
        <div className="flex items-center justify-between gap-3">
          <Logo />
          <div className="flex items-center gap-1 lg:hidden">
            <HeaderIcon href="/favoritos" label="Favoritos" icon={<Heart />} />
            <HeaderIcon href="/carrito" label="Carrito" icon={<ShoppingBag />} />
          </div>
        </div>
        <SearchBox />
        <nav className="flex gap-1 overflow-x-auto lg:ml-auto" aria-label="Principal">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm font-semibold text-[#A7ACB8] hover:bg-white/8 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-1 lg:flex">
          <HeaderIcon href="/mi-cuenta" label="Cuenta" icon={<UserRound />} />
          <HeaderIcon href="/favoritos" label="Favoritos" icon={<Heart />} />
          <HeaderIcon href="/carrito" label="Carrito" icon={<ShoppingBag />} />
        </div>
      </div>
    </header>
  );
}

function HeaderIcon({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: React.ReactElement<{ className?: string }>;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      title={label}
      className="grid h-10 w-10 place-items-center rounded-lg text-[#A7ACB8] transition hover:bg-white/8 hover:text-white"
    >
      {icon}
    </Link>
  );
}
