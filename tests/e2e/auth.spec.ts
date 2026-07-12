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
      name: "Iniciar sesión",
    }),
  ).toBeVisible();
  await expect(page.getByText("Accedé con Google o con tu email")).toBeVisible();
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
      name: "Crear cuenta",
    }),
  ).toBeVisible();
  await expect(page.getByText("Registrate con Google o con tu email")).toBeVisible();
  await expect(page.getByText(/Continuar con Google/i)).toBeVisible();
  await expect(page.getByText(/dirección de correo|email/i).first()).toBeVisible();
  await expect(page.getByRole("link", { name: /iniciar sesión/i })).toHaveAttribute(
    "href",
    /\/login$/,
  );
});

test("Clerk respeta ancho, contraste y controles del sistema visual", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/login");
  await expect(page.getByText("Continuar con Google", { exact: true })).toBeVisible();

  const styles = await page.locator(".cl-rootBox").evaluate((root) => {
    const card = root.querySelector<HTMLElement>(".cl-card");
    const input = root.querySelector<HTMLInputElement>(".cl-formFieldInput");
    const google = root.querySelector<HTMLButtonElement>(
      ".cl-socialButtonsBlockButton",
    );
    if (!card || !input || !google) return null;

    return {
      cardWidth: card.getBoundingClientRect().width,
      inputHeight: input.getBoundingClientRect().height,
      inputBackground: getComputedStyle(input).backgroundColor,
      inputColor: getComputedStyle(input).color,
      googleHeight: google.getBoundingClientRect().height,
      googleBackground: getComputedStyle(google).backgroundColor,
    };
  });

  expect(styles).not.toBeNull();
  expect(styles!.cardWidth).toBeGreaterThanOrEqual(460);
  expect(styles!.cardWidth).toBeLessThanOrEqual(520);
  expect(styles!.inputHeight).toBeGreaterThanOrEqual(48);
  expect(styles!.inputHeight).toBeLessThanOrEqual(52);
  expect(styles!.googleHeight).toBeGreaterThanOrEqual(48);
  expect(styles!.inputBackground).toBe("rgb(11, 13, 17)");
  expect(styles!.inputColor).toBe("rgb(255, 255, 255)");
  expect(styles!.googleBackground).toBe("rgb(23, 26, 33)");
});

test("mobile oculta beneficios y mantiene el formulario sin overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/registro");
  await expect(page.getByRole("heading", { name: "Crear cuenta" })).toBeVisible();
  await expect(page.locator("[data-auth-benefits]")).toBeHidden();

  const layout = await page.evaluate(() => {
    const card = document.querySelector<HTMLElement>(".cl-card");
    return {
      viewportWidth: window.innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      cardWidth: card?.getBoundingClientRect().width ?? 0,
    };
  });

  expect(layout.scrollWidth).toBe(layout.viewportWidth);
  expect(layout.cardWidth).toBeGreaterThanOrEqual(330);
  expect(layout.cardWidth).toBeLessThanOrEqual(343);
});

test("el botón Google recibe foco visible mediante teclado", async ({ page }) => {
  await page.goto("/login");
  const googleButton = page.locator(".cl-socialButtonsBlockButton");
  await expect(googleButton).toBeVisible();

  let reachedGoogle = false;
  for (let step = 0; step < 20; step += 1) {
    await page.keyboard.press("Tab");
    reachedGoogle = await googleButton.evaluate(
      (button) => button === document.activeElement,
    );
    if (reachedGoogle) break;
  }

  expect(reachedGoogle).toBe(true);
  const focusStyle = await googleButton.evaluate((button) => ({
    outlineStyle: getComputedStyle(button).outlineStyle,
    outlineWidth: getComputedStyle(button).outlineWidth,
  }));
  expect(focusStyle.outlineStyle).not.toBe("none");
  expect(focusStyle.outlineWidth).not.toBe("0px");
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
