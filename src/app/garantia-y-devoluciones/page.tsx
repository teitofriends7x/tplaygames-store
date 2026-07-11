import { InfoPage } from "@/components/info-page";

export default function WarrantyPage() {
  return (
    <InfoPage
      title="Garantia y devoluciones"
      legal
      sections={[
        ["Garantia", "Texto pendiente de definicion comercial y revision profesional."],
        ["Devoluciones", "Texto pendiente de revision profesional antes de publicar."],
      ]}
    />
  );
}
