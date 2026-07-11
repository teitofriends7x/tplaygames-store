import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const brandDir = join(root, "public", "brand");
const categoryDir = join(brandDir, "categories");

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

writeFileSync(join(brandDir, "hero-tplaygames.svg"), heroArt());
writeFileSync(join(categoryDir, "consolas.svg"), categoryArt("consolas"));
writeFileSync(join(categoryDir, "controles.svg"), categoryArt("controles"));
writeFileSync(join(categoryDir, "juegos.svg"), categoryArt("juegos"));
