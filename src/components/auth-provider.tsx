"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { DEFAULT_SITE_URL } from "@/lib/constants";
import {
  readCart,
  readFavorites,
  writeCart,
  writeFavorites,
} from "@/lib/cart-client";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type AuthUser = {
  id: string;
  email: string;
  emailConfirmed: boolean;
};

type AuthState = {
  user: AuthUser | null;
  loading: boolean;
  configured: boolean;
};

type AuthContextValue = AuthState & {
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
  ) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error?: string }>;
  updatePassword: (password: string) => Promise<{ error?: string }>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function mapUser(u: { id: string; email?: string; email_confirmed_at?: string | null } | null): AuthUser | null {
  if (!u) return null;
  return { id: u.id, email: u.email ?? "", emailConfirmed: !!u.email_confirmed_at };
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

  useEffect(() => {
    if (!supabase) return;

    let mounted = true;

    supabase.auth.getUser().then(({ data }) => {
      if (mounted) {
        setUser(mapUser(data.user));
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(mapUser(session?.user ?? null));
      setLoading(false);
      if (event === "SIGNED_IN" && session?.user) {
        syncLocalAccountState().catch(() => {});
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      if (!supabase) return { error: "Autenticación no configurada." };
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return error ? { error: error.message } : {};
    },
    [supabase],
  );

  const signUp = useCallback(
    async (email: string, password: string, firstName: string, lastName: string) => {
      if (!supabase) return { error: "Autenticación no configurada." };
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { first_name: firstName, last_name: lastName } },
      });
      return error ? { error: error.message } : {};
    },
    [supabase],
  );

  const signOut = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  }, [supabase]);

  const resetPassword = useCallback(
    async (email: string) => {
      if (!supabase) return { error: "Autenticación no configurada." };
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${DEFAULT_SITE_URL}/auth/callback?next=/actualizar-password`,
      });
      return error ? { error: error.message } : {};
    },
    [supabase],
  );

  const updatePassword = useCallback(
    async (password: string) => {
      if (!supabase) return { error: "Autenticación no configurada." };
      const { error } = await supabase.auth.updateUser({ password });
      return error ? { error: error.message } : {};
    },
    [supabase],
  );

  const value = useMemo(
    () => ({
      user,
      loading,
      configured,
      signIn,
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
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
