import { SignIn } from "@clerk/nextjs";
import type { Metadata } from "next";

import { AuthShell } from "@/components/auth-shell";
import { clerkAppearance } from "@/lib/clerk-appearance";

export const metadata: Metadata = {
  title: "Iniciar sesión",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <AuthShell mode="login">
      <SignIn
        appearance={clerkAppearance}
        routing="path"
        path="/login"
        signUpUrl="/registro"
        fallbackRedirectUrl="/mi-cuenta"
      />
    </AuthShell>
  );
}
