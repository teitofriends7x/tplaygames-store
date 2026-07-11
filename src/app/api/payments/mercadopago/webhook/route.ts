import { NextResponse } from "next/server";

import {
  processVerifiedPaymentEvent,
  verifyMercadoPagoPayment,
} from "@/lib/payments";

export async function POST(request: Request) {
  const url = new URL(request.url);
  const body = await request.json().catch(() => ({}));
  const eventId =
    request.headers.get("x-request-id") ||
    body.id ||
    url.searchParams.get("id") ||
    crypto.randomUUID();
  const type = body.type || body.topic || url.searchParams.get("topic");
  const paymentId =
    body.data?.id || body.resource || url.searchParams.get("data.id");

  if (type !== "payment" || !paymentId) {
    return NextResponse.json({ received: true, ignored: true });
  }

  try {
    const verified = await verifyMercadoPagoPayment(String(paymentId));
    if (!verified.orderId) {
      return NextResponse.json({ received: true, ignored: true });
    }

    const result = processVerifiedPaymentEvent({
      eventId: String(eventId),
      orderId: verified.orderId,
      status: verified.status,
      amountCents: verified.amountCents,
      provider: "mercadopago",
      providerPaymentId: verified.providerPaymentId,
    });

    return NextResponse.json({
      received: true,
      processed: result.processed,
    });
  } catch {
    return NextResponse.json(
      { error: "No se pudo verificar el evento." },
      { status: 400 },
    );
  }
}
