import { InfoPage } from "@/components/info-page";

export default function ContactPage() {
  return (
    <InfoPage
      title="Contacto"
      sections={[
        ["WhatsApp", "El numero debe configurarse con NEXT_PUBLIC_WHATSAPP_NUMBER o desde administracion."],
        ["Correo", "Configurar EMAIL_FROM y RESEND_API_KEY para envios reales."],
      ]}
    />
  );
}
