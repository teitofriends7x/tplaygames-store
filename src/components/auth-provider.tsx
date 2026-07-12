"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { User } from "@supabase/supabase-js";

import {
  getAuthCallbackUrl,
  getCommercialAuthError,
  type AuthUser,
  type SignUpInput,
} from "@/lib/auth";
import {
  readCart,
  readFavorites,
  writeCart,
  writeFavorites,
} from "@/lib/cart-client";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Role } from "@/lib/types";

type AuthState = {
  user: AuthUser | null;
  loading: boolean;
  configured: boolean;
};

type AuthResult = { error?: string; signedIn?: boolean };

type AuthContextValue = AuthState & {
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signInWithGoogle: (next?: string) => Promise<AuthResult>;
  signUp: (input: SignUpInput, next?: string) => Promise<AuthResult>;
  signOut: () => Promise<AuthResult>;
  resetPassword: (email: string) => Promise<AuthResult>;
  updatePassword: (password: string) => Promise<AuthResult>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function mapUser(user: User, role: Role = "customer"): AuthUser {
  const metadata = user.user_metadata ?? {};
  const fullName = String(metadata.full_name ?? metadata.name ?? "").trim();
  const [fallbackFirstName, ...fallbackLastName] = fullName.split(/\s+/);

  return {
    id: user.id,
    email: user.email ?? "",
    emailConfirmed: !!user.email_confirmed_at,
    firstName: String(
      metadata.first_name ?? metadata.given_name ?? fallbackFirstName ?? "",
    ).trim() || undefined,
    lastName: String(
      metadata.last_name ?? metadata.family_name ?? fallbackLastName.join(" "),
    ).trim() || undefined,
    phone: String(metadata.phone ?? "").trim() || undefined,
    role,
  };
}

async function syncLocalAccountState() {
  const response = await fetch("/api/account/sync", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      items: readCart(),
      favoriteProductIds: readFavorites(),
    }),
  });

  if (!response.ok) return;

  const data = (await response.json()) as {
    items?: ReturnType<typeof readCart>;
    favoriteProductIds?: string[];
  };
  if (data.items) writeCart(data.items);
  if (data.favoriteProductIds) writeFavorites(data.favoriteProductIds);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const configured = !!supabase;
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(configured);

  const loadUser = useCallback(
    async (authUser: User | null) => {
      if (!authUser || !supabase) {
        setUser(null);
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role, first_name, last_name, phone")
        .eq("id", authUser.id)
        .maybeSingle();
      const mapped = mapUser(authUser, (profile?.role as Role) ?? "customer");
      setUser({
        ...mapped,
        firstName: profile?.first_name ?? mapped.firstName,
        lastName: profile?.last_name ?? mapped.lastName,
        phone: profile?.phone ?? mapped.phone,
      });
      setLoading(false);
    },
    [supabase],
  );

  useEffect(() => {
    if (!supabase) return;

    let mounted = true;
    supabase.auth.getUser().then(({ data }) => {
      if (mounted) void loadUser(data.user);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      const authUser = session?.user ?? null;
      if (!authUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      setUser(mapUser(authUser));
      setLoading(false);
      window.setTimeout(() => void loadUser(authUser), 0);
      if (event === "SIGNED_IN") {
        window.setTimeout(() => void syncLocalAccountState(), 0);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [loadUser, supabase]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      if (!supabase) {
        return { error: "El acceso a cuentas no está disponible en este momento." };
      }
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return error ? { error: getCommercialAuthError(error) } : {};
    },
    [supabase],
  );

  const signInWithGoogle = useCallback(
    async (next = "/mi-cuenta") => {
      if (!supabase) {
        return { error: "El acceso con Google no está disponible en este momento." };
      }
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: getAuthCallbackUrl(next) },
      });
      return error ? { error: getCommercialAuthError(error) } : {};
    },
    [supabase],
  );

  const signUp = useCallback(
    async (input: SignUpInput, next = "/mi-cuenta") => {
      if (!supabase) {
        return { error: "La creación de cuentas no está disponible en este momento." };
      }
      const { data, error } = await supabase.auth.signUp({
        email: input.email,
        password: input.password,
        options: {
          emailRedirectTo: getAuthCallbackUrl(next),
          data: {
            first_name: input.firstName,
            last_name: input.lastName,
            phone: input.phone || null,
          },
        },
      });
      return error
        ? { error: getCommercialAuthError(error) }
        : { signedIn: !!data.session };
    },
    [supabase],
  );

  const signOut = useCallback(async () => {
    if (!supabase) return {};
    const { error } = await supabase.auth.signOut();
    return error ? { error: getCommercialAuthError(error) } : {};
  }, [supabase]);

  const resetPassword = useCallback(
    async (email: string) => {
      if (!supabase) {
        return { error: "La recuperación no está disponible en este momento." };
      }
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: getAuthCallbackUrl("/actualizar-contrasena"),
      });
      return error ? { error: getCommercialAuthError(error) } : {};
    },
    [supabase],
  );

  const updatePassword = useCallback(
    async (password: string) => {
      if (!supabase) {
        return { error: "No pudimos actualizar la contraseña en este momento." };
      }
      const { error } = await supabase.auth.updateUser({ password });
      return error ? { error: getCommercialAuthError(error) } : {};
    },
    [supabase],
  );

  const value = useMemo(
    () => ({
      user,
      loading,
      configured,
      signIn,
      signInWithGoogle,
      signUp,
      signOut,
      resetPassword,
      updatePassword,
    }),
    [
      user,
      loading,
      configured,
      signIn,
      signInWithGoogle,
      signUp,
      signOut,
      resetPassword,
      updatePassword,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
