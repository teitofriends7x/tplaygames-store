import { InfoPage } from "@/components/info-page";

export default function FAQPage() {
  return (
    <InfoPage
      title="Preguntas frecuentes"
      sections={[
        [
          "¿Qué vende T.PlayGames?",
          "Consolas, controles y juegos para PlayStation, Xbox, Nintendo y PC. Todos los productos son nuevos y sellados.",
        ],
        [
          "¿Hay juegos digitales?",
          "Sí. Los juegos digitales se entregan de forma manual una vez confirmado el pago. Te contactamos por el canal que elijas para completar la entrega.",
        ],
        [
          "¿Los precios publicados son definitivos?",
          "Sí, los precios publicados son finales. Si elegís pagar por transferencia, accedés a un precio especial que se muestra en cada producto.",
        ],
        [
          "¿Cómo funciona el pago por transferencia?",
          "Al seleccionar transferencia en el checkout, te mostramos los datos bancarios. Tenés 24 horas para realizar la transferencia y enviar el comprobante por WhatsApp. Tu pedido se confirma una vez acreditado el pago.",
        ],
        [
          "¿Cuánto tarda el envío?",
          "Los pedidos se despachan dentro de las 48 horas hábiles posteriores a la confirmación del pago. Los plazos dependen del destino y el operador logístico.",
        ],
        [
          "¿Puedo consultar antes de comprar?",
          "Sí. Escribinos por WhatsApp y te asesoramos sin compromiso sobre cualquier producto o consulta sobre tu pedido.",
        ],
      ]}
    />
  );
}
