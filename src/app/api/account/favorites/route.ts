import { NextResponse } from "next/server";

import { getCurrentClerkUser } from "@/lib/clerk-auth";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const user = await getCurrentClerkUser();
  if (!user?.id) {
    return NextResponse.json({ productIds: [] });
  }

  const admin = getSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json({ productIds: [] });
  }

  const { data } = await admin
    .from("clerk_favorites")
    .select("product_id")
    .eq("clerk_user_id", user.id);

  const productIds = (data ?? []).map((item) => item.product_id);

  return NextResponse.json({ productIds });
}
