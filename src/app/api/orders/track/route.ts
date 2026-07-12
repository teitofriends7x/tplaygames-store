import { NextResponse } from "next/server";
import { z } from "zod";

import { getOrderForCustomer } from "@/lib/order-persistence";
import { checkRateLimit, getClientKey } from "@/lib/rate-limit";

const trackSchema = z.object({
  orderNumber: z.string().trim().min(3).max(60),
  email: z.string().trim().email().max(160),
});

export async function POST(request: Request) {
  const limit = checkRateLimit(`track:${getClientKey(request)}`, 10, 60_000);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Demasiados intentos. Esperá un minuto." },
      { status: 429 },
    );
  }

  const payload = await request.json().catch(() => undefined);
  const parsed = trackSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos invalidos.", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { orderNumber, email } = parsed.data;

  const order = await getOrderForCustomer({
    idOrNumber: orderNumber,
    email,
  });
  if (order) {
    return NextResponse.json({ order });
  }

  return NextResponse.json(
    { error: "No encontramos un pedido con ese número y email." },
    { status: 404 },
  );
}
