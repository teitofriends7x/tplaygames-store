import { ROLES } from "@/lib/constants";
import type { Role } from "@/lib/types";

export function readClerkRole(value: unknown): Role {
  return typeof value === "string" && ROLES.includes(value as Role)
    ? (value as Role)
    : "customer";
}
