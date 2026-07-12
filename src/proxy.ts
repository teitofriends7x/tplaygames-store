import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const protectedPrefixes = ["/mi-cuenta", "/mis-pedidos", "/admin"];

export default clerkMiddleware(async (auth, request) => {
  const isProtected = protectedPrefixes.some(
    (prefix) =>
      request.nextUrl.pathname === prefix ||
      request.nextUrl.pathname.startsWith(`${prefix}/`),
  );
  const isDevelopmentDemo =
    process.env.NODE_ENV !== "production" &&
    ["admin", "operator"].includes(request.headers.get("x-demo-role") ?? "");

  if (!isProtected || isDevelopmentDemo) return;

  const hasConfiguredKeys = Boolean(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
      process.env.CLERK_SECRET_KEY,
  );
  if (!hasConfiguredKeys) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  await auth.protect();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|avif|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/(.*)",
  ],
};
