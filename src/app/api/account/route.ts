import { NextResponse } from "next/server";

import {
  getAccountProfile,
  updateAccountProfile,
} from "@/lib/order-persistence";
import { getCurrentClerkUser } from "@/lib/clerk-auth";
import { accountProfileSchema } from "@/lib/validation";

export async function GET() {
  const user = await getCurrentClerkUser();
  if (!user?.id || !user.email) {
    return NextResponse.json(
      { error: "Necesitás iniciar sesión para ver tu cuenta." },
      { status: 401 },
    );
  }

  const profile = await getAccountProfile({
    clerkUserId: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
  });

  return NextResponse.json({ profile });
}

export async function PATCH(request: Request) {
  const user = await getCurrentClerkUser();
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
    console.error("account_profile_update_failed", result.error);
    return NextResponse.json(
      { error: "No pudimos guardar el perfil. Intentá nuevamente." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    profile: await getAccountProfile({
      clerkUserId: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
    }),
  });
}
