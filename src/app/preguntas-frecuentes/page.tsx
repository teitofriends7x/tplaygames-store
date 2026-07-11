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
          "¿Los productos demo son reales?",
          "No. Son datos de desarrollo y deben reemplazarse antes del lanzamiento.",
        ],
      ]}
    />
  );
}
