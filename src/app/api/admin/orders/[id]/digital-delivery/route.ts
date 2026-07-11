import { NextResponse } from "next/server";

import { AuthorizationError, requireRole } from "@/lib/authz";
import { registerDigitalDelivery } from "@/lib/orders";
import { findOrder, replaceOrder } from "@/lib/store";
import { digitalDeliverySchema } from "@/lib/validation";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const role = await requireRole(request, ["admin", "operator"]);
    const { id } = await context.params;
    const order = findOrder(id);
    if (!order) {
      return NextResponse.json(
        { error: "Pedido no encontrado." },
        { status: 404 },
      );
    }

    const payload = await request.json().catch(() => undefined);
    const parsed = digitalDeliverySchema.safeParse(payload);
    if (!parsed.success) {
      return NextResponse.json({ error: "Datos invalidos." }, { status: 400 });
    }

    const updated = registerDigitalDelivery(order, {
      ...parsed.data,
      deliveredBy: role,
    });
    replaceOrder(updated);

    return NextResponse.json({ order: updated });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Error interno.",
      },
      { status: 400 },
    );
  }
}
