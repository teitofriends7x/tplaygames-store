import "server-only";

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

import { getPublicSupabaseConfig } from "@/lib/supabase/config";
import { logAuthConfigurationIssues } from "@/lib/supabase/config-server";

export async function getSupabaseServerClient() {
  const config = getPublicSupabaseConfig();

  if (!config.configured || !config.url || !config.anonKey) {
    logAuthConfigurationIssues("server-client");
    return null;
  }

  const cookieStore = await cookies();

  return createServerClient(config.url, config.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Server Components cannot set cookies; route handlers can.
        }
      },
    },
  });
}
