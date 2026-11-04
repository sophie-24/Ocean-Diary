import { useMemo, useState } from "react";
import { Pressable, SectionList, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Critter } from "../../components/Critter";
import { PlusIcon, StampBookIcon } from "../../components/icons";
import { ScreenHeader, RoundIconButton } from "../../components/ui/ScreenHeader";
import { Txt } from "../../components/ui/Txt";
import { colors, fonts } from "../../theme/tokens";
import { MOCK_TOTALS, logStore, useLogs, type DiveLog, type LogKind } from "./logStore";

type Filter = "all" | LogKind;

const TYPE_BADGE: Record<LogKind, { text: string; bg: string; fg: string; border?: string }> = {
  scuba: { text: "SCUBA", bg: colors.navy, fg: colors.white },
  free: { text: "FREE", bg: colors.white, fg: "#1F4FA8", border: colors.oceanBlue },
  snorkel: { text: "SNORKEL", bg: "#FFF4D1", fg: "#8A5A00", border: colors.sunny },
};

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

export function LogListScreen() {
  const router = useRouter();
  const logs = useLogs();
  const counts = logStore.counts();
  const [filter, setFilter] = useState<Filter>("all");
  const total = counts.scuba + counts.free + counts.snorkel;

  const sections = useMemo(() => {
    const items = logs.filter((l) => filter === "all" || l.kind === filter);
    const byMonth = new Map<string, DiveLog[]>();
    items.forEach((l) => {
      const key = l.date.slice(0, 7);
      byMonth.set(key, [...(byMonth.get(key) ?? []), l]);
    });
    return Array.from(byMonth, ([key, data]) => ({ title: `${key.slice(0, 4)}년 ${Number(key.slice(5))}월`, data }));
  }, [logs, filter]);

  const tabs: [Filter, string][] = [
    ["all", `전체 ${total}`],
    ["scuba", `스쿠버 ${counts.scuba}`],
    ["free", `프리다이빙 ${counts.free}`],
    ["snorkel", `스노클 ${counts.snorkel}`],
  ];

  const header = (
    <View>
      <ScreenHeader
        eyebrow="DIVE SCRAPBOOK"
        title="로그북"
        actions={
          <>
            <RoundIconButton label="우표첩 보기로 바꾸기">
              <StampBookIcon />
            </RoundIconButton>
            <Pressable accessibilityRole="button" accessibilityLabel="새 기록 쓰기" onPress={() => router.push("/log/new")} style={styles.addBtn}>
              <PlusIcon />
            </Pressable>
          </>
        }
      />
      <View style={styles.stats}>
        {(
          [
            ["총 다이빙", `${counts.scuba}회`],
            ["누적 시간", MOCK_TOTALS.scubaTime],
            ["최대 수심", MOCK_TOTALS.maxDepth],
          ] as const
        ).map(([k, v]) => (
          <View key={k} style={styles.stat}>
            <Txt size={11} color={colors.ink2}>
              {k}
            </Txt>
            <Txt size={18} weight="black">
              {v}
            </Txt>
          </View>
        ))}
      </View>
      <View accessibilityRole="tablist" style={styles.segment}>
        {tabs.map(([key, label]) => {
          const on = key === filter;
          return (
            <Pressable
              key={key}
              accessibilityRole="tab"
              accessibilityState={{ selected: on }}
              onPress={() => setFilter(key)}
              style={[styles.segItem, key === "free" && { flex: 1.25 }, on && styles.segOn]}
            >
              <Txt size={13} weight={on ? "extraBold" : "bold"} color={on ? colors.navy : colors.ink2} numberOfLines={1}>
                {label}
              </Txt>
            </Pressable>
          );
        })}
      </View>
    </View>
  );

  return (
    <SafeAreaView edges={["top"]} style={styles.root}>
      <SectionList
        sections={sections}
        keyExtractor={(l) => l.id}
        ListHeaderComponent={header}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={{ paddingBottom: 32 }}
        renderSectionHeader={({ section }) => (
          <Txt accessibilityRole="header" size={14} weight="black" color={colors.ink2} style={styles.month}>
            {section.title}
          </Txt>
        )}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        renderItem={({ item, index }) => (
          <LogCard
            log={item}
            tilt={[-2, 1, 2, -1][index % 4]}
            onPress={() => router.push({ pathname: "/log/[id]", params: { id: item.id } })}
          />
        )}
        ListEmptyComponent={
          <Txt size={14} color={colors.ink2} align="center" style={{ marginTop: 40 }}>
            아직 기록이 없어요. 오른쪽 위 + 버튼으로 첫 기록을 남겨 보세요.
          </Txt>
        }
      />
    </SafeAreaView>
  );
}

function LogCard({ log, tilt, onPress }: { log: DiveLog; tilt: number; onPress: () => void }) {
  const badge = TYPE_BADGE[log.kind];
  const [, m, d] = log.date.split("-");
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${log.label} ${log.title}, ${log.region} ${log.point}, ${log.summary}${log.draft ? ", 작성 중" : ""}`}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.9 }]}
    >
      <View style={{ transform: [{ rotate: `${tilt}deg` }] }}>
        <View style={styles.stampFrame}>
          <View style={[styles.stampInner, { backgroundColor: log.coverBg }]}>
            <View style={styles.glare} />
            <Critter kind={log.coverKind} width={70} height={46} />
          </View>
        </View>
        <View style={styles.postmark}>
          <Txt size={10} weight="black" color="#1F4FA8">
            {MONTHS[Number(m) - 1]}
          </Txt>
          <Txt size={13} weight="black" color="#1F4FA8" style={{ lineHeight: 14 }}>
            {d}
          </Txt>
        </View>
      </View>
      <View style={{ flex: 1, gap: 4 }}>
        <View style={styles.row6}>
          <Txt size={12} weight="black" color={colors.oceanBlue}>
            {log.label}
          </Txt>
          <View style={[styles.badge, { backgroundColor: badge.bg, borderColor: badge.border ?? badge.bg }]}>
            <Txt size={10} weight="black" color={badge.fg} tracking={0.04}>
              {badge.text}
            </Txt>
          </View>
          {log.draft ? (
            <View style={styles.draft}>
              <Txt size={11} weight="bold" color="#6B5310">
                작성 중
              </Txt>
            </View>
          ) : null}
        </View>
        <Txt size={21} style={{ fontFamily: fonts.diaryBold, lineHeight: 24 }} numberOfLines={2}>
          {log.title}
        </Txt>
        <Txt size={12} color={colors.ink2}>
          {log.region} · {log.point}
        </Txt>
        <Txt size={12} weight="medium" color="#34466E" style={{ fontVariant: ["tabular-nums"] }}>
          {log.summary}
        </Txt>
        {log.stickers.length > 0 ? (
          <View style={[styles.row6, { gap: 2, marginTop: 2 }]}>
            {log.stickers.map((k) => (
              <Critter key={k} kind={k} width={40} height={22} />
            ))}
            {log.extraStickers ? (
              <Txt size={12} weight="bold" color={colors.ink2}>
                +{log.extraStickers}
              </Txt>
            ) : null}
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.mist },
  addBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.oceanBlue, alignItems: "center", justifyContent: "center" },
  stats: { flexDirection: "row", gap: 8, marginTop: 14, marginHorizontal: 20 },
  stat: { flex: 1, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 16, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line },
  segment: { flexDirection: "row", marginTop: 14, marginHorizontal: 20, padding: 4, borderRadius: 14, backgroundColor: colors.track },
  segItem: { flex: 1, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  segOn: { backgroundColor: colors.white },
  month: { marginTop: 20, marginBottom: 10, marginHorizontal: 20 },
  card: { flexDirection: "row", alignItems: "center", gap: 14, marginHorizontal: 20, padding: 12, borderRadius: 22, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line },
  stampFrame: { width: 86, height: 104, padding: 5, backgroundColor: "#EAF3FC", borderWidth: 4, borderStyle: "dotted", borderColor: colors.white, shadowColor: "#1E468C", shadowOpacity: 0.16, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  stampInner: { flex: 1, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  glare: { position: "absolute", left: -10, top: -20, width: 26, height: 140, backgroundColor: "rgba(255,255,255,0.12)", transform: [{ rotate: "20deg" }] },
  postmark: { position: "absolute", right: -14, top: -10, width: 44, height: 44, borderRadius: 22, borderWidth: 1.5, borderColor: "#1F4FA8", backgroundColor: "rgba(255,255,255,0.85)", alignItems: "center", justifyContent: "center", transform: [{ rotate: "-12deg" }] },
  row6: { flexDirection: "row", alignItems: "center", gap: 6 },
  badge: { paddingHorizontal: 7, paddingVertical: 1, borderRadius: 6, borderWidth: 1.5 },
  draft: { paddingHorizontal: 7, paddingVertical: 1, borderRadius: 999, backgroundColor: "#FFF7DC", borderWidth: 1, borderColor: "#F3DE95" },
});
