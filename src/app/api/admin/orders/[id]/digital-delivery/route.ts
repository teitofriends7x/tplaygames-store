import { NextResponse } from "next/server";

import { AuthorizationError, requireActorRole } from "@/lib/authz";
import { sendDigitalDeliveryEmail } from "@/lib/email";
import { registerStoredDigitalDelivery } from "@/lib/order-persistence";
import { digitalDeliverySchema } from "@/lib/validation";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const actor = await requireActorRole(request, ["admin", "operator"]);
    const { id } = await context.params;
    const payload = await request.json().catch(() => undefined);
    const parsed = digitalDeliverySchema.safeParse(payload);
    if (!parsed.success) {
      return NextResponse.json({ error: "Datos invalidos." }, { status: 400 });
    }

    const result = await registerStoredDigitalDelivery({
      orderId: id,
      ...parsed.data,
      actorId: actor.userId,
      actorRole: actor.role,
    });
    if (!result.order) {
      return NextResponse.json(
        { error: result.error ?? "Pedido no encontrado." },
        { status: 400 },
      );
    }

    sendDigitalDeliveryEmail(result.order).catch(() => {});

    return NextResponse.json({ order: result.order });
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
