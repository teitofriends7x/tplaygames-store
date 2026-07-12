import { NextResponse } from "next/server";

import { getCurrentClerkUser } from "@/lib/clerk-auth";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { CartItemInput } from "@/lib/types";

export async function GET() {
  const user = await getCurrentClerkUser();
  if (!user?.id) {
    return NextResponse.json({ items: [] });
  }

  const admin = getSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json({ items: [] });
  }

  const { data: cart } = await admin
    .from("customer_carts")
    .select("id")
    .eq("clerk_user_id", user.id)
    .maybeSingle();

  if (!cart) {
    return NextResponse.json({ items: [] });
  }

  const { data: items } = await admin
    .from("customer_cart_items")
    .select("product_id, variant_id, quantity")
    .eq("cart_id", cart.id);

  const cartItems: CartItemInput[] = (items ?? []).map((item) => ({
    productId: item.product_id,
    variantId: item.variant_id ?? undefined,
    quantity: item.quantity,
  }));

  return NextResponse.json({ items: cartItems });
}
