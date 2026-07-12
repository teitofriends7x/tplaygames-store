import { describe, expect, it } from "vitest";

import {
  getAuthPageError,
  getCommercialAuthError,
  getSafeNextPath,
} from "@/lib/auth";
import { associateCustomerWithUser } from "@/lib/checkout-customer";

describe("autenticacion", () => {
  it("acepta destinos internos y conserva query string", () => {
    expect(getSafeNextPath("/checkout?from=login")).toBe(
      "/checkout?from=login",
    );
  });

  it("rechaza redirects absolutos y protocol-relative", () => {
    expect(getSafeNextPath("https://evil.example/phishing")).toBe(
      "/mi-cuenta",
    );
    expect(getSafeNextPath("//evil.example/phishing")).toBe("/mi-cuenta");
  });

  it("traduce credenciales invalidas a un mensaje comercial", () => {
    expect(
      getCommercialAuthError({
        code: "invalid_credentials",
        message: "Invalid login credentials",
      }),
    ).toBe("El email o la contraseña no son correctos.");
  });

  it("no expone mensajes internos desconocidos", () => {
    expect(
      getCommercialAuthError({ message: "database connection stack trace" }),
    ).not.toContain("database");
    expect(getAuthPageError("oauth")).toMatch(/Google/);
  });
});

describe("checkout autenticado", () => {
  const customer = {
    firstName: "Ada",
    lastName: "Lovelace",
    email: "checkout@example.com",
    phone: "1122334455",
  };

  it("asocia user_id y fuerza el email verificado de la cuenta", () => {
    expect(
      associateCustomerWithUser(customer, {
        id: "user-123",
        email: "cuenta@example.com",
      }),
    ).toEqual({
      ...customer,
      email: "cuenta@example.com",
      userId: "user-123",
    });
  });

  it("mantiene una compra invitada sin user_id", () => {
    expect(associateCustomerWithUser(customer, null)).toEqual(customer);
  });
});
