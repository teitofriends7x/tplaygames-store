import type { Role } from "@/lib/types";

export type AuthUser = {
  id: string;
  email: string;
  emailConfirmed: boolean;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role: Role;
};

export type SignUpInput = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password: string;
};

export function getSafeNextPath(
  value: string | null | undefined,
  fallback = "/mi-cuenta",
) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return fallback;
  }

  try {
    const url = new URL(value, "https://tplaygames.local");
    if (url.origin !== "https://tplaygames.local") return fallback;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
}

export function getAuthCallbackUrl(next = "/mi-cuenta") {
  const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const browserOrigin =
    typeof window !== "undefined" ? window.location.origin : undefined;
  const siteUrl = configuredSiteUrl || browserOrigin || "http://localhost:3000";
  const url = new URL("/auth/callback", siteUrl);
  url.searchParams.set("next", getSafeNextPath(next));
  return url.toString();
}

export function getCommercialAuthError(error?: {
  code?: string;
  message?: string;
} | null) {
  const code = error?.code?.toLowerCase() ?? "";
  const message = error?.message?.toLowerCase() ?? "";

  if (code === "invalid_credentials" || message.includes("invalid login")) {
    return "El email o la contraseña no son correctos.";
  }
  if (code === "email_not_confirmed" || message.includes("email not confirmed")) {
    return "Confirmá tu email antes de iniciar sesión.";
  }
  if (
    code === "user_already_exists" ||
    message.includes("already registered") ||
    message.includes("already been registered")
  ) {
    return "Ya existe una cuenta con ese email. Probá iniciar sesión.";
  }
  if (code === "weak_password" || message.includes("password should")) {
    return "Elegí una contraseña más segura de al menos 8 caracteres.";
  }
  if (code.includes("rate_limit") || message.includes("rate limit")) {
    return "Hiciste varios intentos seguidos. Esperá unos minutos y probá de nuevo.";
  }
  if (code === "signup_disabled") {
    return "La creación de cuentas no está disponible en este momento.";
  }
  if (code === "same_password") {
    return "La nueva contraseña debe ser diferente de la anterior.";
  }

  return "No pudimos completar la operación. Revisá los datos e intentá nuevamente.";
}

export function getAuthPageError(code: string | undefined) {
  switch (code) {
    case "oauth":
      return "No pudimos iniciar sesión con Google. Intentá nuevamente.";
    case "confirmation":
      return "El enlace de confirmación no pudo validarse o ya venció.";
    case "profile":
      return "Tu sesión se inició, pero no pudimos preparar tu perfil. Intentá nuevamente.";
    default:
      return "No pudimos validar el enlace. Solicitá uno nuevo e intentá nuevamente.";
  }
}
