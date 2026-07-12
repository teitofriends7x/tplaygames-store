import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentClerkUser } from "@/lib/clerk-auth";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

const cartItemSchema = z.object({
  productId: z.string().uuid(),
  variantId: z.string().uuid().optional(),
  quantity: z.number().int().min(1).max(99),
});

const cartSchema = z.object({
  items: z.array(cartItemSchema),
});

export async function POST(request: Request) {
  const user = await getCurrentClerkUser();
  if (!user?.id) {
    return NextResponse.json(
      { error: "Necesitás iniciar sesión para guardar tu carrito." },
      { status: 401 },
    );
  }

  const payload = await request.json().catch(() => undefined);
  const parsed = cartSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos de carrito inválidos." },
      { status: 400 },
    );
  }

  const admin = getSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json({ ok: true });
  }

  const { error } = await admin.rpc("upsert_cart_items", {
    p_clerk_user_id: user.id,
    p_items: parsed.data.items,
  });

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const user = await getCurrentClerkUser();
  if (!user?.id) {
    return NextResponse.json({ ok: true });
  }

  const admin = getSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json({ ok: true });
  }

  await admin.rpc("clear_cart", { p_clerk_user_id: user.id });

  return NextResponse.json({ ok: true });
}
