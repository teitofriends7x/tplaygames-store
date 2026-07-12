import type { Metadata } from "next";

import { UpdatePasswordForm } from "./update-password-form";

export const metadata: Metadata = {
  title: "Actualizar contraseña",
  robots: {
    index: false,
    follow: false,
  },
};

export default function UpdatePasswordPage() {
  return <UpdatePasswordForm />;
}
