"use client";

import { Heart, Loader2, Menu, ShieldCheck, ShoppingBag, UserRound, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Logo } from "@/components/logo";
import { SearchBox } from "@/components/search-box";
import { useAuth } from "@/components/auth-provider";
import { useCartItems, useFavoriteProductIds } from "@/lib/cart-client";

const nav = [
  { href: "/catalogo", label: "Catálogo" },
  { href: "/consolas", label: "Consolas" },
  { href: "/controles", label: "Controles" },
  { href: "/juegos", label: "Juegos" },
  { href: "/ofertas", label: "Ofertas" },
];

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const cartCount = useCartItems().reduce(
    (total, item) => total + item.quantity,
    0,
  );
  const favoriteCount = useFavoriteProductIds().length;

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#070707]/88 shadow-[0_10px_40px_rgba(0,0,0,0.24)] backdrop-blur-xl">
      <div className="tpg-container flex flex-col gap-3 py-3 lg:flex-row lg:items-center">
        <div className="flex items-center justify-between gap-3">
          <Logo />
          <div className="flex items-center gap-2 lg:hidden">
            <AccountIcon user={user} loading={authLoading} />
            <span className="hidden sm:block">
              <HeaderIcon
                href="/favoritos"
                label="Favoritos"
                icon={<Heart />}
                count={favoriteCount}
              />
            </span>
            <HeaderIcon
              href="/carrito"
              label="Carrito"
              icon={<ShoppingBag />}
              count={cartCount}
            />
            <button
              type="button"
              className="icon-button"
              onClick={() => setMenuOpen((value) => !value)}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
            >
              {menuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
        <div className="lg:min-w-[360px] lg:flex-1">
          <SearchBox />
        </div>
        <nav
          id="mobile-nav"
          className={`gap-1 overflow-x-auto lg:ml-auto lg:flex ${
            menuOpen ? "grid" : "hidden"
          } lg:grid-cols-none`}
          aria-label="Principal"
        >
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-bold text-[#A7ACB8] transition hover:bg-white/8 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href={user ? "/mi-cuenta" : "/login"}
            onClick={() => setMenuOpen(false)}
            className="rounded-lg px-3 py-2 text-sm font-bold text-[#A7ACB8] transition hover:bg-white/8 hover:text-white lg:hidden"
          >
            {user ? "Mi cuenta" : "Iniciar sesión"}
          </Link>
          <Link
            href="/favoritos"
            onClick={() => setMenuOpen(false)}
            className="rounded-lg px-3 py-2 text-sm font-bold text-[#A7ACB8] transition hover:bg-white/8 hover:text-white lg:hidden"
          >
            Favoritos{favoriteCount ? ` (${favoriteCount})` : ""}
          </Link>
          {user?.role === "admin" ? (
            <Link
              href="/admin"
              onClick={() => setMenuOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-bold text-[#8FB7FF] transition hover:bg-white/8 hover:text-white lg:hidden"
            >
              Panel administrador
            </Link>
          ) : null}
        </nav>
        <div className="hidden items-center gap-1 lg:flex">
          {user?.role === "admin" ? (
            <HeaderIcon href="/admin" label="Panel administrador" icon={<ShieldCheck />} />
          ) : null}
          <AccountIcon user={user} loading={authLoading} />
          <HeaderIcon
            href="/favoritos"
            label="Favoritos"
            icon={<Heart />}
            count={favoriteCount}
          />
          <HeaderIcon
            href="/carrito"
            label="Carrito"
            icon={<ShoppingBag />}
            count={cartCount}
          />
        </div>
      </div>
    </header>
  );
}

function AccountIcon({
  user,
  loading,
}: {
  user: ReturnType<typeof useAuth>["user"];
  loading: boolean;
}) {
  if (loading) {
    return (
      <span className="icon-button border-0 bg-transparent" aria-label="Cargando cuenta" title="Cargando cuenta">
        <Loader2 className="h-5 w-5 animate-spin" />
      </span>
    );
  }

  const label = user ? "Mi cuenta" : "Ingresar";
  return (
    <HeaderIcon
      href={user ? "/mi-cuenta" : "/login"}
      label={label}
      icon={
        user ? (
          <span className="grid h-7 w-7 place-items-center rounded-full bg-[#1D6DFF] text-xs font-black text-white" aria-hidden="true">
            {(user.firstName?.[0] ?? user.email[0] ?? "U").toUpperCase()}
          </span>
        ) : (
          <UserRound />
        )
      }
    />
  );
}

function HeaderIcon({
  href,
  label,
  icon,
  count,
}: {
  href: string;
  label: string;
  icon: React.ReactElement<{ className?: string }>;
  count?: number;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      title={label}
      className="icon-button relative border-0 bg-transparent"
    >
      {icon}
      {count ? (
        <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-[#1D6DFF] px-1 text-[10px] font-black text-white">
          {count > 99 ? "99+" : count}
        </span>
      ) : null}
    </Link>
  );
}
