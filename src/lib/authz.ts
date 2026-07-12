import { ROLES } from "@/lib/constants";
import { getCurrentClerkUser } from "@/lib/clerk-auth";
import { roleCanAccess } from "@/lib/role-access";
import type { Role } from "@/lib/types";

export class AuthorizationError extends Error {
  constructor(message = "No autorizado.") {
    super(message);
    this.name = "AuthorizationError";
  }
}

export type RequestActor = {
  role: Role;
  userId?: string;
  email?: string;
  source: "demo" | "session" | "anonymous";
};

export async function getActorFromRequest(
  request: Request,
): Promise<RequestActor> {
  const demoRole = request.headers.get("x-demo-role");
  if (
    process.env.NODE_ENV !== "production" &&
    demoRole &&
    ROLES.includes(demoRole as Role)
  ) {
    return { role: demoRole as Role, source: "demo" };
  }

  const user = await getCurrentClerkUser();
  if (!user) {
    return { role: "customer", source: "anonymous" };
  }

  return {
    role: user.role,
    userId: user.id,
    email: user.email,
    source: "session",
  };
}

export async function getRoleFromRequest(request: Request): Promise<Role> {
  return (await getActorFromRequest(request)).role;
}

export async function requireRole(
  request: Request,
  allowed: Role[],
): Promise<Role> {
  const role = await getRoleFromRequest(request);
  if (!roleCanAccess(role, allowed)) {
    throw new AuthorizationError();
  }

  return role;
}

export async function requireActorRole(
  request: Request,
  allowed: Role[],
): Promise<RequestActor> {
  const actor = await getActorFromRequest(request);
  if (!roleCanAccess(actor.role, allowed)) {
    throw new AuthorizationError();
  }

  return actor;
}

export async function getRoleFromServerSession(): Promise<Role | undefined> {
  if (process.env.NODE_ENV !== "production") {
    const { headers } = await import("next/headers");
    const demoRole = (await headers()).get("x-demo-role");
    if (demoRole && ROLES.includes(demoRole as Role)) {
      return demoRole as Role;
    }
  }

  return (await getCurrentClerkUser())?.role;
}
