import { NextResponse } from "next/server";

import { AuthorizationError, requireActorRole } from "@/lib/authz";
import { sendOrderConfirmationEmail, sendOrderStatusEmail } from "@/lib/email";
import { getOrderDetailsForAdmin } from "@/lib/order-persistence";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await requireActorRole(_request, ["admin", "operator"]);
    const { id } = await context.params;
    const order = await getOrderDetailsForAdmin(id);
    if (!order) {
      return NextResponse.json(
        { error: "Pedido no encontrado." },
        { status: 404 },
      );
    }

    const result =
      order.status === "pending_payment"
        ? await sendOrderConfirmationEmail(order, order.orderNumber)
        : await sendOrderStatusEmail(order, order.status);

    return NextResponse.json({ result });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    return NextResponse.json({ error: "Error interno." }, { status: 500 });
  }
}
