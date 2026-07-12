import { NextResponse } from "next/server";

import { listAccountOrders } from "@/lib/order-persistence";
import { getCurrentClerkUser } from "@/lib/clerk-auth";

export async function GET() {
  const user = await getCurrentClerkUser();

  if (!user?.id || !user.email) {
    return NextResponse.json(
      { error: "Necesitás iniciar sesión para ver tus pedidos." },
      { status: 401 },
    );
  }

  const orders = await listAccountOrders({
    clerkUserId: user.id,
  });

  return NextResponse.json({ orders });
}
