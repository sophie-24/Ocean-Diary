import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Critter } from "../src/components/Critter";
import { Txt } from "../src/components/ui/Txt";
import { useAuth } from "../src/api/auth";
import { colors, fonts } from "../src/theme/tokens";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginScreen() {
  const { sendCode, verifyCode } = useAuth();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"email" | "code">("email");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitEmail = async () => {
    const value = email.trim();
    if (!EMAIL_RE.test(value)) return setError("이메일 주소를 확인해 주세요.");
    setBusy(true);
    setError(null);
    try {
      await sendCode(value);
      setStep("code");
    } catch {
      setError("인증 코드를 보내지 못했어요. 잠시 후 다시 시도해 주세요.");
    } finally {
      setBusy(false);
    }
  };

  const submitCode = async () => {
    if (!/^\d{6,8}$/.test(code.trim())) return setError("메일로 받은 숫자 코드를 입력해 주세요.");
    setBusy(true);
    setError(null);
    try {
      await verifyCode(email.trim(), code.trim());
    } catch {
      setError("코드가 맞지 않거나 만료됐어요. 다시 받아 주세요.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.root}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.body}>
        <View style={styles.hero}>
          <Critter kind="whale" width={280} height={120} />
          <Txt size={12} weight="extraBold" tracking={0.14} color={colors.oceanBlue} style={{ marginTop: 16 }}>
            OCEAN DIARY
          </Txt>
          <Txt accessibilityRole="header" size={28} weight="black" align="center">
            바다에서 만난 친구들을{"\n"}도감과 그림일기로
          </Txt>
        </View>

        {step === "email" ? (
          <>
            <Txt size={13} weight="bold" color={colors.ink2}>
              이메일
            </Txt>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor="#8C9AB5"
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              textContentType="emailAddress"
              accessibilityLabel="이메일"
              style={styles.input}
              onSubmitEditing={submitEmail}
            />
            <Pressable accessibilityRole="button" disabled={busy} onPress={submitEmail} style={[styles.cta, busy && { opacity: 0.6 }]}>
              <Txt size={16} weight="extraBold" color={colors.white}>
                {busy ? "보내는 중…" : "인증 코드 받기"}
              </Txt>
            </Pressable>
            <Txt size={12} color={colors.ink2} align="center">
              비밀번호 없이 메일로 받은 코드로 로그인해요. 처음이면 자동으로 가입돼요.
            </Txt>
          </>
        ) : (
          <>
            <Txt size={13} weight="bold" color={colors.ink2}>
              {email}로 보낸 코드
            </Txt>
            <TextInput
              value={code}
              onChangeText={setCode}
              placeholder="숫자 6자리"
              placeholderTextColor="#8C9AB5"
              keyboardType="number-pad"
              textContentType="oneTimeCode"
              autoComplete="one-time-code"
              accessibilityLabel="인증 코드"
              style={[styles.input, { letterSpacing: 6, textAlign: "center" }]}
              onSubmitEditing={submitCode}
            />
            <Pressable accessibilityRole="button" disabled={busy} onPress={submitCode} style={[styles.cta, busy && { opacity: 0.6 }]}>
              <Txt size={16} weight="extraBold" color={colors.white}>
                {busy ? "확인 중…" : "로그인"}
              </Txt>
            </Pressable>
            <Pressable accessibilityRole="button" onPress={() => { setStep("email"); setCode(""); setError(null); }} style={{ alignSelf: "center", padding: 10 }}>
              <Txt size={13} weight="bold" color={colors.oceanBlue}>
                이메일 다시 입력
              </Txt>
            </Pressable>
          </>
        )}
        {error ? (
          <Txt size={13} weight="bold" color={colors.coral} align="center" accessibilityLiveRegion="assertive">
            {error}
          </Txt>
        ) : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.mist },
  body: { flex: 1, justifyContent: "center", paddingHorizontal: 24, gap: 12 },
  hero: { alignItems: "center", marginBottom: 24 },
  input: { height: 52, paddingHorizontal: 16, borderRadius: 14, borderWidth: 1.5, borderColor: colors.lineStrong, backgroundColor: colors.white, fontFamily: fonts.bold, fontSize: 16, color: colors.navy },
  cta: { height: 54, borderRadius: 16, backgroundColor: colors.oceanBlue, alignItems: "center", justifyContent: "center", marginTop: 4 },
});
