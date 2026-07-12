import { NextResponse } from "next/server";

import { getSafeNextPath, getSafeSiteOrigin } from "@/lib/auth";
import { logAuthConfigurationIssues } from "@/lib/supabase/config-server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = getSafeNextPath(requestUrl.searchParams.get("next"));
  const configuredOrigin = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const origin = getSafeSiteOrigin(
    process.env.NODE_ENV === "production" ? configuredOrigin : undefined,
    requestUrl.origin,
  );

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=confirmation", origin));
  }

  const supabase = await getSupabaseServerClient();
  if (!supabase) {
    logAuthConfigurationIssues("oauth-callback");
    return NextResponse.redirect(new URL("/login?error=confirmation", origin));
  }

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error || !data.user) {
    return NextResponse.redirect(new URL("/login?error=confirmation", origin));
  }

  const metadata = data.user.user_metadata ?? {};
  const profilePayload: Record<string, string> = {
    id: data.user.id,
    updated_at: new Date().toISOString(),
  };
  const firstName = metadata.first_name ?? metadata.given_name;
  const lastName = metadata.last_name ?? metadata.family_name;
  if (typeof firstName === "string" && firstName.trim()) {
    profilePayload.first_name = firstName.trim();
  }
  if (typeof lastName === "string" && lastName.trim()) {
    profilePayload.last_name = lastName.trim();
  }
  if (typeof metadata.phone === "string" && metadata.phone.trim()) {
    profilePayload.phone = metadata.phone.trim();
  }
  if (typeof metadata.avatar_url === "string" && metadata.avatar_url.trim()) {
    profilePayload.avatar_url = metadata.avatar_url.trim();
  }
  const { error: profileError } = await supabase
    .from("profiles")
    .upsert(profilePayload, { onConflict: "id" });

  if (profileError) {
    return NextResponse.redirect(new URL("/login?error=profile", origin));
  }

  return NextResponse.redirect(new URL(next, origin));
}
