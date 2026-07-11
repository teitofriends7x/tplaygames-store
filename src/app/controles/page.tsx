import { CatalogView } from "@/components/catalog-view";

export default function ControlesPage() {
  return (
    <CatalogView
      title="Controles"
      description="Controles para PlayStation, Xbox y Nintendo."
      query={{ category: "Controles" }}
    />
  );
}
