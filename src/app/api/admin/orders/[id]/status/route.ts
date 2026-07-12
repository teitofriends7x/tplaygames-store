import { NextResponse } from "next/server";

import { AuthorizationError, requireActorRole } from "@/lib/authz";
import { sendOrderStatusEmail } from "@/lib/email";
import { updateStoredOrderStatus } from "@/lib/order-persistence";
import { orderStatusSchema } from "@/lib/validation";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const actor = await requireActorRole(request, ["admin", "operator"]);
    const { id } = await context.params;
    const payload = await request.json().catch(() => undefined);
    const parsed = orderStatusSchema.safeParse(payload);
    if (!parsed.success) {
      return NextResponse.json({ error: "Datos invalidos." }, { status: 400 });
    }

    const result = await updateStoredOrderStatus({
      orderId: id,
      status: parsed.data.status,
      internalComment: parsed.data.internalComment,
      actorId: actor.userId,
      actorRole: actor.role,
    });
    if (!result.order) {
      return NextResponse.json(
        { error: result.error ?? "Pedido no encontrado." },
        { status: 404 },
      );
    }

    sendOrderStatusEmail(result.order, parsed.data.status).catch(() => {});

    return NextResponse.json({ order: result.order });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    return NextResponse.json({ error: "Error interno." }, { status: 500 });
  }
}
