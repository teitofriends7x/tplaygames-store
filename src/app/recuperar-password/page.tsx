import type { Metadata } from "next";

import { RecoverPasswordForm } from "./recover-password-form";

export const metadata: Metadata = {
  title: "Recuperar contraseña",
  robots: {
    index: false,
    follow: false,
  },
};

export default function RecoverPasswordPage() {
  return <RecoverPasswordForm />;
}
