import { SignUp } from "@clerk/nextjs";
import type { Metadata } from "next";

import { AuthShell } from "@/components/auth-shell";
import { clerkAppearance } from "@/lib/clerk-appearance";

export const metadata: Metadata = {
  title: "Crear cuenta",
  robots: { index: false, follow: false },
};

export default function RegisterPage() {
  return (
    <AuthShell mode="register">
      <SignUp
        appearance={clerkAppearance}
        routing="path"
        path="/registro"
        signInUrl="/login"
        fallbackRedirectUrl="/mi-cuenta"
      />
    </AuthShell>
  );
}
