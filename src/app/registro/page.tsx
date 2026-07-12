import type { Metadata } from "next";

import { getSafeNextPath } from "@/lib/auth";
import { RegisterForm } from "./register-form";

export const metadata: Metadata = {
  title: "Registro",
  robots: { index: false, follow: false },
};

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; email?: string }>;
}) {
  const params = await searchParams;
  return (
    <RegisterForm
      next={getSafeNextPath(params.next)}
      initialEmail={params.email?.trim() ?? ""}
    />
  );
}
