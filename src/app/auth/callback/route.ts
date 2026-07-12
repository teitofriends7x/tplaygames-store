import { NextResponse } from "next/server";

import { getSafeNextPath } from "@/lib/auth";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = getSafeNextPath(requestUrl.searchParams.get("next"));
  const configuredOrigin = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const origin =
    process.env.NODE_ENV === "production" && configuredOrigin
      ? new URL(configuredOrigin).origin
      : requestUrl.origin;

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=confirmation", origin));
  }

  const supabase = await getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.redirect(new URL("/login?error=confirmation", origin));
  }

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error || !data.user) {
    return NextResponse.redirect(new URL("/login?error=confirmation", origin));
  }

  const metadata = data.user.user_metadata ?? {};
  const { error: profileError } = await supabase.from("profiles").upsert(
    {
      id: data.user.id,
      first_name: metadata.first_name ?? metadata.given_name ?? null,
      last_name: metadata.last_name ?? metadata.family_name ?? null,
      phone: metadata.phone ?? null,
      avatar_url: metadata.avatar_url ?? null,
    },
    { onConflict: "id", ignoreDuplicates: true },
  );

  if (profileError) {
    return NextResponse.redirect(new URL("/login?error=profile", origin));
  }

  return NextResponse.redirect(new URL(next, origin));
}
