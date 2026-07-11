import { CatalogView } from "@/components/catalog-view";

export default function OfertasPage() {
  return (
    <CatalogView
      title="Ofertas"
      description="Productos con precio promocional activo."
      query={{ offer: true }}
    />
  );
}
