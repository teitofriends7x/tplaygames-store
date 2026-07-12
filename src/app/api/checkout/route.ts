import { NextResponse } from "next/server";

import { createPaymentPreference } from "@/lib/payments";
import { associateCustomerWithUser } from "@/lib/checkout-customer";
import { getClientKey, checkRateLimit } from "@/lib/rate-limit";
import { createOrder, getStoreState } from "@/lib/store";
import { checkoutSchema } from "@/lib/validation";
import { persistOrderToSupabase } from "@/lib/order-persistence";
import { sendOrderConfirmationEmail } from "@/lib/email";
import { getCurrentClerkUser } from "@/lib/clerk-auth";

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
    const user = await getCurrentClerkUser();
    const customer = associateCustomerWithUser(parsed.data.customer, user);
    const order = createOrder({
      ...parsed.data,
      customer,
      userId: user?.id,
    });

    const persistResult = await persistOrderToSupabase(order, {
      clerkUserId: user?.id,
    });
    const publicOrderNumber =
      persistResult.publicOrderNumber ?? order.orderNumber;

    sendOrderConfirmationEmail(order, publicOrderNumber).catch(() => {});

    if (parsed.data.paymentMethod === "transfer") {
      const settings = getStoreState().settings;
      return NextResponse.json({
        orderId: order.id,
        orderNumber: publicOrderNumber,
        paymentMethod: "transfer",
        totalCents: order.totals.totalCents,
        transferAccount: settings.transferAccount,
        transferExpiresAt: order.transferExpiresAt,
        email: order.customer.email,
      });
    }

    const preference = await createPaymentPreference(order);

    return NextResponse.json({
      orderId: order.id,
      orderNumber: publicOrderNumber,
      paymentUrl: preference.initPoint,
      preferenceId: preference.preferenceId,
      mode: preference.provider,
      paymentMethod: "mercadopago",
      email: order.customer.email,
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
