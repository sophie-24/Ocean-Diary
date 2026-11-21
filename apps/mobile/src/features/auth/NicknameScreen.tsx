import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ChevronLeft } from "../../components/icons";
import { Txt } from "../../components/ui/Txt";
import { useAuth } from "../../api/auth";
import { colors } from "../../theme/tokens";

const MIN = 2;
const MAX = 12;

/**
 * Nickname step. `setup` runs right after the first login (AuthGate keeps the diver here until a
 * nickname is saved, then the app intro opens over Home); `edit` is 설정 › 프로필 변경.
 */
export function NicknameScreen({ mode }: { mode: "setup" | "edit" }) {
  const router = useRouter();
  const { nickname, suggestedNickname, setNickname, signOut } = useAuth();
  const [value, setValue] = useState((nickname ?? suggestedNickname).slice(0, MAX));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trimmed = value.trim();
  const valid = trimmed.length >= MIN && trimmed.length <= MAX;
  const unchanged = mode === "edit" && trimmed === nickname;

  const save = async () => {
    if (!valid || busy) return;
    if (unchanged) {
      router.canGoBack() ? router.back() : router.navigate("/profile");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await setNickname(trimmed);
      // setup: AuthGate sees the saved nickname and moves on to Home by itself.
      if (mode === "edit") router.canGoBack() ? router.back() : router.navigate("/profile");
    } catch {
      setError("닉네임을 저장하지 못했어요. 잠시 후 다시 시도해 주세요.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.root}>
      {mode === "edit" ? (
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="뒤로"
            onPress={() => (router.canGoBack() ? router.back() : router.navigate("/profile"))}
            style={styles.hit}
          >
            <ChevronLeft />
          </Pressable>
          <Txt accessibilityRole="header" size={20} weight="black">
            프로필 변경
          </Txt>
        </View>
      ) : null}

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.body}>
        <View style={styles.content}>
          {mode === "setup" ? (
            <>
              <Txt size={12} weight="extraBold" tracking={0.14} color={colors.oceanBlue}>
                MOLA
              </Txt>
              <Txt accessibilityRole="header" size={26} weight="black" style={styles.title}>
                닉네임을 정해 주세요
              </Txt>
              <Txt size={14} color={colors.ink2} style={styles.sub}>
                홈 화면에 ‘닉네임님의 바다’로 보여요.{"\n"}나중에 설정에서 언제든 바꿀 수 있어요.
              </Txt>
            </>
          ) : (
            <Txt size={14} color={colors.ink2} style={styles.sub}>
              홈 화면에 ‘닉네임님의 바다’로 보여요.
            </Txt>
          )}

          <TextInput
            value={value}
            onChangeText={(t) => {
              setValue(t.slice(0, MAX));
              setError(null);
            }}
            placeholder="2~12자로 입력해 주세요"
            placeholderTextColor={colors.ink2}
            maxLength={MAX}
            autoFocus
            autoCorrect={false}
            returnKeyType="done"
            onSubmitEditing={() => void save()}
            accessibilityLabel="닉네임"
            style={styles.input}
          />
          <View style={styles.helpRow}>
            <Txt size={12} color={error ? colors.coral : colors.ink2}>
              {error ?? (trimmed.length > 0 && trimmed.length < MIN ? `${MIN}자 이상 입력해 주세요` : " ")}
            </Txt>
            <Txt size={12} color={colors.ink2}>
              {trimmed.length}/{MAX}
            </Txt>
          </View>
        </View>

        <View style={styles.footer}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={mode === "setup" ? "닉네임 저장하고 시작하기" : "닉네임 저장"}
            accessibilityState={{ disabled: !valid || busy }}
            disabled={!valid || busy}
            onPress={() => void save()}
            style={[styles.cta, (!valid || busy) && { opacity: 0.4 }]}
          >
            <Txt size={16} weight="black" color={colors.white}>
              {busy ? "저장하는 중…" : mode === "setup" ? "시작하기" : "저장"}
            </Txt>
          </Pressable>
          {mode === "setup" ? (
            <Pressable accessibilityRole="button" onPress={() => void signOut()} hitSlop={10} style={styles.switch}>
              <Txt size={13} color={colors.ink2}>
                다른 계정으로 로그인
              </Txt>
            </Pressable>
          ) : null}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.mist },
  header: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 8 },
  hit: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  body: { flex: 1, justifyContent: "space-between" },
  content: { paddingHorizontal: 24, paddingTop: 48 },
  title: { marginTop: 8 },
  sub: { marginTop: 10, marginBottom: 28, lineHeight: 21 },
  input: {
    height: 56,
    borderRadius: 16,
    paddingHorizontal: 16,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.lineStrong,
    fontSize: 17,
    color: colors.navy,
  },
  helpRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 8, paddingHorizontal: 4 },
  footer: { paddingHorizontal: 24, paddingBottom: 16, gap: 12, alignItems: "center" },
  cta: { alignSelf: "stretch", height: 54, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: colors.oceanBlue },
  switch: { paddingVertical: 6 },
});
