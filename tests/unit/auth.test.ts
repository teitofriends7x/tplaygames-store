import { describe, expect, it } from "vitest";

import {
  getAuthPageError,
  getCommercialAuthError,
  getSafeNextPath,
  getSafeSiteOrigin,
} from "@/lib/auth";
import { associateCustomerWithUser } from "@/lib/checkout-customer";
import { validatePublicSupabaseConfig } from "@/lib/supabase/config";

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

  it("usa un origen seguro si NEXT_PUBLIC_SITE_URL es inválida", () => {
    expect(getSafeSiteOrigin("javascript:alert(1)", "https://store.test")).toBe(
      "https://store.test",
    );
  });

  it("valida las dos variables públicas requeridas", () => {
    expect(validatePublicSupabaseConfig({})).toMatchObject({
      configured: false,
      issues: [
        "NEXT_PUBLIC_SUPABASE_URL_missing",
        "NEXT_PUBLIC_SUPABASE_ANON_KEY_missing",
      ],
    });
    expect(
      validatePublicSupabaseConfig({
        url: "https://project.supabase.co",
        anonKey: "sb_publishable_12345678901234567890",
      }).configured,
    ).toBe(true);
  });

  it("traduce errores de red sin borrar datos del formulario", () => {
    expect(getCommercialAuthError({ message: "Failed to fetch" })).toMatch(
      /conectarnos/i,
    );
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
