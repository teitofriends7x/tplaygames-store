import { InfoPage } from "@/components/info-page";

export default function WarrantyPage() {
  return (
    <InfoPage
      title="Garantía y devoluciones"
      legal
      sections={[
        [
          "Garantía",
          "Todos los productos son nuevos y sellados. Cada producto indica sus condiciones específicas de garantía al momento de la compra. Las consolas y controles cuentan con garantía del fabricante. Los juegos digitales están sujetos a las condiciones del editor.",
        ],
        [
          "Devoluciones",
          "Si el producto presenta un defecto de fábrica, podés solicitar un cambio o devolución dentro de los 10 días corridos posteriores a la entrega. El producto debe estar en su empaque original y sin uso. Contactanos por WhatsApp para iniciar el proceso.",
        ],
      ]}
    />
  );
}
