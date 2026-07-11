import { InfoPage } from "@/components/info-page";

export default function ShippingPage() {
  return (
    <InfoPage
      title="Envíos"
      sections={[
        [
          "Envío a domicilio",
          "Costo configurable por provincia o zona. La integración con operadores logísticos queda desacoplada.",
        ],
        [
          "Retiro",
          "Preparado como opción configurable, inicialmente deshabilitada hasta definir punto real.",
        ],
      ]}
    />
  );
}
