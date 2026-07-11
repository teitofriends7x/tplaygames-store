import { CatalogView } from "@/components/catalog-view";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const q = Array.isArray(params.q) ? params.q[0] : params.q;

  return (
    <CatalogView
      title={q ? `Resultados para "${q}"` : "Buscar"}
      description="Resultados completos de búsqueda."
      query={{ q }}
    />
  );
}
