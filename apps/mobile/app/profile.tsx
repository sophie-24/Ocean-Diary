import { useState } from "react";
import { Alert, Platform, Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronLeft } from "../src/components/icons";
import { Txt } from "../src/components/ui/Txt";
import { api, errorMessage } from "../src/api/client";
import { useAuth } from "../src/api/auth";
import { useSummary } from "../src/api/queries";
import { colors } from "../src/theme/tokens";

/** 내 계정: sign out and in-app account deletion (required by App Store guideline 5.1.1(v)). */
export default function ProfileScreen() {
  const router = useRouter();
  const qc = useQueryClient();
  const { email, usingDevToken, signOut } = useAuth();
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
      await api("/v1/account", { method: "DELETE" });
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
      if (globalThis.confirm?.(`계정을 삭제할까요?\n${msg}`)) void doDelete();
      return;
    }
    Alert.alert("계정을 삭제할까요?", msg, [
      { text: "취소", style: "cancel" },
      { text: "삭제", style: "destructive", onPress: () => void doDelete() },
    ]);
  };

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <Pressable accessibilityRole="button" accessibilityLabel="뒤로" onPress={() => (router.canGoBack() ? router.back() : router.navigate("/"))} style={styles.hit}>
          <ChevronLeft />
        </Pressable>
        <Txt accessibilityRole="header" size={20} weight="black">
          내 계정
        </Txt>
      </View>

      <View style={styles.card}>
        <Txt size={12} color={colors.ink2}>
          로그인한 이메일
        </Txt>
        <Txt size={16} weight="extraBold">
          {email ?? (usingDevToken ? "개발용 계정" : "—")}
        </Txt>
        {summary ? (
          <Txt size={13} color={colors.ink2} style={{ marginTop: 6 }}>
            도감 {summary.collected_species}종 · 만남 {summary.encounter_count}회 · 명소 스탬프 {summary.stamp_count}개
          </Txt>
        ) : null}
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="개인정보 처리방침 보기"
        onPress={() => router.push("/legal/privacy")}
        style={styles.row}
      >
        <Txt size={15} weight="bold">
          개인정보 처리방침
        </Txt>
      </Pressable>

      {!usingDevToken ? (
        <Pressable accessibilityRole="button" disabled={busy} onPress={() => void leave()} style={styles.row}>
          <Txt size={15} weight="bold">
            로그아웃
          </Txt>
        </Pressable>
      ) : null}

      <Pressable accessibilityRole="button" disabled={busy} onPress={confirmDelete} style={styles.row}>
        <Txt size={15} weight="bold" color={colors.coral}>
          {busy ? "삭제하는 중…" : "계정 삭제"}
        </Txt>
      </Pressable>
      {error ? (
        <Txt size={13} color={colors.coral} style={{ marginHorizontal: 24, marginTop: 8 }}>
          {error}
        </Txt>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.mist },
  header: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 8 },
  hit: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  card: { marginHorizontal: 20, marginTop: 8, padding: 16, borderRadius: 20, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, gap: 2 },
  row: { marginHorizontal: 20, marginTop: 12, paddingVertical: 16, paddingHorizontal: 16, borderRadius: 16, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line },
});
