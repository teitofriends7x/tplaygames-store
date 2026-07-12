import { NextResponse } from "next/server";

import { listAccountOrders } from "@/lib/order-persistence";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
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
      { error: "Necesitás iniciar sesión para ver tus pedidos." },
      { status: 401 },
    );
  }

  const orders = await listAccountOrders({
    userId: user.id,
  });

  return NextResponse.json({ orders });
}
