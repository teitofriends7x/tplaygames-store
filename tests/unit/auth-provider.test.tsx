// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  onAuthStateChange: vi.fn(),
  signInWithPassword: vi.fn(),
  signInWithOAuth: vi.fn(),
  signUp: vi.fn(),
  signOut: vi.fn(),
  resetPasswordForEmail: vi.fn(),
  updateUser: vi.fn(),
  profileResult: { data: null as null | Record<string, unknown> },
}));

const supabaseMock = {
  auth: {
    getUser: mocks.getUser,
    onAuthStateChange: mocks.onAuthStateChange,
    signInWithPassword: mocks.signInWithPassword,
    signInWithOAuth: mocks.signInWithOAuth,
    signUp: mocks.signUp,
    signOut: mocks.signOut,
    resetPasswordForEmail: mocks.resetPasswordForEmail,
    updateUser: mocks.updateUser,
  },
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        maybeSingle: vi.fn(async () => mocks.profileResult),
      })),
    })),
  })),
};

vi.mock("@/lib/supabase/client", () => ({
  getSupabaseBrowserClient: () => supabaseMock,
}));

import { AuthProvider, useAuth } from "@/components/auth-provider";

function AuthHarness() {
  const auth = useAuth();
  return (
    <div>
      <span data-testid="session">
        {auth.loading ? "loading" : auth.user?.email ?? "guest"}
      </span>
      <button onClick={() => void auth.signIn("ada@example.com", "password123")}>login</button>
      <button
        onClick={() =>
          void auth.signUp({
            firstName: "Ada",
            lastName: "Lovelace",
            email: "ada@example.com",
            phone: "1122334455",
            password: "password123",
          })
        }
      >
        register
      </button>
      <button onClick={() => void auth.signInWithGoogle("/checkout")}>google</button>
      <button onClick={() => void auth.resetPassword("ada@example.com")}>recover</button>
      <button onClick={() => void auth.signOut()}>logout</button>
    </div>
  );
}

function renderAuth() {
  return render(
    <AuthProvider>
      <AuthHarness />
    </AuthProvider>,
  );
}

describe("AuthProvider con Supabase", () => {
  afterEach(cleanup);

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.profileResult.data = null;
    mocks.getUser.mockResolvedValue({ data: { user: null } });
    mocks.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    });
    mocks.signInWithPassword.mockResolvedValue({ error: null });
    mocks.signInWithOAuth.mockResolvedValue({ error: null });
    mocks.signUp.mockResolvedValue({ data: { session: null }, error: null });
    mocks.signOut.mockResolvedValue({ error: null });
    mocks.resetPasswordForEmail.mockResolvedValue({ error: null });
    mocks.updateUser.mockResolvedValue({ error: null });
  });

  it("inicia sesión con email y contraseña", async () => {
    renderAuth();
    await waitFor(() => expect(screen.getByTestId("session")).toHaveTextContent("guest"));
    fireEvent.click(screen.getByText("login"));
    await waitFor(() =>
      expect(mocks.signInWithPassword).toHaveBeenCalledWith({
        email: "ada@example.com",
        password: "password123",
      }),
    );
  });

  it("registra nombre, teléfono y callback de confirmación", async () => {
    renderAuth();
    await waitFor(() => expect(screen.getByTestId("session")).toHaveTextContent("guest"));
    fireEvent.click(screen.getByText("register"));
    await waitFor(() => expect(mocks.signUp).toHaveBeenCalledTimes(1));
    expect(mocks.signUp.mock.calls[0]?.[0]).toMatchObject({
      email: "ada@example.com",
      options: {
        data: {
          first_name: "Ada",
          last_name: "Lovelace",
          phone: "1122334455",
        },
      },
    });
  });

  it("inicia OAuth de Google con callback interno", async () => {
    renderAuth();
    await waitFor(() => expect(screen.getByTestId("session")).toHaveTextContent("guest"));
    fireEvent.click(screen.getByText("google"));
    await waitFor(() => expect(mocks.signInWithOAuth).toHaveBeenCalledTimes(1));
    expect(mocks.signInWithOAuth.mock.calls[0]?.[0]).toMatchObject({
      provider: "google",
    });
    expect(mocks.signInWithOAuth.mock.calls[0]?.[0].options.redirectTo).toContain(
      "next=%2Fcheckout",
    );
  });

  it("restaura la sesión y permite recuperación y logout", async () => {
    mocks.getUser.mockResolvedValue({
      data: {
        user: {
          id: "user-1",
          email: "ada@example.com",
          email_confirmed_at: "2026-07-12T00:00:00.000Z",
          user_metadata: { first_name: "Ada" },
        },
      },
    });
    mocks.profileResult.data = { role: "customer", first_name: "Ada" };
    renderAuth();

    await waitFor(() =>
      expect(screen.getByTestId("session")).toHaveTextContent("ada@example.com"),
    );
    fireEvent.click(screen.getByText("recover"));
    fireEvent.click(screen.getByText("logout"));
    await waitFor(() => expect(mocks.resetPasswordForEmail).toHaveBeenCalledTimes(1));
    expect(mocks.resetPasswordForEmail.mock.calls[0]?.[1].redirectTo).toContain(
      "next=%2Factualizar-contrasena",
    );
    expect(mocks.signOut).toHaveBeenCalledTimes(1);
  });
});
