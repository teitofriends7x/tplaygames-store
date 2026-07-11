import { CatalogView } from "@/components/catalog-view";

export default function JuegosPage() {
  return (
    <CatalogView
      title="Juegos"
      description="Juegos físicos y digitales con entrega manual segura cuando corresponda."
      query={{ category: "Juegos" }}
    />
  );
}
