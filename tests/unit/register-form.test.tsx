// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const authMock = vi.hoisted(() => ({
  configured: true,
  signUp: vi.fn(),
  signInWithGoogle: vi.fn(),
  replace: vi.fn(),
  refresh: vi.fn(),
}));

vi.mock("@/components/auth-provider", () => ({
  useAuth: () => ({
    configured: authMock.configured,
    signUp: authMock.signUp,
    signInWithGoogle: authMock.signInWithGoogle,
  }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: authMock.replace, refresh: authMock.refresh }),
}));

import { RegisterForm } from "@/app/registro/register-form";

function completeValidForm() {
  fireEvent.change(screen.getByLabelText("Nombre"), {
    target: { value: "Ada" },
  });
  fireEvent.change(screen.getByLabelText("Apellido"), {
    target: { value: "Lovelace" },
  });
  fireEvent.change(screen.getByLabelText("Email"), {
    target: { value: "ada@example.com" },
  });
  fireEvent.change(screen.getByLabelText("Contraseña", { exact: true }), {
    target: { value: "password123" },
  });
  fireEvent.change(
    screen.getByLabelText("Repetir contraseña", { exact: true }),
    { target: { value: "password123" } },
  );
  fireEvent.click(
    screen.getByRole("checkbox", {
      name: "Acepto los términos y la política de privacidad.",
    }),
  );
}

describe("RegisterForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authMock.configured = true;
    authMock.signUp.mockResolvedValue({ signedIn: false });
    authMock.signInWithGoogle.mockResolvedValue({});
  });

  afterEach(cleanup);

  it("habilita Google cuando Supabase público está configurado", () => {
    render(<RegisterForm />);
    expect(
      screen.getByRole("button", { name: "Registrarme con Google" }),
    ).toBeEnabled();
  });

  it("habilita Crear cuenta solo con formulario válido", () => {
    render(<RegisterForm />);
    const submit = screen.getByRole("button", { name: "Crear cuenta" });
    expect(submit).toBeDisabled();

    completeValidForm();
    expect(submit).toBeEnabled();
  });

  it("mantiene Crear cuenta deshabilitado si las contraseñas no coinciden", () => {
    render(<RegisterForm />);
    completeValidForm();
    fireEvent.change(
      screen.getByLabelText("Repetir contraseña", { exact: true }),
      { target: { value: "otra-password" } },
    );

    expect(screen.getByRole("button", { name: "Crear cuenta" })).toBeDisabled();
  });

  it("envía metadata sin borrar los campos", async () => {
    render(<RegisterForm />);
    completeValidForm();
    fireEvent.click(screen.getByRole("button", { name: "Crear cuenta" }));

    await waitFor(() => expect(authMock.signUp).toHaveBeenCalledTimes(1));
    expect(authMock.signUp).toHaveBeenCalledWith(
      {
        firstName: "Ada",
        lastName: "Lovelace",
        email: "ada@example.com",
        phone: undefined,
        password: "password123",
      },
      "/mi-cuenta",
    );
  });

  it("deshabilita acciones y muestra aviso compacto sin configuración", () => {
    authMock.configured = false;
    render(<RegisterForm />);
    completeValidForm();

    expect(
      screen.getByText(
        "En este momento no podemos crear cuentas. Intentá nuevamente más tarde.",
      ),
    ).toBeVisible();
    expect(
      screen.getByRole("button", { name: "Registrarme con Google" }),
    ).toBeDisabled();
    expect(screen.getByRole("button", { name: "Crear cuenta" })).toBeDisabled();
  });
});
