import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Critter } from "../../components/Critter";
import { ChevronLeft } from "../../components/icons";
import { Txt } from "../../components/ui/Txt";
import { colors, fonts } from "../../theme/tokens";
import { Manuscript } from "../diary/Manuscript";
import { KIND_LABEL, useLogs } from "./logStore";

const DETAIL_LABELS: Record<string, string> = {
  maxDepth: "최대 수심 (m)",
  avgDepth: "평균 수심 (m)",
  bottom: "잠수 시간 (분)",
  waterTemp: "수온 (°C)",
  surfTemp: "수면 온도 (°C)",
  vis: "시야 (m)",
  timeIn: "입수",
  timeOut: "출수",
  barIn: "입수 잔압 (bar)",
  barOut: "출수 잔압 (bar)",
  weight: "웨이트 (kg)",
  bestDepth: "최고 수심 (m)",
  longest: "최장 잠수",
  dives: "다이브 (회)",
  buddy: "버디",
  weather: "날씨",
  when: "시간대",
  waterClarity: "물빛",
  discipline: "종목",
  gear: "장비",
  type: "다이빙 종류",
  memo: "메모",
};

export function LogDetailScreen({ id }: { id: string }) {
  const router = useRouter();
  const logs = useLogs();
  const log = logs.find((l) => l.id === id);
  const goBack = () => (router.canGoBack() ? router.back() : router.navigate("/log"));

  if (!log) {
    return (
      <SafeAreaView style={[styles.root, { alignItems: "center", justifyContent: "center" }]}>
        <Txt size={16} weight="bold">
          기록을 찾을 수 없어요
        </Txt>
      </SafeAreaView>
    );
  }

  const rows = Object.entries(DETAIL_LABELS)
    .map(([k, label]) => {
      const v = log.details[k];
      const s = Array.isArray(v) ? v.join(", ") : v === undefined || v === "" ? "" : String(v);
      return s ? ([label, s] as const) : null;
    })
    .filter((r): r is readonly [string, string] => !!r);

  return (
    <SafeAreaView edges={["top"]} style={styles.root}>
      <View style={styles.header}>
        <Pressable accessibilityRole="button" accessibilityLabel="로그북 목록으로" onPress={goBack} style={styles.hit}>
          <ChevronLeft />
        </Pressable>
        <Txt size={13} weight="extraBold" color={colors.ink3}>
          {log.label} · {KIND_LABEL[log.kind]}
        </Txt>
        <View style={styles.hit} />
      </View>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 48 }}>
        {/* Picture-diary page */}
        <View style={styles.page}>
          <View style={styles.pageHead}>
            <Txt size={16} style={{ fontFamily: fonts.diaryBold }} numberOfLines={1}>
              {log.date.replace(/-/g, ".")}
            </Txt>
            <Txt size={16} style={{ fontFamily: fonts.diaryBold, flexShrink: 1 }} numberOfLines={1}>
              {log.region} · {log.point}
            </Txt>
          </View>
          <View style={[styles.drawing, { backgroundColor: log.coverBg }]}>
            <View style={styles.glare} />
            <Critter kind={log.coverKind} width={220} height={120} />
            <View style={styles.stickerRow}>
              {log.stickers.map((k) => (
                <Critter key={k} kind={k} width={64} height={36} />
              ))}
            </View>
          </View>
          <Txt size={22} style={{ fontFamily: fonts.diaryBold, marginVertical: 8 }} align="center">
            {log.title}
          </Txt>
          <View style={{ alignItems: "center" }}>
            <Manuscript text={log.diary ?? ""} rows={6} cell={25} />
          </View>
          {!log.diary ? (
            <Txt size={13} color={colors.ink2} align="center" style={{ marginTop: 8 }}>
              아직 그림일기 글이 없어요
            </Txt>
          ) : null}
        </View>

        <View style={{ flexDirection: "row", gap: 8 }}>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push({ pathname: "/diary/[logId]/write", params: { logId: log.id } })}
            style={styles.primary}
          >
            <Txt size={15} weight="black" color={colors.white}>
              {log.diary ? "일기 고치기" : "그림일기 쓰기"}
            </Txt>
          </Pressable>
          <View style={[styles.secondary, { opacity: 0.55 }]} accessibilityLabel="크레파스 스티커 꾸미기, 준비 중">
            <Txt size={14} weight="bold">
              스티커 꾸미기 · 곧
            </Txt>
          </View>
        </View>

        <View style={styles.card}>
          <Txt accessibilityRole="header" size={16} weight="black" style={{ marginBottom: 8 }}>
            {KIND_LABEL[log.kind]} 기록
          </Txt>
          <Txt size={14} weight="bold" color="#34466E">
            {log.summary}
          </Txt>
          {rows.map(([k, v]) => (
            <View key={k} style={styles.dl}>
              <Txt size={13} color={colors.ink2} style={{ width: 110 }}>
                {k}
              </Txt>
              <Txt size={13} weight="medium" style={{ flex: 1 }}>
                {v}
              </Txt>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.mist },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 8 },
  hit: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  page: { padding: 14, borderRadius: 18, backgroundColor: "#FFFDF7", borderWidth: 1, borderColor: "#EADFC8", shadowColor: "#1E468C", shadowOpacity: 0.08, shadowRadius: 14, shadowOffset: { width: 0, height: 6 }, elevation: 3 },
  pageHead: { flexDirection: "row", justifyContent: "space-between", gap: 8, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: "#EADFC8", marginBottom: 10 },
  drawing: { height: 190, borderRadius: 10, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  glare: { position: "absolute", left: -20, top: -40, width: 70, height: 280, backgroundColor: "rgba(255,255,255,0.12)", transform: [{ rotate: "20deg" }] },
  stickerRow: { position: "absolute", left: 8, bottom: 6, flexDirection: "row", gap: 4 },
  primary: { flex: 1, height: 50, borderRadius: 16, backgroundColor: colors.oceanBlue, alignItems: "center", justifyContent: "center" },
  secondary: { flex: 1, height: 50, borderRadius: 16, borderWidth: 1.5, borderColor: colors.lineStrong, backgroundColor: colors.white, alignItems: "center", justifyContent: "center" },
  card: { padding: 16, borderRadius: 20, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, gap: 4 },
  dl: { flexDirection: "row", gap: 8, paddingVertical: 4 },
});
