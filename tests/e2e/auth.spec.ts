import { expect, test } from "@playwright/test";

test("el acceso principal abre un login comercial completo", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator('a[aria-label="Ingresar"]:visible')).toHaveAttribute(
    "href",
    "/login",
  );

  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "Iniciar sesión" })).toBeVisible();
  await expect(page.getByLabel("Email")).toBeVisible();
  await expect(page.getByLabel("Contraseña", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Continuar con Google" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Olvidé mi contraseña" })).toHaveAttribute(
    "href",
    "/recuperar-contrasena",
  );
  await expect(page.getByText(/requiere configuración de Supabase/i)).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Consultá un pedido" })).toHaveAttribute(
    "href",
    "/seguimiento",
  );
});

test("registro y recuperación muestran todos los campos esperados", async ({ page }) => {
  await page.goto("/registro");
  await expect(page.getByLabel("Nombre")).toBeVisible();
  await expect(page.getByLabel("Apellido")).toBeVisible();
  await expect(page.getByLabel("Email")).toBeVisible();
  await expect(page.getByLabel("Teléfono (opcional)")).toBeVisible();
  await expect(page.getByLabel("Contraseña", { exact: true })).toBeVisible();
  await expect(page.getByLabel("Repetir contraseña", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Registrarme con Google" })).toBeVisible();

  await page.goto("/recuperar-contrasena");
  await expect(page.getByRole("heading", { name: "Recuperar contraseña" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Enviar enlace" })).toBeVisible();

  await page.goto("/recuperar-password");
  await expect(page).toHaveURL(/\/recuperar-contrasena$/);
});

test("seguimiento queda separado del acceso a la cuenta", async ({ page }) => {
  await page.goto("/seguimiento");
  await expect(
    page.getByRole("link", {
      name: "Iniciá sesión para ver todos tus pedidos.",
    }),
  ).toHaveAttribute("href", "/login");
  await expect(page.getByLabel("Número de pedido")).toBeVisible();
  await expect(page.getByLabel("Email")).toBeVisible();
});

test("checkout ofrece cuenta e invitado sin imponer registro", async ({ page }) => {
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

test("callback no permite redirects externos", async ({ page }) => {
  await page.goto("/auth/callback?next=https://evil.example/phishing");
  await expect(page).toHaveURL(/\/login\?error=confirmation$/);
  await expect(page.getByRole("heading", { name: "Iniciar sesión" })).toBeVisible();
});
