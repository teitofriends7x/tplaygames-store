import { NextResponse } from "next/server";

import {
  getAccountProfile,
  updateAccountProfile,
} from "@/lib/order-persistence";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { accountProfileSchema } from "@/lib/validation";

async function getCurrentUser() {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user?.id || !user.email) {
    return NextResponse.json(
      { error: "Necesitás iniciar sesión para ver tu cuenta." },
      { status: 401 },
    );
  }

  const profile = await getAccountProfile({
    userId: user.id,
    email: user.email,
  });

  return NextResponse.json({ profile });
}

export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user?.id || !user.email) {
    return NextResponse.json(
      { error: "Necesitás iniciar sesión para actualizar tu cuenta." },
      { status: 401 },
    );
  }

  const payload = await request.json().catch(() => undefined);
  const parsed = accountProfileSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Revisá los datos del perfil.", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const result = await updateAccountProfile({
    id: user.id,
    email: user.email,
    ...parsed.data,
  });

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error ?? "No se pudo guardar el perfil." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    profile: await getAccountProfile({ userId: user.id, email: user.email }),
  });
}
