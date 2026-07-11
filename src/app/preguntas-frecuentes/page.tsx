import { InfoPage } from "@/components/info-page";

export default function FAQPage() {
  return (
    <InfoPage
      title="Preguntas frecuentes"
      sections={[
        ["¿Que vende T.PlayGames?", "Exclusivamente consolas, controles y juegos."],
        ["¿Hay juegos digitales?", "Si. La primera version usa entrega manual protegida desde administracion."],
        ["¿Los productos demo son reales?", "No. Son datos de desarrollo y deben eliminarse antes del lanzamiento."],
      ]}
    />
  );
}
