import * as AppleAuthentication from "expo-apple-authentication";
import * as Crypto from "expo-crypto";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { Platform } from "react-native";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../../lib/supabase";

/** Browser-based providers wired through Supabase. Apple uses the native flow below. */
export type OAuthProvider = "kakao" | "google";

export type OAuthResult =
  | { kind: "success"; session: Session }
  | { kind: "cancel" }
  | { kind: "error"; message: string };

/**
 * `exp://…` while running inside Expo Go (so the dev client can hand the URL back),
 * `molalog://auth/callback` once a Development Build is installed.
 * Both are allowed Redirect URIs in Supabase, so either shape round-trips cleanly.
 */
function buildRedirectUri(): string {
  return Linking.createURL("auth/callback");
}

/** Pulls `?code=…` out of either `exp://…/--/auth/callback?code=…` or `molalog://auth/callback?code=…`. */
function extractCode(url: string): string | null {
  try {
    const parsed = Linking.parse(url);
    const code = parsed.queryParams?.code;
    if (typeof code === "string" && code.length > 0) return code;
  } catch {
    /* fall through to regex */
  }
  const match = url.match(/[?&]code=([^&#]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export async function signInWithProvider(provider: OAuthProvider): Promise<OAuthResult> {
  if (!supabase) return { kind: "error", message: "로그인 설정이 아직 없어요." };

  const redirectTo = buildRedirectUri();

  // Kakao: without a biz-app review the `account_email` consent item is disabled,
  // so Supabase's default scope set (which includes it) gets rejected. Ask only for
  // the nickname + profile picture consent items which don't need review.
  const scopes = provider === "kakao" ? "profile_nickname profile_image" : undefined;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo,
      // We open the browser ourselves below so we can catch the callback on native.
      skipBrowserRedirect: true,
      ...(scopes ? { scopes } : {}),
    },
  });
  // Dev visibility: print redirect + the URL Supabase handed back. Remove once OAuth stabilises.
  if (__DEV__) {
    console.log("[oauth]", provider, "redirectTo=", redirectTo);
    console.log("[oauth]", provider, "authorizeUrl=", data?.url ?? "(none)");
    if (error) console.log("[oauth]", provider, "error=", error);
  }
  if (error) return { kind: "error", message: friendlyError(provider, error.message) };
  if (!data?.url) return { kind: "error", message: `${label(provider)} 로그인 URL을 받지 못했어요.` };

  if (Platform.OS === "web") {
    // On the web preview Supabase handles the redirect via location change; just navigate.
    window.location.assign(data.url);
    return { kind: "cancel" }; // page is navigating away; nothing more to do here
  }

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo, {
    showInRecents: false,
  });

  if (result.type === "cancel" || result.type === "dismiss") return { kind: "cancel" };
  if (result.type !== "success" || !result.url) {
    return { kind: "error", message: `${label(provider)} 로그인 창이 예상과 다르게 닫혔어요.` };
  }

  const code = extractCode(result.url);
  if (!code) return { kind: "error", message: `${label(provider)} 로그인 응답에 코드가 없어요.` };

  const exchange = await supabase.auth.exchangeCodeForSession(code);
  if (exchange.error || !exchange.data.session) {
    return { kind: "error", message: friendlyError(provider, exchange.error?.message) };
  }

  return { kind: "success", session: exchange.data.session };
}

function label(provider: OAuthProvider): string {
  return provider === "kakao" ? "카카오" : "구글";
}

function friendlyError(provider: OAuthProvider, raw: string | undefined): string {
  const name = label(provider);
  if (!raw) return `${name} 로그인에 실패했어요.`;
  if (/provider/i.test(raw) && /not.*enabled/i.test(raw)) {
    return `Supabase에서 ${name} Provider가 아직 켜져 있지 않아요.`;
  }
  if (/redirect/i.test(raw)) {
    return `${name} Redirect URI가 Supabase 설정과 맞지 않아요.`;
  }
  return `${name} 로그인에 실패했어요: ${raw}`;
}

/** True only on iOS devices where the native Sign in with Apple sheet is available. */
export async function isAppleSignInAvailable(): Promise<boolean> {
  if (Platform.OS !== "ios") return false;
  try {
    return await AppleAuthentication.isAvailableAsync();
  } catch {
    return false;
  }
}

/**
 * Native Sign in with Apple → Supabase `signInWithIdToken`.
 * Requires a Development/production build (not Expo Go) and the bundle ID listed in
 * Supabase → Auth → Providers → Apple → Client IDs.
 */
export async function signInWithApple(): Promise<OAuthResult> {
  if (!supabase) return { kind: "error", message: "로그인 설정이 아직 없어요." };

  try {
    // Supabase checks the SHA-256 of this nonce inside Apple's token against the raw value.
    const rawNonce = Crypto.randomUUID();
    const hashedNonce = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, rawNonce);

    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
      nonce: hashedNonce,
    });
    if (!credential.identityToken) {
      return { kind: "error", message: "Apple 로그인 응답에 토큰이 없어요." };
    }

    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: "apple",
      token: credential.identityToken,
      nonce: rawNonce,
    });
    if (error || !data.session) {
      return { kind: "error", message: `Apple 로그인에 실패했어요${error?.message ? `: ${error.message}` : "."}` };
    }

    // Apple only returns the name on the very first authorization, so persist it now.
    const given = credential.fullName?.givenName ?? "";
    const family = credential.fullName?.familyName ?? "";
    const fullName = [family, given].filter(Boolean).join("");
    if (fullName) {
      await supabase.auth.updateUser({ data: { full_name: fullName } }).catch(() => undefined);
    }

    return { kind: "success", session: data.session };
  } catch (e) {
    if ((e as { code?: string })?.code === "ERR_REQUEST_CANCELED") return { kind: "cancel" };
    return { kind: "error", message: `Apple 로그인에 실패했어요: ${(e as Error)?.message ?? "알 수 없는 오류"}` };
  }
}

export type AppleCodeResult =
  | { kind: "success"; code: string }
  | { kind: "cancel" }
  | { kind: "error"; message: string };

/**
 * Asks Apple for a fresh, single-use authorization code. Account deletion sends it to the API,
 * which revokes the user's Apple tokens (App Store guideline 5.1.1(v)). Shows the Apple sheet
 * again, which doubles as a re-authentication step before something irreversible.
 */
export async function requestAppleAuthorizationCode(): Promise<AppleCodeResult> {
  try {
    const credential = await AppleAuthentication.signInAsync({ requestedScopes: [] });
    if (!credential.authorizationCode) {
      return { kind: "error", message: "Apple 확인 응답에 코드가 없어요." };
    }
    return { kind: "success", code: credential.authorizationCode };
  } catch (e) {
    if ((e as { code?: string })?.code === "ERR_REQUEST_CANCELED") return { kind: "cancel" };
    return { kind: "error", message: `Apple 확인에 실패했어요: ${(e as Error)?.message ?? "알 수 없는 오류"}` };
  }
}

/** So Expo Go can clean up the auth session on cold start. Safe to call unconditionally. */
export function warmUpOAuthBrowser(): void {
  if (Platform.OS === "web") return;
  void WebBrowser.warmUpAsync().catch(() => undefined);
}

export function coolDownOAuthBrowser(): void {
  if (Platform.OS === "web") return;
  void WebBrowser.coolDownAsync().catch(() => undefined);
}