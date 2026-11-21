import { useEffect, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as AppleAuthentication from "expo-apple-authentication";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Txt } from "../src/components/ui/Txt";
import { useAuth } from "../src/api/auth";
import { GoogleLogo, KakaoLogo } from "../src/features/auth/ProviderLogos";
import { colors } from "../src/theme/tokens";
import {
  coolDownOAuthBrowser,
  isAppleSignInAvailable,
  warmUpOAuthBrowser,
} from "../src/features/auth/oauth";

const MOLA_LOGO = require("../assets/icon.png");

export default function LoginScreen() {
  const router = useRouter();
  const { signInWith, signInWithApple } = useAuth();
  const [oauthBusy, setOauthBusy] = useState<null | "google" | "kakao" | "apple">(null);
  const [appleAvailable, setAppleAvailable] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pre-warm the auth tab so the first social login opens instantly.
  useEffect(() => {
    warmUpOAuthBrowser();
    return () => coolDownOAuthBrowser();
  }, []);

  useEffect(() => {
    let active = true;
    void isAppleSignInAvailable().then((ok) => {
      if (active) setAppleAvailable(ok);
    });
    return () => {
      active = false;
    };
  }, []);

  const signInApple = async () => {
    if (oauthBusy) return;
    setOauthBusy("apple");
    setError(null);
    try {
      const result = await signInWithApple();
      if (result.kind === "error") setError(result.message);
    } catch (e) {
      setError((e as Error)?.message ?? "로그인 중 오류가 났어요.");
    } finally {
      setOauthBusy(null);
    }
  };

  const signInSocial = async (provider: "google" | "kakao") => {
    if (oauthBusy) return;
    setOauthBusy(provider);
    setError(null);
    try {
      const result = await signInWith(provider);
      if (result.kind === "error") setError(result.message);
      // success flips the auth state and the AuthGate navigates away automatically
    } catch (e) {
      setError((e as Error)?.message ?? "로그인 중 오류가 났어요.");
    } finally {
      setOauthBusy(null);
    }
  };

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.body}>
        <View style={styles.hero}>
          <Image
            source={MOLA_LOGO}
            style={styles.logo}
            contentFit="contain"
            accessibilityIgnoresInvertColors
          />
          <Txt accessibilityRole="header" size={28} weight="black" align="center" style={{ marginTop: 20 }}>
            바다에서 만난 친구들을{"\n"}도감과 그림일기로
          </Txt>
        </View>

        <View style={styles.buttons}>
          {/* Apple requires its own button component; keep it at least as prominent as the others. */}
          {appleAvailable ? (
            <AppleAuthentication.AppleAuthenticationButton
              buttonType={AppleAuthentication.AppleAuthenticationButtonType.CONTINUE}
              buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
              cornerRadius={16}
              onPress={signInApple}
              style={[styles.appleButton, oauthBusy && { opacity: 0.6 }]}
            />
          ) : null}

          {/* Kakao: scopes are limited to profile_nickname + profile_image in oauth.ts
              (no account_email), so this doesn't need biz-app review to work. */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="카카오로 계속하기"
            disabled={!!oauthBusy}
            onPress={() => signInSocial("kakao")}
            style={[styles.social, styles.kakao, oauthBusy && { opacity: 0.6 }]}
          >
            <View style={styles.logoSlot}>
              <KakaoLogo size={22} />
            </View>
            <Txt size={16} weight="extraBold" color="#191600">
              {oauthBusy === "kakao" ? "카카오로 이동 중…" : "카카오로 계속하기"}
            </Txt>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Google로 계속하기"
            disabled={!!oauthBusy}
            onPress={() => signInSocial("google")}
            style={[styles.social, styles.google, oauthBusy && { opacity: 0.6 }]}
          >
            <View style={styles.logoSlot}>
              <GoogleLogo size={20} />
            </View>
            <Txt size={16} weight="extraBold" color={colors.navy}>
              {oauthBusy === "google" ? "Google로 이동 중…" : "Google로 계속하기"}
            </Txt>
          </Pressable>

          {error ? (
            <Txt size={13} weight="bold" color={colors.coral} align="center" accessibilityLiveRegion="assertive" style={{ marginTop: 8 }}>
              {error}
            </Txt>
          ) : null}

          {/* Legal + sign-up notice. Supabase OAuth auto-creates the account on first
              login, so we tell the diver up-front and link the privacy policy they're
              agreeing to by continuing. */}
          <Txt size={11} color={colors.ink2} align="center" style={styles.legal}>
            처음이면 자동으로 가입돼요. 계속하면{" "}
            <Txt
              size={11}
              weight="bold"
              color={colors.oceanBlue}
              onPress={() => router.push("/legal/privacy")}
            >
              개인정보 처리방침
            </Txt>
            에 동의하는 것으로 간주돼요.{"\n"}
            회원탈퇴는 로그인 후 '설정'에서 언제든 할 수 있어요.
          </Txt>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.mist },
  body: { flex: 1, justifyContent: "center", paddingHorizontal: 24, gap: 48 },
  hero: { alignItems: "center" },
  logo: { width: 120, height: 120, borderRadius: 12 },
  buttons: { gap: 12 },
  logoSlot: { position: "absolute", left: 20, height: 54, justifyContent: "center" },
  appleButton: { height: 54, width: "100%" },
  social: { height: 54, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  kakao: { backgroundColor: "#FEE500" },
  google: { backgroundColor: colors.white, borderWidth: 1.5, borderColor: colors.line },
  legal: { marginTop: 20, paddingHorizontal: 8, lineHeight: 18 },
});
