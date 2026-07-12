export type PublicSupabaseConfig = {
  configured: boolean;
  url?: string;
  anonKey?: string;
  issues: Array<
    | "NEXT_PUBLIC_SUPABASE_URL_missing"
    | "NEXT_PUBLIC_SUPABASE_URL_invalid"
    | "NEXT_PUBLIC_SUPABASE_ANON_KEY_missing"
    | "NEXT_PUBLIC_SUPABASE_ANON_KEY_invalid"
  >;
};

function isValidHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export function validatePublicSupabaseConfig(input: {
  url?: string;
  anonKey?: string;
}): PublicSupabaseConfig {
  const url = input.url?.trim();
  const anonKey = input.anonKey?.trim();
  const issues: PublicSupabaseConfig["issues"] = [];

  if (!url) issues.push("NEXT_PUBLIC_SUPABASE_URL_missing");
  else if (!isValidHttpUrl(url)) issues.push("NEXT_PUBLIC_SUPABASE_URL_invalid");

  if (!anonKey) issues.push("NEXT_PUBLIC_SUPABASE_ANON_KEY_missing");
  else if (anonKey.length < 20) {
    issues.push("NEXT_PUBLIC_SUPABASE_ANON_KEY_invalid");
  }

  const validUrl = !issues.some((issue) =>
    issue.startsWith("NEXT_PUBLIC_SUPABASE_URL"),
  );
  const validAnonKey = !issues.some((issue) =>
    issue.startsWith("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  );

  return {
    configured: issues.length === 0,
    url: validUrl ? url : undefined,
    anonKey: validAnonKey ? anonKey : undefined,
    issues,
  };
}

export function getPublicSupabaseConfig() {
  return validatePublicSupabaseConfig({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });
}
