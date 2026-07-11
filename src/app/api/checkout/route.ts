import { NextResponse } from "next/server";

import { createPaymentPreference } from "@/lib/payments";
import { getClientKey, checkRateLimit } from "@/lib/rate-limit";
import { createOrder, getStoreState } from "@/lib/store";
import { checkoutSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const limit = checkRateLimit(`checkout:${getClientKey(request)}`, 12, 60_000);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Demasiados intentos de checkout." },
      { status: 429 },
    );
  }

  const payload = await request.json().catch(() => undefined);
  const parsed = checkoutSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos de checkout invalidos.", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const order = createOrder(parsed.data);

    if (parsed.data.paymentMethod === "transfer") {
      const settings = getStoreState().settings;
      return NextResponse.json({
        orderId: order.id,
        orderNumber: order.orderNumber,
        paymentMethod: "transfer",
        totalCents: order.totals.totalCents,
        transferAccount: settings.transferAccount,
        transferExpiresAt: order.transferExpiresAt,
      });
    }

    const preference = await createPaymentPreference(order);

    return NextResponse.json({
      orderId: order.id,
      orderNumber: order.orderNumber,
      paymentUrl: preference.initPoint,
      preferenceId: preference.preferenceId,
      mode: preference.provider,
      paymentMethod: "mercadopago",
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "No se pudo crear el pedido.",
      },
      { status: 400 },
    );
  }
}
