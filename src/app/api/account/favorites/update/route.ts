import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentClerkUser } from "@/lib/clerk-auth";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

const favoriteSchema = z.object({
  productId: z.string().uuid(),
});

export async function POST(request: Request) {
  const user = await getCurrentClerkUser();
  if (!user?.id) {
    return NextResponse.json(
      { error: "Necesitás iniciar sesión para guardar favoritos." },
      { status: 401 },
    );
  }

  const payload = await request.json().catch(() => undefined);
  const parsed = favoriteSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos de favorito inválidos." },
      { status: 400 },
    );
  }

  const admin = getSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json({ ok: true });
  }

  const { error } = await admin.from("clerk_favorites").upsert({
    clerk_user_id: user.id,
    product_id: parsed.data.productId,
  });

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const user = await getCurrentClerkUser();
  if (!user?.id) {
    return NextResponse.json({ ok: true });
  }

  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("productId");

  if (!productId) {
    return NextResponse.json(
      { error: "productId es requerido." },
      { status: 400 },
    );
  }

  const admin = getSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json({ ok: true });
  }

  await admin
    .from("clerk_favorites")
    .delete()
    .eq("clerk_user_id", user.id)
    .eq("product_id", productId);

  return NextResponse.json({ ok: true });
}
