import { NextResponse } from "next/server";

import { mergeCartItems, mergeFavoriteIds } from "@/lib/account-sync";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { accountSyncSchema } from "@/lib/validation";

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(request: Request) {
  const supabase = await getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase no está configurado." },
      { status: 503 },
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) {
    return NextResponse.json(
      { error: "Necesitás iniciar sesión para sincronizar tu cuenta." },
      { status: 401 },
    );
  }

  const payload = await request.json().catch(() => undefined);
  const parsed = accountSyncSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos de sincronización inválidos." },
      { status: 400 },
    );
  }

  const admin = getSupabaseAdminClient();
  let remoteFavorites: string[] = [];
  if (admin) {
    const { data } = await admin
      .from("favorites")
      .select("product_id")
      .eq("user_id", user.id);
    remoteFavorites = (data ?? []).map((item) => item.product_id);
  }

  const favoriteProductIds = mergeFavoriteIds(
    parsed.data.favoriteProductIds,
    remoteFavorites,
  );

  if (admin) {
    const writableFavorites = favoriteProductIds.filter((id) =>
      uuidPattern.test(id),
    );
    if (writableFavorites.length > 0) {
      await admin.from("favorites").upsert(
        writableFavorites.map((productId) => ({
          user_id: user.id,
          product_id: productId,
        })),
      );
    }
  }

  return NextResponse.json({
    items: mergeCartItems(parsed.data.items),
    favoriteProductIds,
  });
}
