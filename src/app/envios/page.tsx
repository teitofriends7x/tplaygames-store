import { InfoPage } from "@/components/info-page";

export default function ShippingPage() {
  return (
    <InfoPage
      title="Envios"
      sections={[
        ["Envio a domicilio", "Costo configurable por provincia o zona. La integracion con operadores logisticos queda desacoplada."],
        ["Retiro", "Preparado como opcion configurable, inicialmente deshabilitada hasta definir punto real."],
      ]}
    />
  );
}
