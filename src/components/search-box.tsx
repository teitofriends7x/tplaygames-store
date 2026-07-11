"use client";

import { Search, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { formatARS } from "@/lib/money";

type Suggestion = {
  id: string;
  label: string;
  href: string;
  category: string;
  priceCents: number;
};

export function SearchBox() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const trimmed = query.trim();
  const canSearch = trimmed.length >= 2 && trimmed.length <= 80;

  useEffect(() => {
    if (!canSearch) {
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      const response = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`, {
        signal: controller.signal,
      }).catch(() => undefined);
      if (!response?.ok) {
        return;
      }

      const data = (await response.json()) as { suggestions: Suggestion[] };
      setSuggestions(data.suggestions);
      setOpen(true);
    }, 260);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [canSearch, trimmed]);

  const searchHref = useMemo(
    () => `/buscar?q=${encodeURIComponent(trimmed)}`,
    [trimmed],
  );

  return (
    <form
      action="/buscar"
      className="relative w-full max-w-xl"
      role="search"
      onSubmit={() => setOpen(false)}
    >
      <label htmlFor="site-search" className="sr-only">
        Buscar productos
      </label>
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#A7ACB8]"
      />
      <input
        id="site-search"
        name="q"
        autoComplete="off"
        value={query}
        onChange={(event) => {
          const value = event.target.value;
          setQuery(value);
          if (value.trim().length < 2) {
            setSuggestions([]);
            setOpen(false);
          }
        }}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        placeholder="Buscar consolas, controles, juegos..."
        className="h-11 w-full rounded-lg border border-white/10 bg-[#111318] px-10 text-sm text-white outline-none transition focus:border-[#1D6DFF] focus:ring-2 focus:ring-[#1D6DFF]/30"
      />
      {query ? (
        <button
          type="button"
          aria-label="Limpiar busqueda"
          onClick={() => {
            setQuery("");
            setOpen(false);
          }}
          className="absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-md text-[#A7ACB8] hover:bg-white/10 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      ) : null}
      {open && canSearch ? (
        <div className="absolute left-0 right-0 top-12 z-50 overflow-hidden rounded-lg border border-white/10 bg-[#111318] shadow-2xl">
          {suggestions.length > 0 ? (
            <ul className="max-h-80 overflow-auto py-2">
              {suggestions.map((item) => (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    className="flex items-center justify-between gap-4 px-4 py-3 text-sm text-white hover:bg-white/8"
                    onClick={() => setOpen(false)}
                  >
                    <span>
                      <span className="block font-semibold">{item.label}</span>
                      <span className="text-xs text-[#A7ACB8]">
                        {item.category}
                      </span>
                    </span>
                    <span className="font-bold text-[#1D6DFF]">
                      {formatARS(item.priceCents)}
                    </span>
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href={searchHref}
                  className="block border-t border-white/10 px-4 py-3 text-sm font-semibold text-[#1D6DFF] hover:bg-white/8"
                  onClick={() => setOpen(false)}
                >
                  Ver todos los resultados
                </Link>
              </li>
            </ul>
          ) : (
            <div className="px-4 py-5 text-sm text-[#A7ACB8]">
              No encontramos resultados rapidos.
            </div>
          )}
        </div>
      ) : null}
    </form>
  );
}
