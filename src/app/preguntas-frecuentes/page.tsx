import { InfoPage } from "@/components/info-page";

export default function FAQPage() {
  return (
    <InfoPage
      title="Preguntas frecuentes"
      sections={[
        [
          "¿Qué vende T.PlayGames?",
          "Exclusivamente consolas, controles y juegos.",
        ],
        [
          "¿Hay juegos digitales?",
          "Sí. La primera versión usa entrega manual protegida desde administración.",
        ],
        [
          "¿Los precios publicados son definitivos?",
          "En desarrollo son valores de prueba para validar la experiencia. En producción se administran desde el panel.",
        ],
      ]}
    />
  );
}
