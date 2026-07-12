import "server-only";

import { getPublicSupabaseConfig } from "@/lib/supabase/config";

type ServerAuthConfiguration = {
  publicAuthConfigured: boolean;
  serviceRoleConfigured: boolean;
  siteUrlConfigured: boolean;
  issues: string[];
};

let lastLoggedSignature = "";

function isValidSiteUrl(value: string | undefined) {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.hostname === "localhost";
  } catch {
    return false;
  }
}

export function getServerAuthConfiguration(): ServerAuthConfiguration {
  const publicConfig = getPublicSupabaseConfig();
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const issues: string[] = [...publicConfig.issues];

  if (!serviceRole) issues.push("SUPABASE_SERVICE_ROLE_KEY_missing");
  else if (serviceRole.length < 20) {
    issues.push("SUPABASE_SERVICE_ROLE_KEY_invalid");
  }

  if (!siteUrl) issues.push("NEXT_PUBLIC_SITE_URL_missing");
  else if (!isValidSiteUrl(siteUrl)) {
    issues.push("NEXT_PUBLIC_SITE_URL_invalid");
  }

  return {
    publicAuthConfigured: publicConfig.configured,
    serviceRoleConfigured: !!serviceRole && serviceRole.length >= 20,
    siteUrlConfigured: isValidSiteUrl(siteUrl),
    issues,
  };
}

export function logAuthConfigurationIssues(context: string) {
  const status = getServerAuthConfiguration();
  if (!status.issues.length) return status;

  const signature = status.issues.join(",");
  if (signature !== lastLoggedSignature) {
    console.error(
      `[auth-config:${context}] Invalid or missing environment variables: ${signature}`,
    );
    lastLoggedSignature = signature;
  }
  return status;
}
