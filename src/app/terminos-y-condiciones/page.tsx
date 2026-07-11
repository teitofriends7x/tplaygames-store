import { InfoPage } from "@/components/info-page";

export default function TermsPage() {
  return (
    <InfoPage
      title="Términos y condiciones"
      legal
      sections={[
        [
          "Condiciones de compra",
          "Plantilla inicial pendiente de revisión profesional y datos comerciales definitivos.",
        ],
        [
          "Pagos",
          "Mercado Pago se activará con credenciales oficiales. No se confirma pago solo por volver a una URL de éxito.",
        ],
      ]}
    />
  );
}
