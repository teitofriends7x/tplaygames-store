import { InfoPage } from "@/components/info-page";

export default function WarrantyPage() {
  return (
    <InfoPage
      title="Garantía y devoluciones"
      legal
      sections={[
        [
          "Garantía",
          "Texto pendiente de definición comercial y revisión profesional.",
        ],
        [
          "Devoluciones",
          "Texto pendiente de revisión profesional antes de publicar.",
        ],
      ]}
    />
  );
}
