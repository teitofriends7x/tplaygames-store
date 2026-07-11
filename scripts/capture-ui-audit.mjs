import fs from "node:fs";
import path from "node:path";

import { chromium } from "playwright";

const baseUrl = process.env.UI_AUDIT_BASE_URL || "http://localhost:3000";
const outDir = process.argv[2] || "artifacts/ui-audit/after";

const routes = [
  ["home", "/"],
  ["consolas", "/consolas"],
  ["controles", "/controles"],
  ["juegos", "/juegos"],
  ["ofertas", "/ofertas"],
  ["busqueda-resultados", "/buscar?q=juego"],
  ["busqueda-sin-resultados", "/buscar?q=zzzzzz"],
  ["producto", "/catalogo/juego-digital-demo"],
  ["carrito-vacio", "/carrito", "empty-cart"],
  ["carrito-mixto", "/carrito", "mixed-cart"],
  ["checkout-fisico", "/checkout", "physical-cart"],
  ["checkout-digital", "/checkout", "digital-cart"],
  ["checkout-mixto", "/checkout", "mixed-cart"],
  ["login", "/login"],
  ["registro", "/registro"],
  ["mi-cuenta", "/mi-cuenta"],
  ["mis-pedidos", "/mis-pedidos"],
  ["admin", "/admin"],
  ["admin-pedidos", "/admin/pedidos"],
  ["admin-productos", "/admin/productos"],
  ["admin-inventario", "/admin/inventario"],
  ["admin-cupones", "/admin/cupones"],
  ["admin-configuracion", "/admin/configuracion"],
  ["404", "/ruta-inexistente-tplaygames"],
];

const carts = {
  "empty-cart": [],
  "digital-cart": [
    {
      productId: "prod-game-digital-demo",
      variantId: "var-game-digital-pc",
      quantity: 1,
    },
  ],
  "physical-cart": [
    {
      productId: "prod-console-playstation-demo",
      variantId: "var-ps-demo-disc",
      quantity: 1,
    },
  ],
  "mixed-cart": [
    {
      productId: "prod-game-digital-demo",
      variantId: "var-game-digital-pc",
      quantity: 1,
    },
    {
      productId: "prod-game-physical-demo",
      quantity: 1,
    },
  ],
};

const viewports = [
  ["desktop", { width: 1440, height: 900 }],
  ["mobile", { width: 390, height: 844 }],
];

fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const manifest = {
  baseUrl,
  capturedAt: new Date().toISOString(),
  screenshots: [],
};

for (const [viewportName, viewport] of viewports) {
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();

  for (const [name, route, state] of routes) {
    await page.goto(baseUrl, { waitUntil: "domcontentloaded" });
    await page.evaluate(
      ({ cart, favorites }) => {
        localStorage.setItem("tplaygames.cart.v1", JSON.stringify(cart));
        localStorage.setItem(
          "tplaygames.favorites.v1",
          JSON.stringify(favorites),
        );
      },
      {
        cart: carts[state] || [],
        favorites: ["prod-game-digital-demo"],
      },
    );
    await page.goto(`${baseUrl}${route}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(450);

    const file = `${viewportName}-${name}.png`;
    await page.screenshot({
      path: path.join(outDir, file),
      fullPage: true,
      animations: "disabled",
    });
    manifest.screenshots.push({ viewport: viewportName, route, file });
  }

  await context.close();
}

await browser.close();
fs.writeFileSync(
  path.join(outDir, "manifest.json"),
  `${JSON.stringify(manifest, null, 2)}\n`,
);
