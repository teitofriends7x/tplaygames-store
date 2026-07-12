import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      error:
        "Los roles se administran de forma segura desde Clerk Dashboard.",
    },
    { status: 410 },
  );
}
