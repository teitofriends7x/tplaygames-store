import type { CustomerSnapshot } from "@/lib/types";

export function associateCustomerWithUser(
  customer: CustomerSnapshot,
  user?: { id: string; email?: string | null } | null,
): CustomerSnapshot {
  if (!user) return customer;

  return {
    ...customer,
    email: user.email ?? customer.email,
    userId: user.id,
  };
}
