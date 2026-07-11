import Link from "next/link";

import { EmptyState } from "@/components/empty-state";
import { ProductCard } from "@/components/product-card";
import { filterCatalog, type CatalogQuery } from "@/lib/catalog";
import { CATEGORIES, PLATFORMS, PRODUCT_TYPES } from "@/lib/constants";
import { listProducts } from "@/lib/store";
import { SearchX } from "lucide-react";

export function CatalogView({
  title = "Catálogo",
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
  if (query.type) params.set("type", query.type);
  if (query.available) params.set("available", "true");
  if (query.offer) params.set("offer", "true");
  if (query.sort) params.set("sort", query.sort);
  const activeFilters = [
    query.q ? `Búsqueda: ${query.q}` : undefined,
    query.category,
    query.platform,
    query.type === "physical"
      ? "Físico"
      : query.type === "digital"
        ? "Digital"
        : undefined,
    query.available ? "Con stock" : undefined,
    query.offer ? "Oferta" : undefined,
  ].filter(Boolean);

  return (
    <section className="tpg-container py-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="section-eyebrow">T.PlayGames</p>
          <h1 className="section-title mt-1">{title}</h1>
          <p className="section-copy mt-3">{description}</p>
        </div>
        <form
          action="/catalogo"
          className="tpg-card-soft grid gap-2 p-3 sm:grid-cols-2 lg:grid-cols-5"
        >
          {query.q ? <input type="hidden" name="q" value={query.q} /> : null}
          <select
            name="category"
            defaultValue={query.category ?? ""}
            className="form-control"
          >
            <option value="">Todas</option>
            {CATEGORIES.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
          <select
            name="platform"
            defaultValue={query.platform ?? ""}
            className="form-control"
          >
            <option value="">Plataforma</option>
            {PLATFORMS.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
          <select
            name="type"
            defaultValue={query.type ?? ""}
            className="form-control"
          >
            <option value="">Formato</option>
            {PRODUCT_TYPES.map((item) => (
              <option key={item} value={item}>
                {item === "physical" ? "Físico" : "Digital"}
              </option>
            ))}
          </select>
          <select
            name="sort"
            defaultValue={query.sort ?? "relevance"}
            className="form-control"
          >
            <option value="relevance">Relevancia</option>
            <option value="price_asc">Menor precio</option>
            <option value="price_desc">Mayor precio</option>
            <option value="newest">Más nuevos</option>
            <option value="featured">Destacados</option>
          </select>
          <label className="flex min-h-11 items-center gap-2 rounded-lg border border-white/10 bg-[#070707] px-3 text-sm font-bold text-[#A7ACB8]">
            <input
              type="checkbox"
              name="available"
              value="true"
              defaultChecked={query.available}
            />
            Con stock
          </label>
          <button className="btn btn-primary lg:col-span-5">Aplicar</button>
        </form>
      </div>
      {activeFilters.length ? (
        <div className="mt-5 flex flex-wrap items-center gap-2">
          {activeFilters.map((filter) => (
            <span key={filter} className="badge badge-blue">
              {filter}
            </span>
          ))}
          <Link href="/catalogo" className="badge badge-muted hover:text-white">
            Limpiar filtros
          </Link>
        </div>
      ) : null}
      {result.total === 0 ? (
        <div className="mt-10">
          <EmptyState
            icon={SearchX}
            title="No encontramos productos"
            body="Probá quitar algún filtro, revisar la búsqueda o volver al catálogo completo."
            href="/catalogo"
            action="Limpiar filtros"
          />
        </div>
      ) : (
        <>
          <p className="mt-6 text-sm font-semibold text-[#A7ACB8]">
            {result.total} resultado{result.total === 1 ? "" : "s"}
          </p>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {result.products.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                priority={index === 0}
              />
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
                  className={`grid h-10 w-10 place-items-center rounded-lg border text-sm font-bold ${
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
