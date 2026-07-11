import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const brandDir = join(root, "public", "brand");
const productDir = join(brandDir, "products");
const categoryDir = join(brandDir, "categories");

mkdirSync(productDir, { recursive: true });
mkdirSync(categoryDir, { recursive: true });

const palette = {
  bg: "#070707",
  surface: "#111318",
  surface2: "#1B1D23",
  line: "#2A2E39",
  blue: "#1D6DFF",
  blue2: "#4D8CFF",
  green: "#22C55E",
  red: "#EF4444",
  amber: "#F59E0B",
  white: "#FFFFFF",
  muted: "#A7ACB8",
};

function svg(content, { label = "T.PlayGames asset", w = 1200, h = 900 } = {}) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${label}">
  <defs>
    <radialGradient id="blueGlow" cx="50%" cy="34%" r="68%">
      <stop offset="0%" stop-color="${palette.blue}" stop-opacity=".42"/>
      <stop offset="48%" stop-color="${palette.blue}" stop-opacity=".10"/>
      <stop offset="100%" stop-color="${palette.bg}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="glass" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#242833"/>
      <stop offset="55%" stop-color="${palette.surface2}"/>
      <stop offset="100%" stop-color="#0C0E13"/>
    </linearGradient>
    <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="34" stdDeviation="28" flood-color="#000000" flood-opacity=".45"/>
    </filter>
  </defs>
  <rect width="${w}" height="${h}" fill="${palette.bg}"/>
  <rect width="${w}" height="${h}" fill="url(#blueGlow)"/>
  <g opacity=".42">
    <path d="M0 720 C230 612 340 832 560 704 C760 588 916 642 1200 520" fill="none" stroke="${palette.blue}" stroke-width="2"/>
    <path d="M0 224 C220 148 356 286 530 204 C720 116 914 184 1200 78" fill="none" stroke="${palette.line}" stroke-width="2"/>
    <path d="M110 0 V900 M330 0 V900 M550 0 V900 M770 0 V900 M990 0 V900" stroke="${palette.line}" stroke-width="1" opacity=".24"/>
  </g>
  ${content}
</svg>`;
}

function consoleArt(accent, label, variant = "front") {
  const side = variant === "angle" ? "rotate(-7 620 446)" : "";
  const details =
    variant === "detail"
      ? `<circle cx="746" cy="278" r="18" fill="${accent}"/><rect x="712" y="328" width="92" height="9" rx="5" fill="${palette.muted}" opacity=".55"/><rect x="712" y="354" width="118" height="9" rx="5" fill="${palette.muted}" opacity=".38"/>`
      : `<circle cx="750" cy="286" r="14" fill="${accent}"/><rect x="724" y="340" width="76" height="8" rx="4" fill="${palette.muted}" opacity=".5"/>`;

  return svg(
    `<g filter="url(#softShadow)" transform="${side}">
      <rect x="220" y="170" width="620" height="506" rx="54" fill="url(#glass)" stroke="${palette.line}" stroke-width="3"/>
      <rect x="336" y="232" width="290" height="354" rx="38" fill="#F5F7FB"/>
      <rect x="646" y="242" width="86" height="330" rx="28" fill="#050608"/>
      ${details}
      <rect x="280" y="632" width="520" height="54" rx="18" fill="#050608" opacity=".5"/>
      <text x="540" y="667" fill="${palette.white}" font-family="Inter,Arial" font-size="28" font-weight="800" text-anchor="middle">${label}</text>
    </g>`,
    { label },
  );
}

function towerArt(accent, label, variant = "front") {
  const extra =
    variant === "detail"
      ? `<path d="M510 244 l118 118 M628 244 l-118 118" stroke="${accent}" stroke-width="28" stroke-linecap="round"/>`
      : `<circle cx="570" cy="282" r="58" fill="${accent}"/><path d="M532 244 l76 76 M608 244 l-76 76" stroke="#050608" stroke-width="20" stroke-linecap="round"/>`;

  return svg(
    `<g filter="url(#softShadow)">
      <rect x="390" y="130" width="360" height="640" rx="48" fill="url(#glass)" stroke="${palette.line}" stroke-width="3"/>
      <rect x="478" y="210" width="184" height="424" rx="28" fill="#050608"/>
      ${extra}
      <rect x="432" y="668" width="276" height="54" rx="18" fill="#050608" opacity=".55"/>
      <text x="570" y="703" fill="${palette.white}" font-family="Inter,Arial" font-size="28" font-weight="800" text-anchor="middle">${label}</text>
    </g>`,
    { label },
  );
}

function handheldArt(left, right, label, variant = "front") {
  const tilt = variant === "angle" ? "rotate(4 600 440)" : "";
  return svg(
    `<g filter="url(#softShadow)" transform="${tilt}">
      <rect x="178" y="244" width="844" height="412" rx="64" fill="url(#glass)" stroke="${palette.line}" stroke-width="3"/>
      <rect x="306" y="292" width="590" height="292" rx="26" fill="#050608"/>
      <rect x="198" y="272" width="118" height="360" rx="48" fill="${left}"/>
      <rect x="884" y="272" width="118" height="360" rx="48" fill="${right}"/>
      <circle cx="254" cy="390" r="24" fill="#050608" opacity=".72"/>
      <circle cx="946" cy="420" r="18" fill="#050608" opacity=".72"/>
      <circle cx="946" cy="360" r="18" fill="#050608" opacity=".72"/>
      <text x="600" y="714" fill="${palette.white}" font-family="Inter,Arial" font-size="32" font-weight="800" text-anchor="middle">${label}</text>
    </g>`,
    { label },
  );
}

function controllerArt(accent, label, variant = "front") {
  const extra =
    variant === "detail"
      ? `<rect x="306" y="318" width="106" height="18" rx="9" fill="#050608"/><rect x="350" y="274" width="18" height="106" rx="9" fill="#050608"/>`
      : `<circle cx="386" cy="344" r="34" fill="#050608"/><circle cx="744" cy="340" r="15" fill="${palette.blue2}"/><circle cx="792" cy="386" r="15" fill="${palette.green}"/><circle cx="698" cy="386" r="15" fill="${palette.red}"/>`;

  return svg(
    `<g filter="url(#softShadow)">
      <path d="M300 342c74-128 526-128 600 0 72 126 116 292 48 336-58 38-134-32-192-112H444c-58 80-134 150-192 112-68-44-24-210 48-336z" fill="#F5F7FB"/>
      <path d="M300 342c74-128 526-128 600 0" fill="none" stroke="${accent}" stroke-width="18" stroke-linecap="round" opacity=".72"/>
      ${extra}
      <rect x="480" y="406" width="240" height="26" rx="13" fill="#050608" opacity=".18"/>
      <text x="600" y="742" fill="${palette.white}" font-family="Inter,Arial" font-size="32" font-weight="800" text-anchor="middle">${label}</text>
    </g>`,
    { label },
  );
}

function gameArt(accent, label, variant = "case") {
  const digital = variant === "digital";
  const preorder = variant === "preorder";
  return svg(
    `<g filter="url(#softShadow)">
      <rect x="${digital ? 250 : 386}" y="${digital ? 184 : 116}" width="${digital ? 700 : 430}" height="${digital ? 430 : 660}" rx="${digital ? 46 : 34}" fill="url(#glass)" stroke="${accent}" stroke-width="14"/>
      ${
        preorder
          ? `<circle cx="600" cy="392" r="112" fill="#050608"/><path d="M600 304v104l78 56" stroke="${accent}" stroke-width="28" stroke-linecap="round" stroke-linejoin="round"/>`
          : digital
            ? `<rect x="350" y="274" width="500" height="250" rx="34" fill="#050608"/><path d="M600 316v146M540 408l60 60 60-60" fill="none" stroke="${palette.green}" stroke-width="34" stroke-linecap="round" stroke-linejoin="round"/>`
            : `<rect x="440" y="178" width="322" height="262" rx="24" fill="#050608"/><path d="M472 386l90-112 68 80 50-56 82 88" fill="none" stroke="${accent}" stroke-width="22" stroke-linecap="round" stroke-linejoin="round"/>`
      }
      <text x="600" y="${digital ? 642 : 604}" fill="${palette.white}" font-family="Inter,Arial" font-size="42" font-weight="900" text-anchor="middle">${label}</text>
      <text x="600" y="${digital ? 690 : 656}" fill="${palette.muted}" font-family="Inter,Arial" font-size="24" font-weight="700" text-anchor="middle">T.PLAYGAMES DEMO</text>
    </g>`,
    { label },
  );
}

function categoryArt(kind) {
  if (kind === "consolas") {
    return svg(
      `<rect x="98" y="120" width="1004" height="660" rx="60" fill="url(#glass)" stroke="${palette.line}" stroke-width="3"/>
      <g filter="url(#softShadow)">
        <rect x="258" y="242" width="330" height="324" rx="36" fill="#F5F7FB"/>
        <rect x="618" y="258" width="104" height="292" rx="28" fill="#050608"/>
        <circle cx="682" cy="314" r="15" fill="${palette.blue}"/>
      </g>
      <text x="120" y="690" fill="${palette.white}" font-family="Inter,Arial" font-size="58" font-weight="900">Consolas</text>`,
      { label: "Categoria Consolas" },
    );
  }
  if (kind === "controles") {
    return svg(
      `<rect x="98" y="120" width="1004" height="660" rx="60" fill="url(#glass)" stroke="${palette.line}" stroke-width="3"/>
      <path d="M302 376c72-128 524-128 596 0 68 120 112 272 45 316-56 36-130-28-188-104H445c-58 76-132 140-188 104-67-44-23-196 45-316z" fill="#F5F7FB" filter="url(#softShadow)"/>
      <circle cx="394" cy="404" r="34" fill="#050608"/>
      <circle cx="748" cy="408" r="18" fill="${palette.blue}"/>
      <circle cx="794" cy="452" r="18" fill="${palette.green}"/>
      <circle cx="704" cy="452" r="18" fill="${palette.red}"/>
      <text x="120" y="690" fill="${palette.white}" font-family="Inter,Arial" font-size="58" font-weight="900">Controles</text>`,
      { label: "Categoria Controles" },
    );
  }
  return svg(
    `<rect x="98" y="120" width="1004" height="660" rx="60" fill="url(#glass)" stroke="${palette.line}" stroke-width="3"/>
    <g filter="url(#softShadow)">
      <rect x="408" y="186" width="384" height="520" rx="36" fill="#10131A" stroke="${palette.blue}" stroke-width="14"/>
      <rect x="456" y="252" width="288" height="214" rx="24" fill="#050608"/>
      <path d="M494 408l76-92 60 70 42-48 72 70" fill="none" stroke="${palette.blue2}" stroke-width="20" stroke-linecap="round" stroke-linejoin="round"/>
    </g>
    <text x="120" y="690" fill="${palette.white}" font-family="Inter,Arial" font-size="58" font-weight="900">Juegos</text>`,
    { label: "Categoria Juegos" },
  );
}

function heroArt() {
  return svg(
    `<g filter="url(#softShadow)">
      <rect x="116" y="112" width="968" height="676" rx="72" fill="url(#glass)" stroke="${palette.line}" stroke-width="3"/>
      <rect x="190" y="210" width="352" height="368" rx="44" fill="#F5F7FB"/>
      <rect x="574" y="230" width="118" height="328" rx="34" fill="#050608"/>
      <circle cx="642" cy="296" r="18" fill="${palette.blue}"/>
      <path d="M742 404c44-82 232-82 276 0 38 70 62 158 24 184-32 22-76-18-108-64H826c-32 46-76 86-108 64-38-26-14-114 24-184z" fill="#F5F7FB"/>
      <circle cx="806" cy="444" r="14" fill="#050608"/>
      <circle cx="956" cy="444" r="12" fill="${palette.blue}"/>
      <circle cx="986" cy="474" r="12" fill="${palette.green}"/>
      <circle cx="926" cy="474" r="12" fill="${palette.red}"/>
      <rect x="196" y="632" width="780" height="64" rx="22" fill="#050608" opacity=".55"/>
      <text x="586" y="675" fill="${palette.white}" font-family="Inter,Arial" font-size="32" font-weight="900" text-anchor="middle">Consolas, controles y juegos</text>
    </g>`,
    { label: "Hero T.PlayGames" },
  );
}

const products = [
  [
    "consola-playstation-demo",
    () => consoleArt(palette.blue, "PLAYSTATION DEMO"),
    () => consoleArt(palette.blue2, "VISTA LATERAL", "angle"),
    () => consoleArt(palette.blue, "DETALLE DEMO", "detail"),
  ],
  [
    "consola-xbox-demo",
    () => towerArt(palette.green, "XBOX DEMO"),
    () => towerArt(palette.green, "VISTA LATERAL", "angle"),
    () => towerArt(palette.green, "DETALLE DEMO", "detail"),
  ],
  [
    "consola-nintendo-demo",
    () => handheldArt(palette.red, palette.blue, "NINTENDO DEMO"),
    () => handheldArt(palette.red, palette.blue, "MODO PORTATIL", "angle"),
    () => handheldArt(palette.red, palette.blue, "DETALLE DEMO", "detail"),
  ],
  [
    "control-playstation-demo",
    () => controllerArt(palette.blue, "CONTROL PS DEMO"),
    () => controllerArt(palette.blue2, "VISTA ANGULAR", "angle"),
    () => controllerArt(palette.blue, "DETALLE DEMO", "detail"),
  ],
  [
    "control-xbox-demo",
    () => controllerArt(palette.green, "CONTROL XBOX DEMO"),
    () => controllerArt(palette.green, "VISTA ANGULAR", "angle"),
    () => controllerArt(palette.green, "DETALLE DEMO", "detail"),
  ],
  [
    "control-nintendo-demo",
    () => controllerArt(palette.red, "CONTROL NINTENDO DEMO"),
    () => controllerArt(palette.blue, "VISTA ANGULAR", "angle"),
    () => controllerArt(palette.red, "DETALLE DEMO", "detail"),
  ],
  [
    "juego-fisico-demo",
    () => gameArt(palette.blue, "JUEGO FISICO"),
    () => gameArt(palette.blue2, "ARTE DEMO", "case"),
    () => gameArt(palette.green, "CAJA DEMO", "case"),
  ],
  [
    "juego-digital-demo",
    () => gameArt(palette.green, "JUEGO DIGITAL", "digital"),
    () => gameArt(palette.blue, "DESCARGA DEMO", "digital"),
    () => gameArt(palette.green, "ENTREGA MANUAL", "digital"),
  ],
  [
    "juego-preventa-demo",
    () => gameArt(palette.amber, "PREVENTA", "preorder"),
    () => gameArt(palette.amber, "RESERVA DEMO", "preorder"),
    () => gameArt(palette.blue, "PROXIMAMENTE", "preorder"),
  ],
];

for (const [slug, main, alt1, alt2] of products) {
  writeFileSync(join(productDir, `${slug}-main.svg`), main());
  writeFileSync(join(productDir, `${slug}-angle.svg`), alt1());
  writeFileSync(join(productDir, `${slug}-detail.svg`), alt2());
}

writeFileSync(join(brandDir, "hero-tplaygames.svg"), heroArt());
writeFileSync(join(categoryDir, "consolas.svg"), categoryArt("consolas"));
writeFileSync(join(categoryDir, "controles.svg"), categoryArt("controles"));
writeFileSync(join(categoryDir, "juegos.svg"), categoryArt("juegos"));
