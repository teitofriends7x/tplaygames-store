import { expect, test } from "@playwright/test";

test("flujo e2e mixto: catalogo, carrito, checkout, pago dev y entrega digital", async ({
  page,
}) => {
  await page.goto("/catalogo");
  await expect(page.getByRole("heading", { name: "Catálogo" })).toBeVisible();

  await page
    .getByRole("link", { name: /^Juego digital de ejemplo \(demo\)$/ })
    .click();
  await page.getByRole("button", { name: "Comprar" }).click();
  await expect
    .poll(async () =>
      page.evaluate(
        () =>
          JSON.parse(localStorage.getItem("tplaygames.cart.v1") || "[]").length,
      ),
    )
    .toBe(1);

  await page.goto("/catalogo/juego-fisico-demo");
  await page.getByRole("button", { name: "Comprar" }).click();
  await expect
    .poll(async () =>
      page.evaluate(
        () =>
          JSON.parse(localStorage.getItem("tplaygames.cart.v1") || "[]").length,
      ),
    )
    .toBe(2);

  await page.goto("/carrito");
  await expect(page.getByRole("heading", { name: "Carrito" })).toBeVisible();
  await page.getByRole("link", { name: "Continuar al checkout" }).click();

  await page.getByLabel("Nombre").fill("Ada");
  await page.getByLabel("Apellido").fill("Lovelace");
  await page.getByLabel("Email").fill("ada@example.com");
  await page.getByLabel("Teléfono").fill("1122334455");
  await page.getByLabel("Dirección").fill("Av. Siempre Viva 123");
  await page.getByLabel("Localidad").fill("CABA");
  await page.getByLabel("Provincia").fill("CABA");
  await page.getByLabel("Código postal").fill("1000");
  await page.getByRole("button", { name: "Crear pedido y pagar" }).click();

  await expect(
    page.getByRole("heading", { name: "Pedido creado" }),
  ).toBeVisible();
  const paymentLink = page.getByRole("link", { name: "Continuar pago" });
  const href = await paymentLink.getAttribute("href");
  expect(href).toContain("/pago/resultado");
  const orderNumber = new URL(href!, "http://localhost:3000").searchParams.get(
    "order",
  );
  expect(orderNumber).toBeTruthy();
  await paymentLink.click();

  const approveResponse = await page.request.post("/api/dev/payments/approve", {
    data: { orderNumber },
  });
  expect(approveResponse.ok()).toBe(true);
  await page.reload();
  await expect(page.getByText("Aprobado", { exact: true })).toBeVisible();

  await page.goto("/admin/pedidos");
  await expect(page.getByRole("heading", { name: "Pedidos" })).toBeVisible();
  await page.getByRole("link", { name: /TPG-/ }).first().click();
  await page.getByText("Entrega digital manual").waitFor();
  await page
    .getByPlaceholder(/Contenido o referencia segura/i)
    .fill("Referencia test");
  await page.getByPlaceholder(/Nota interna/i).fill("Entrega e2e");
  await page.getByRole("button", { name: "Registrar entrega" }).click();
  await expect(page.getByText("Entrega digital registrada.")).toBeVisible();
});
