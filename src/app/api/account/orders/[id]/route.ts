import { NextResponse } from "next/server";

import { getOrderForCustomer } from "@/lib/order-persistence";
import { getCurrentClerkUser } from "@/lib/clerk-auth";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentClerkUser();
  if (!user?.id || !user.email) {
    return NextResponse.json(
      { error: "Necesitás iniciar sesión para ver este pedido." },
      { status: 401 },
    );
  }

  const { id } = await context.params;
  const order = await getOrderForCustomer({
    idOrNumber: id,
    clerkUserId: user.id,
    email: user.email,
  });

  if (!order) {
    return NextResponse.json(
      { error: "Pedido no encontrado." },
      { status: 404 },
    );
  }

  return NextResponse.json({ order });
}
