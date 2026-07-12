import type { Metadata } from "next";

import { getAuthPageError, getSafeNextPath } from "@/lib/auth";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Iniciar sesión",
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const params = await searchParams;
  return (
    <LoginForm
      next={getSafeNextPath(params.next)}
      pageError={params.error ? getAuthPageError(params.error) : undefined}
    />
  );
}
