import { InfoPage } from "@/components/info-page";
import { whatsappGeneralUrl } from "@/lib/whatsapp";

export default function ContactPage() {
  return (
    <InfoPage
      title="Contacto"
      sections={[
        [
          "WhatsApp",
          "Escribinos por WhatsApp para consultas sobre productos, pedidos o envíos. Te respondemos de lunes a sábado de 9 a 21 hs.",
        ],
        [
          "Correo electrónico",
          "Podés contactarnos por email para consultas generales o solicitudes de garantía.",
        ],
      ]}
      whatsappUrl={whatsappGeneralUrl()}
    />
  );
}
