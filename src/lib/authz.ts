import { ROLES } from "@/lib/constants";
import type { Role } from "@/lib/types";

export class AuthorizationError extends Error {
  constructor(message = "No autorizado.") {
    super(message);
    this.name = "AuthorizationError";
  }
}

export function canManageRole(actor: Role, target: Role): boolean {
  if (actor === "admin") {
    return true;
  }

  if (actor === "operator") {
    return target === "customer";
  }

  return false;
}

export function roleCanAccess(role: Role, allowed: Role[]): boolean {
  return allowed.includes(role);
}

export type RequestActor = {
  role: Role;
  userId?: string;
  email?: string;
  source: "demo" | "bearer" | "session" | "anonymous";
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

  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace(/^Bearer\s+/i, "");
  let userId: string | undefined;
  let email: string | undefined;

  if (token) {
    const { getSupabaseAdminClient } = await import("@/lib/supabase/admin");
    const supabase = getSupabaseAdminClient();
    if (!supabase) {
      return { role: "customer", source: "anonymous" };
    }

    const { data: userResult } = await supabase.auth.getUser(token);
    userId = userResult.user?.id;
    email = userResult.user?.email;
  } else {
    const { getSupabaseServerClient } = await import("@/lib/supabase/server");
    const supabase = await getSupabaseServerClient();
    if (!supabase) {
      return { role: "customer", source: "anonymous" };
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    userId = user?.id;
    email = user?.email;
  }

  if (!userId) {
    return { role: "customer", source: "anonymous" };
  }

  const { getSupabaseAdminClient } = await import("@/lib/supabase/admin");
  const admin = getSupabaseAdminClient();
  if (!admin) {
    return {
      role: "customer",
      userId,
      email,
      source: token ? "bearer" : "session",
    };
  }

  const { data } = await admin
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  const role = data?.role as Role | undefined;
  return {
    role: role && ROLES.includes(role) ? role : "customer",
    userId,
    email,
    source: token ? "bearer" : "session",
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
  const { getSupabaseServerClient } = await import("@/lib/supabase/server");
  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    return process.env.NODE_ENV === "production" ? undefined : "admin";
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return undefined;
  }

  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = data?.role as Role | undefined;
  return role && ROLES.includes(role) ? role : "customer";
}
