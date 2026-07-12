"use client";

import { createBrowserClient } from "@supabase/ssr";

import { getPublicSupabaseConfig } from "@/lib/supabase/config";

export function getSupabaseBrowserClient() {
  const config = getPublicSupabaseConfig();

  if (!config.configured || !config.url || !config.anonKey) return null;

  return createBrowserClient(config.url, config.anonKey);
}
