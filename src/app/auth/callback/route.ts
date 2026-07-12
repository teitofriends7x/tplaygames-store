import { NextResponse } from "next/server";

import { DEFAULT_SITE_URL } from "@/lib/constants";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") || "/mi-cuenta";
  const redirectTo = new URL(next, DEFAULT_SITE_URL);

  if (code) {
    const supabase = await getSupabaseServerClient();
    await supabase?.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(redirectTo);
}
