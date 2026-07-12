import type { Role } from "@/lib/types";

export function canManageRole(actor: Role, target: Role): boolean {
  if (actor === "admin") return true;
  if (actor === "operator") return target === "customer";
  return false;
}

export function roleCanAccess(role: Role, allowed: Role[]): boolean {
  return allowed.includes(role);
}
