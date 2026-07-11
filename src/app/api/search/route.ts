import { NextResponse } from "next/server";

import { getClientKey, checkRateLimit } from "@/lib/rate-limit";
import { searchSuggestions } from "@/lib/catalog";
import { listProducts } from "@/lib/store";
import { searchSchema } from "@/lib/validation";

export async function GET(request: Request) {
  const limit = checkRateLimit(`search:${getClientKey(request)}`, 60, 60_000);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Demasiadas busquedas.", retryAfter: limit.retryAfterSeconds },
      { status: 429 },
    );
  }

  const url = new URL(request.url);
  const parsed = searchSchema.safeParse({ q: url.searchParams.get("q") ?? "" });
  if (!parsed.success) {
    return NextResponse.json({ suggestions: [] });
  }

  return NextResponse.json({
    suggestions: searchSuggestions(parsed.data.q, listProducts()),
  });
}
