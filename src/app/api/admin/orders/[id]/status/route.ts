import { NextResponse } from "next/server";

import { AuthorizationError, requireRole } from "@/lib/authz";
import { findOrder, replaceOrder } from "@/lib/store";
import { transitionOrderStatus } from "@/lib/orders";
import { orderStatusSchema } from "@/lib/validation";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const role = await requireRole(request, ["admin", "operator"]);
    const { id } = await context.params;
    const order = findOrder(id);
    if (!order) {
      return NextResponse.json({ error: "Pedido no encontrado." }, { status: 404 });
    }

    const payload = await request.json().catch(() => undefined);
    const parsed = orderStatusSchema.safeParse(payload);
    if (!parsed.success) {
      return NextResponse.json({ error: "Datos invalidos." }, { status: 400 });
    }

    const updated = transitionOrderStatus(
      order,
      parsed.data.status,
      { role },
      parsed.data.internalComment,
    );
    replaceOrder(updated);

    return NextResponse.json({ order: updated });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    return NextResponse.json({ error: "Error interno." }, { status: 500 });
  }
}
