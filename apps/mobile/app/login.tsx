import { useEffect, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Critter } from "../src/components/Critter";
import { Txt } from "../src/components/ui/Txt";
import { useAuth } from "../src/api/auth";
import { colors } from "../src/theme/tokens";
import { coolDownOAuthBrowser, warmUpOAuthBrowser } from "../src/features/auth/oauth";

export default function LoginScreen() {
  const { signInWith } = useAuth();
  const [oauthBusy, setOauthBusy] = useState<null | "google">(null);
  const [error, setError] = useState<string | null>(null);

  // Pre-warm the auth tab so the first social login opens instantly.
  useEffect(() => {
    warmUpOAuthBrowser();
    return () => coolDownOAuthBrowser();
  }, []);

  const signInSocial = async (provider: "google") => {
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
          <Critter kind="whale" width={280} height={120} />
          <Txt size={12} weight="extraBold" tracking={0.14} color={colors.oceanBlue} style={{ marginTop: 16 }}>
            MOLA
          </Txt>
          <Txt accessibilityRole="header" size={28} weight="black" align="center" style={{ marginTop: 8 }}>
            바다에서 만난 친구들을{"\n"}도감과 그림일기로
          </Txt>
        </View>

        <View style={styles.buttons}>
          {/* Kakao: disabled until the Kakao app clears biz-app review; without it
              Supabase forces `account_email` and Kakao rejects every request. */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="카카오로 계속하기, 준비 중이에요"
            accessibilityState={{ disabled: true }}
            disabled
            style={[styles.social, styles.kakaoDisabled]}
          >
            <Txt size={16} weight="extraBold" color={colors.ink2}>
              카카오로 계속하기 (준비 중)
            </Txt>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Google로 계속하기"
            disabled={!!oauthBusy}
            onPress={() => signInSocial("google")}
            style={[styles.social, styles.google, oauthBusy && { opacity: 0.6 }]}
          >
            <Txt size={16} weight="extraBold" color={colors.navy}>
              {oauthBusy === "google" ? "Google로 이동 중…" : "Google로 계속하기"}
            </Txt>
          </Pressable>

          {error ? (
            <Txt size={13} weight="bold" color={colors.coral} align="center" accessibilityLiveRegion="assertive" style={{ marginTop: 8 }}>
              {error}
            </Txt>
          ) : null}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.mist },
  body: { flex: 1, justifyContent: "center", paddingHorizontal: 24, gap: 48 },
  hero: { alignItems: "center" },
  buttons: { gap: 12 },
  social: { height: 54, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  kakaoDisabled: { backgroundColor: "#E5E7EB", borderWidth: 1, borderColor: colors.lineStrong, opacity: 0.85 },
  google: { backgroundColor: colors.white, borderWidth: 1.5, borderColor: colors.lineStrong },
});