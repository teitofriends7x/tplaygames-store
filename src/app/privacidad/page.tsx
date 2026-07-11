import { InfoPage } from "@/components/info-page";

export default function PrivacyPage() {
  return (
    <InfoPage
      title="Privacidad"
      legal
      sections={[
        ["Datos personales", "Plantilla pendiente. La app evita enviar direcciones completas, secretos o datos de entrega digital a analitica."],
        ["Cookies", "El consentimiento se incorporara solo si se activan herramientas que lo requieran."],
      ]}
    />
  );
}
