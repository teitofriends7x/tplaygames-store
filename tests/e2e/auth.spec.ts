import { expect, test } from "@playwright/test";

test("el header dirige a un login integrado y comercial", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator('a[aria-label="Ingresar"]:visible')).toHaveAttribute(
    "href",
    "/login",
  );

  await page.goto("/login");
  await expect(
    page.getByRole("heading", {
      name: "Todo tu historial, listo para la próxima partida.",
    }),
  ).toBeVisible();
  await expect(page.getByText(/Continuar con Google/i)).toBeVisible();
  await expect(page.getByText(/dirección de correo|email/i).first()).toBeVisible();
  await expect(page.locator("body")).not.toContainText(/Supabase|variables de entorno/i);
});

test("registro ofrece Google y email dentro del diseño de la tienda", async ({
  page,
}) => {
  await page.goto("/registro");
  await expect(
    page.getByRole("heading", {
      name: "Creá tu cuenta y tené cada compra a mano.",
    }),
  ).toBeVisible();
  await expect(page.getByText(/Continuar con Google/i)).toBeVisible();
  await expect(page.getByText(/dirección de correo|email/i).first()).toBeVisible();
  await expect(page.getByRole("link", { name: /iniciar sesión/i })).toHaveAttribute(
    "href",
    /\/login$/,
  );
});

test("las rutas privadas redirigen al login sin sesión", async ({ page }) => {
  await page.goto("/mi-cuenta");
  await expect(page).toHaveURL(/\/login/);

  await page.goto("/mis-pedidos");
  await expect(page).toHaveURL(/\/login/);

  await page.goto("/admin");
  await expect(page).toHaveURL(/\/login/);
});

test("las rutas antiguas de recuperación usan el flujo de Clerk", async ({
  page,
}) => {
  await page.goto("/recuperar-contrasena");
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.locator("body")).not.toContainText(/Supabase/i);
});

test("checkout conserva la compra invitada y ofrece acceso a cuenta", async ({
  page,
}) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      "tplaygames.cart.v1",
      JSON.stringify([
        { productId: "prod-game-god-of-war-ragnarok", quantity: 1 },
      ]),
    );
  });
  await page.goto("/checkout");
  await expect(page.getByRole("link", { name: "Iniciar sesión" })).toHaveAttribute(
    "href",
    "/login?next=%2Fcheckout",
  );
  await expect(page.getByRole("link", { name: "Crear cuenta" })).toHaveAttribute(
    "href",
    "/registro?next=%2Fcheckout",
  );
  await expect(page.getByRole("link", { name: "Continuar como invitado" })).toBeVisible();
  await expect(page.getByLabel("Email")).toBeEditable();
});
