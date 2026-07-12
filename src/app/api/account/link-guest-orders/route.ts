import { NextResponse } from "next/server";

import {
  countGuestOrdersForEmail,
  linkGuestOrdersToUser,
} from "@/lib/order-persistence";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { linkGuestOrdersSchema } from "@/lib/validation";

async function getVerifiedUser(): Promise<{
  id: string;
  email: string;
} | null> {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id || !user.email || !user.email_confirmed_at) return null;

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

  const result = await linkGuestOrdersToUser(user.id, user.email);
  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ linked: result.linked });
}
