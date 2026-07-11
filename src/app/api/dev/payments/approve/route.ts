import { NextResponse } from "next/server";

import { processVerifiedPaymentEvent } from "@/lib/payments";
import { findOrder } from "@/lib/store";

export async function POST(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "No disponible." }, { status: 404 });
  }

  const payload = (await request.json().catch(() => ({}))) as {
    orderNumber?: string;
    orderId?: string;
  };
  const order = payload.orderId
    ? findOrder(payload.orderId)
    : payload.orderNumber
      ? findOrder(payload.orderNumber)
      : undefined;

  if (!order) {
    return NextResponse.json(
      { error: "Pedido no encontrado." },
      { status: 404 },
    );
  }

  const result = processVerifiedPaymentEvent({
    eventId: `dev-approved-${order.id}`,
    orderId: order.id,
    status: "approved",
    amountCents: order.totals.totalCents,
    provider: "development",
    providerPaymentId: `dev-pay-${order.id}`,
  });

  return NextResponse.json({
    processed: result.processed,
    order: result.order ?? order,
  });
}
