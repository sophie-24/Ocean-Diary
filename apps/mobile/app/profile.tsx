import { useState, type ReactNode } from "react";
import { Alert, Linking, Platform, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "../src/components/icons";
import { Txt } from "../src/components/ui/Txt";
import { api, errorMessage } from "../src/api/client";
import { useAuth } from "../src/api/auth";
import { requestAppleAuthorizationCode } from "../src/features/auth/oauth";
import { onboardingStore } from "../src/features/onboarding/onboardingStore";
import { useSummary } from "../src/api/queries";
import { colors } from "../src/theme/tokens";
import { INSTAGRAM_URL, KAKAO_CHANNEL_CHAT_URL } from "../src/lib/links";

const PROVIDER_LABEL: Record<string, string> = {
  apple: "Apple",
  kakao: "카카오",
  google: "Google",
  email: "이메일",
};

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Txt size={12} weight="bold" color={colors.ink2} style={styles.sectionTitle}>
        {title}
      </Txt>
      {children}
    </View>
  );
}

function Row({
  label,
  value,
  onPress,
  danger,
  disabled,
  accessibilityLabel,
}: {
  label: string;
  value?: string;
  onPress?: () => void;
  danger?: boolean;
  disabled?: boolean;
  accessibilityLabel?: string;
}) {
  return (
    <Pressable
      accessibilityRole={onPress ? "button" : "text"}
      accessibilityLabel={accessibilityLabel ?? label}
      disabled={disabled || !onPress}
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && onPress ? { opacity: 0.6 } : null]}
    >
      <Txt size={16} weight="bold" color={danger ? colors.coral : colors.navy}>
        {label}
      </Txt>
      {value ? (
        <Txt size={15} color={colors.ink2}>
          {value}
        </Txt>
      ) : onPress && !danger ? (
        <ChevronRight size={16} color={colors.ink2} />
      ) : null}
    </Pressable>
  );
}

/** 설정: 계정 정보, 프로필 변경, 이용정책, 앱 정보, 로그아웃/회원탈퇴 (in-app deletion: App Store 5.1.1(v)). */
export default function SettingsScreen() {
  const router = useRouter();
  const qc = useQueryClient();
  const { email, nickname, provider, usingDevToken, hasAppleIdentity, signOut } = useAuth();
  const { data: summary } = useSummary();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const leave = async () => {
    qc.clear();
    await signOut();
  };

  const doDelete = async () => {
    setBusy(true);
    setError(null);
    try {
      // Apple-linked accounts must revoke their Apple tokens: re-confirm with Apple and send the
      // fresh single-use code so the server can do it before anything is deleted.
      let appleCode: string | undefined;
      if (hasAppleIdentity && Platform.OS === "ios") {
        const apple = await requestAppleAuthorizationCode();
        if (apple.kind === "cancel") {
          setError("Apple 확인을 완료해야 회원탈퇴를 할 수 있어요.");
          return;
        }
        if (apple.kind === "error") {
          setError(apple.message);
          return;
        }
        appleCode = apple.code;
      }
      await api("/v1/account", {
        method: "DELETE",
        body: appleCode ? { apple_authorization_code: appleCode } : undefined,
      });
      await leave();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const confirmDelete = () => {
    const msg = "로그북, 그림일기, 사진, 도감 기록이 모두 지워지고 되돌릴 수 없어요.";
    if (Platform.OS === "web") {
      // eslint-disable-next-line no-alert
      if (globalThis.confirm?.(`회원탈퇴 하시겠어요?\n${msg}`)) void doDelete();
      return;
    }
    Alert.alert("회원탈퇴 하시겠어요?", msg, [
      { text: "취소", style: "cancel" },
      { text: "탈퇴", style: "destructive", onPress: () => void doDelete() },
    ]);
  };

  const openLink = (url: string) => {
    void Linking.openURL(url).catch(() => setError("링크를 열지 못했어요. 잠시 후 다시 시도해 주세요."));
  };

  const providerLabel = provider ? PROVIDER_LABEL[provider] : undefined;
  const version = Constants.expoConfig?.version ?? "—";

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="뒤로"
          onPress={() => (router.canGoBack() ? router.back() : router.navigate("/"))}
          style={styles.hit}
        >
          <ChevronLeft />
        </Pressable>
        <Txt accessibilityRole="header" size={20} weight="black">
          설정
        </Txt>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.account}>
          <Txt size={12} color={colors.ink2}>
            내 계정
          </Txt>
          <Txt size={20} weight="black">
            {nickname ?? (usingDevToken ? "개발용 계정" : "다이버")}
          </Txt>
          <Txt size={13} color={colors.ink2}>
            {[providerLabel ? `${providerLabel}로 로그인` : null, email].filter(Boolean).join(" · ") || "—"}
          </Txt>
          {summary ? (
            <Txt size={13} color={colors.ink2} style={{ marginTop: 6 }}>
              도감 {summary.collected_species}종 · 만남 {summary.encounter_count}회 · 명소 스탬프 {summary.stamp_count}개
            </Txt>
          ) : null}
        </View>

        <Section title="Mola 이용하기">
          {!usingDevToken ? <Row label="프로필 변경" onPress={() => router.push("/nickname-edit")} /> : null}
          {KAKAO_CHANNEL_CHAT_URL ? (
            <Row label="1:1 문의하기" onPress={() => openLink(KAKAO_CHANNEL_CHAT_URL)} />
          ) : null}
          <Row label="Mola 인스타그램 바로가기" onPress={() => openLink(INSTAGRAM_URL)} />
          <Row label="앱 소개 다시 보기" onPress={() => onboardingStore.openManual()} />
        </Section>

        <Section title="이용정책">
          <Row label="개인정보 처리방침" accessibilityLabel="개인정보 처리방침 보기" onPress={() => router.push("/legal/privacy")} />
        </Section>

        <Section title="앱 정보">
          <Row label="버전정보" value={version} />
          {!usingDevToken ? <Row label="로그아웃" disabled={busy} onPress={() => void leave()} /> : null}
          <Row label={busy ? "탈퇴하는 중…" : "회원탈퇴"} danger disabled={busy} onPress={confirmDelete} />
        </Section>

        {error ? (
          <Txt size={13} color={colors.coral} accessibilityLiveRegion="assertive" style={{ marginHorizontal: 24, marginTop: 12 }}>
            {error}
          </Txt>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.mist },
  header: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 8 },
  hit: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  scroll: { paddingBottom: 40 },
  account: { marginHorizontal: 20, marginTop: 8, padding: 18, borderRadius: 16, backgroundColor: colors.white, gap: 2 },
  section: { marginHorizontal: 20, marginTop: 16, borderRadius: 16, backgroundColor: colors.white, paddingVertical: 6 },
  sectionTitle: { paddingHorizontal: 18, paddingTop: 12, paddingBottom: 4 },
  row: {
    minHeight: 52,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});
