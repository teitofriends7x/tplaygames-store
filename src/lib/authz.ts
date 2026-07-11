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

export async function getRoleFromRequest(request: Request): Promise<Role> {
  const demoRole = request.headers.get("x-demo-role");
  if (
    process.env.NODE_ENV !== "production" &&
    demoRole &&
    ROLES.includes(demoRole as Role)
  ) {
    return demoRole as Role;
  }

  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace(/^Bearer\s+/i, "");

  if (!token) {
    return "customer";
  }

  const { getSupabaseAdminClient } = await import("@/lib/supabase/admin");
  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return "customer";
  }

  const { data: userResult } = await supabase.auth.getUser(token);
  const userId = userResult.user?.id;
  if (!userId) {
    return "customer";
  }

  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  const role = data?.role as Role | undefined;
  return role && ROLES.includes(role) ? role : "customer";
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
