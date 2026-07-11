import { InfoPage } from "@/components/info-page";

export default function TermsPage() {
  return (
    <InfoPage
      title="Términos y condiciones"
      legal
      sections={[
        [
          "Condiciones de compra",
          "Al realizar una compra en T.PlayGames, aceptás estos términos y condiciones. Los productos ofrecidos son consolas, controles y juegos nuevos. Los precios están expresados en pesos argentinos (ARS) e incluyen IVA.",
        ],
        [
          "Pagos",
          "Aceptamos Mercado Pago (tarjeta de crédito, débito o dinero en cuenta) y transferencia bancaria. El pedido se confirma únicamente una vez acreditado el pago. Volver a la URL de éxito de Mercado Pago no confirma el pago por sí sola; la confirmación llega por notificación oficial.",
        ],
        [
          "Precios y disponibilidad",
          "Los precios y el stock se verifican al momento de crear el pedido. T.PlayGames se reserva el derecho de modificar precios y disponibilidad sin previo aviso.",
        ],
        [
          "Entrega digital",
          "Los juegos digitales se entregan de forma manual una vez confirmado el pago. No se generan licencias, códigos ni cuentas de forma automática.",
        ],
      ]}
    />
  );
}
