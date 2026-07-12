import { NextResponse } from "next/server";

import { getOrderForCustomer } from "@/lib/order-persistence";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const supabase = await getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "El acceso a cuentas no está disponible en este momento." },
      { status: 503 },
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id || !user.email) {
    return NextResponse.json(
      { error: "Necesitás iniciar sesión para ver este pedido." },
      { status: 401 },
    );
  }

  const { id } = await context.params;
  const order = await getOrderForCustomer({
    idOrNumber: id,
    userId: user.id,
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
