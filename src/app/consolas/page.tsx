import { CatalogView } from "@/components/catalog-view";

export default function ConsolasPage() {
  return (
    <CatalogView
      title="Consolas"
      description="Consolas fisicas cargadas en T.PlayGames."
      query={{ category: "Consolas" }}
    />
  );
}
