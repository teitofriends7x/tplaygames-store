import { describe, expect, it } from "vitest";

import { readClerkRole } from "@/lib/clerk-role";
import { clerkAppearance } from "@/lib/clerk-appearance";
import { clerkLocalization } from "@/lib/clerk-localization";
import { associateCustomerWithUser } from "@/lib/checkout-customer";

describe("roles de Clerk", () => {
  it("acepta solo los roles del dominio", () => {
    expect(readClerkRole("admin")).toBe("admin");
    expect(readClerkRole("operator")).toBe("operator");
    expect(readClerkRole("customer")).toBe("customer");
  });

  it("usa customer ante metadata ausente o manipulada", () => {
    expect(readClerkRole(undefined)).toBe("customer");
    expect(readClerkRole("owner")).toBe("customer");
  });
});

describe("contenido de autenticación", () => {
  it("usa textos argentinos para login, registro y recuperación", () => {
    expect(clerkLocalization.signIn?.start?.title).toBe("Iniciar sesión");
    expect(clerkLocalization.signIn?.start?.subtitle).toBe(
      "Accedé con Google o con tu email",
    );
    expect(clerkLocalization.signUp?.start?.title).toBe("Crear cuenta");
    expect(clerkLocalization.formFieldAction__forgotPassword).toBe(
      "¿Olvidaste tu contraseña?",
    );
    expect(clerkLocalization.formFieldInputPlaceholder__signUpPassword).toBe(
      "Creá una contraseña",
    );
  });

  it("define contraste y feedback visible para campos y errores", () => {
    expect(clerkAppearance.variables.colorInput).toBe("#0B0D11");
    expect(clerkAppearance.variables.colorInputForeground).toBe("#FFFFFF");
    expect(clerkAppearance.elements.formFieldErrorText.color).toBe("#FCA5A5");
    expect(clerkAppearance.elements.formFieldInput.minHeight).toBe("50px");
  });
});

describe("checkout autenticado", () => {
  const customer = {
    firstName: "Ada",
    lastName: "Lovelace",
    email: "checkout@example.com",
    phone: "1122334455",
  };

  it("asocia el id de Clerk y fuerza el email verificado de la cuenta", () => {
    expect(
      associateCustomerWithUser(customer, {
        id: "user_clerk_123",
        email: "cuenta@example.com",
      }),
    ).toEqual({
      ...customer,
      email: "cuenta@example.com",
      userId: "user_clerk_123",
    });
  });

  it("mantiene una compra invitada sin user_id", () => {
    expect(associateCustomerWithUser(customer, null)).toEqual(customer);
  });
});
