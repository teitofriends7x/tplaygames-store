import Link from "next/link";

import { ProductCard } from "@/components/product-card";
import { filterCatalog, type CatalogQuery } from "@/lib/catalog";
import { CATEGORIES, PLATFORMS } from "@/lib/constants";
import { listProducts } from "@/lib/store";

export function CatalogView({
  title = "Catalogo",
  description = "Consolas, controles y juegos disponibles.",
  query,
}: {
  title?: string;
  description?: string;
  query: CatalogQuery;
}) {
  const result = filterCatalog(query, listProducts());
  const params = new URLSearchParams();
  if (query.q) params.set("q", query.q);
  if (query.category) params.set("category", query.category);
  if (query.platform) params.set("platform", query.platform);
  if (query.offer) params.set("offer", "true");

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-black text-white md:text-4xl">{title}</h1>
          <p className="mt-2 max-w-2xl text-[#A7ACB8]">{description}</p>
        </div>
        <form className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <select
            name="category"
            defaultValue={query.category ?? ""}
            className="h-10 rounded-lg border border-white/10 bg-[#111318] px-3 text-sm text-white"
          >
            <option value="">Todas</option>
            {CATEGORIES.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
          <select
            name="platform"
            defaultValue={query.platform ?? ""}
            className="h-10 rounded-lg border border-white/10 bg-[#111318] px-3 text-sm text-white"
          >
            <option value="">Plataforma</option>
            {PLATFORMS.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
          <select
            name="sort"
            defaultValue={query.sort ?? "relevance"}
            className="h-10 rounded-lg border border-white/10 bg-[#111318] px-3 text-sm text-white"
          >
            <option value="relevance">Relevancia</option>
            <option value="price_asc">Menor precio</option>
            <option value="price_desc">Mayor precio</option>
            <option value="newest">Mas nuevos</option>
            <option value="featured">Destacados</option>
          </select>
          <button className="h-10 rounded-lg bg-[#1D6DFF] px-4 text-sm font-bold text-white">
            Aplicar
          </button>
        </form>
      </div>
      {result.total === 0 ? (
        <div className="mt-10 rounded-lg border border-white/10 bg-[#111318] p-8 text-center">
          <h2 className="text-xl font-black text-white">Sin resultados</h2>
          <p className="mt-2 text-[#A7ACB8]">
            Proba ajustar filtros o volver al catalogo completo.
          </p>
          <Link
            href="/catalogo"
            className="mt-5 inline-flex h-10 items-center rounded-lg bg-[#1D6DFF] px-4 text-sm font-bold text-white"
          >
            Limpiar filtros
          </Link>
        </div>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {result.products.map((product, index) => (
              <ProductCard key={product.id} product={product} priority={index === 0} />
            ))}
          </div>
          <nav className="mt-8 flex items-center justify-center gap-2">
            {Array.from({ length: result.totalPages }, (_, index) => {
              const page = index + 1;
              params.set("page", String(page));
              return (
                <Link
                  key={page}
                  href={`/catalogo?${params.toString()}`}
                  className={`grid h-10 w-10 place-items-center rounded-lg border border-white/10 text-sm font-bold ${
                    page === result.page
                      ? "bg-[#1D6DFF] text-white"
                      : "bg-[#111318] text-[#A7ACB8]"
                  }`}
                >
                  {page}
                </Link>
              );
            })}
          </nav>
        </>
      )}
    </section>
  );
}
