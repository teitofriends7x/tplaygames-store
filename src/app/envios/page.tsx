import { InfoPage } from "@/components/info-page";

export default function ShippingPage() {
  return (
    <InfoPage
      title="Envíos"
      sections={[
        [
          "Envío a domicilio",
          "Realizamos envíos a todo el país. El costo varía según la provincia y se calcula antes de confirmar el pedido. El envío es bonificado para compras superiores al monto indicado en el checkout.",
        ],
        [
          "Retiro en punto acordado",
          "Consultá la disponibilidad de retiro escribiéndonos por WhatsApp antes de realizar tu compra.",
        ],
        [
          "Plazos de entrega",
          "Los pedidos se despachan dentro de las 48 horas hábiles posteriores a la confirmación del pago. Los plazos de entrega dependen del destino y el operador logístico.",
        ],
      ]}
    />
  );
}
