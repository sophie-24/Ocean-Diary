import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase, supabaseEnabled } from "../lib/supabase";
import { DEV_AUTH_TOKEN, configureApiAuth } from "./client";
import { discoverStore } from "../features/discover/discoverStore";
import { signInWithProvider, type OAuthProvider, type OAuthResult } from "../features/auth/oauth";

type AuthState = {
  /** True while the stored session is being restored at launch. */
  loading: boolean;
  /** Signed in (Supabase session) or using the local development token. */
  signedIn: boolean;
  email: string | null;
  /** Stable id of the signed-in account ("dev" for the local development token). */
  userId: string | null;
  usingDevToken: boolean;
  sendCode: (email: string) => Promise<void>;
  verifyCode: (email: string, code: string) => Promise<void>;
  signInWith: (provider: OAuthProvider) => Promise<OAuthResult>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(supabaseEnabled);
  const usingDevToken = !supabaseEnabled && !!DEV_AUTH_TOKEN;

  useEffect(() => {
    if (!supabase) return;
    let active = true;
    void supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setLoading(false);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  // Configure synchronously so the very first queries already carry the token.
  configureApiAuth(
    () => session?.access_token ?? (usingDevToken ? DEV_AUTH_TOKEN : null),
    () => {
      if (supabase) void supabase.auth.signOut({ scope: "local" }).catch(() => undefined);
      discoverStore.reset(true);
      setSession(null);
    },
  );

  const value = useMemo<AuthState>(
    () => ({
      loading,
      signedIn: !!session || usingDevToken,
      email: session?.user.email ?? null,
      userId: session?.user.id ?? (usingDevToken ? "dev" : null),
      usingDevToken,
      async sendCode(email) {
        if (!supabase) throw new Error("로그인 설정이 아직 없어요.");
        const { error } = await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: true } });
        if (error) throw error;
      },
      async verifyCode(email, code) {
        if (!supabase) throw new Error("로그인 설정이 아직 없어요.");
        const { data, error } = await supabase.auth.verifyOtp({ email, token: code, type: "email" });
        if (error) throw error;
        setSession(data.session);
      },
      async signInWith(provider) {
        const result = await signInWithProvider(provider);
        if (result.kind === "success") setSession(result.session);
        return result;
      },
      async signOut() {
        if (supabase) await supabase.auth.signOut();
        discoverStore.reset(true);
        setSession(null);
      },
    }),
    [loading, session, usingDevToken],
  );

  // Bring back an interrupted 발견 session for this account.
  useEffect(() => {
    if (value.userId) void discoverStore.hydrate(value.userId);
  }, [value.userId]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
