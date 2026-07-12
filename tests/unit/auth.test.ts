import { describe, expect, it } from "vitest";

import { readClerkRole } from "@/lib/clerk-role";
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
