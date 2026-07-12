import { NextResponse } from "next/server";

import {
  countGuestOrdersForEmail,
  linkGuestOrdersToClerkUser,
} from "@/lib/order-persistence";
import { getCurrentClerkUser } from "@/lib/clerk-auth";
import { linkGuestOrdersSchema } from "@/lib/validation";

async function getVerifiedUser(): Promise<{
  id: string;
  email: string;
} | null> {
  const user = await getCurrentClerkUser();
  if (!user?.id || !user.email || !user.emailVerified) return null;

  return { id: user.id, email: user.email };
}

export async function GET() {
  const user = await getVerifiedUser();
  if (!user) {
    return NextResponse.json(
      {
        error:
          "Necesitás iniciar sesión y tener el email verificado para buscar compras anteriores.",
      },
      { status: 401 },
    );
  }

  const count = await countGuestOrdersForEmail(user.email);
  return NextResponse.json({ count });
}

export async function POST(request: Request) {
  const user = await getVerifiedUser();
  if (!user) {
    return NextResponse.json(
      {
        error:
          "Necesitás iniciar sesión y tener el email verificado para vincular pedidos.",
      },
      { status: 401 },
    );
  }

  const payload = await request.json().catch(() => undefined);
  const parsed = linkGuestOrdersSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Confirmá la vinculación para continuar." },
      { status: 400 },
    );
  }

  const result = await linkGuestOrdersToClerkUser(user.id, user.email);
  if (result.error) {
    console.error("guest_order_link_failed", result.error);
    return NextResponse.json(
      { error: "No pudimos vincular los pedidos. Intentá nuevamente." },
      { status: 500 },
    );
  }

  return NextResponse.json({ linked: result.linked });
}
