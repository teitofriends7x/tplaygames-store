import { InfoPage } from "@/components/info-page";

export default function TermsPage() {
  return (
    <InfoPage
      title="Terminos y condiciones"
      legal
      sections={[
        ["Condiciones de compra", "Plantilla inicial pendiente de revision profesional y datos comerciales definitivos."],
        ["Pagos", "Mercado Pago se activara con credenciales oficiales. No se confirma pago solo por volver a una URL de exito."],
      ]}
    />
  );
}
