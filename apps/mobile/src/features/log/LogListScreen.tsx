import { useMemo, useState } from "react";
import { Pressable, SectionList, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Critter } from "../../components/Critter";
import { PlusIcon, StampBookIcon } from "../../components/icons";
import { RoundIconButton } from "../../components/ui/ScreenHeader";
import { Txt } from "../../components/ui/Txt";
import { colors } from "../../theme/tokens";
import { SPECIES } from "../../data/species";
import { logStats, type DiveLog, type LogKind } from "./logStore";
import { useDiveLogs } from "../../api/queries";
import { StateView } from "../../components/ui/StateView";
import { LogbookOnboarding } from "./LogbookOnboarding";

type Filter = "all" | LogKind;

const TYPE_BADGE: Record<LogKind, { text: string; bg: string; fg: string; border?: string }> = {
  scuba: { text: "스쿠버", bg: colors.navy, fg: colors.white },
  free: { text: "프리", bg: colors.white, fg: colors.oceanBlue, border: colors.oceanBlue },
  snorkel: { text: "스노클", bg: "#FFF4D1", fg: "#8A5A00" },
};

const SPECIES_NAME: Record<string, string> = {};
SPECIES.forEach((sp) => {
  if (sp.art && !SPECIES_NAME[sp.art]) SPECIES_NAME[sp.art] = sp.nameKo;
});

export function LogListScreen() {
  const router = useRouter();
  const { data, isLoading, error, refetch, isRefetching } = useDiveLogs();
  const logs = useMemo(() => data?.logs ?? [], [data]);
  const counts = data?.counts ?? { scuba: 0, free: 0, snorkel: 0 };
  const stats = logStats(logs);
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
      <View style={styles.headerRow}>
        <Txt accessibilityRole="header" size={26} weight="black" tracking={-0.02}>
          로그북
        </Txt>
        <View style={styles.actions}>
          <RoundIconButton label="우표첩 보기로 바꾸기">
            <StampBookIcon />
          </RoundIconButton>
          <Pressable accessibilityRole="button" accessibilityLabel="새 다이빙 기록 쓰기" onPress={() => router.push("/log/new")} style={styles.addBtn}>
            <PlusIcon />
          </Pressable>
        </View>
      </View>
      <View style={styles.stats}>
        {(
          [
            ["총 다이빙", `${counts.scuba}회`],
            ["누적", stats.time],
            ["최대", stats.maxDepth],
          ] as const
        ).map(([k, v]) => (
          <Txt key={k} size={13} color={colors.ink2}>
            {k + " "}
            <Txt size={15} weight="black">
              {v}
            </Txt>
          </Txt>
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
          <Txt accessibilityRole="header" size={13} weight="bold" color={colors.ink3} tracking={0.02} style={styles.month}>
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
        refreshing={isRefetching}
        onRefresh={() => void refetch()}
        ListEmptyComponent={
          isLoading ? (
            <StateView loading />
          ) : error && !data ? (
            <StateView error={error} onRetry={() => void refetch()} />
          ) : (
            <LogbookOnboarding onStart={() => router.push('/log/new')} onSkip={() => {}} />
          )
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
            <Critter kind={log.coverKind} width={70} height={46} />
          </View>
        </View>
        <View style={styles.postmark}>
          <Txt size={9} weight="bold" color={colors.oceanBlue} tracking={0.04} style={{ lineHeight: 10 }}>
            {`${Number(m)}월`}
          </Txt>
          <Txt size={13} weight="black" color={colors.oceanBlue} style={{ lineHeight: 14 }}>
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
        <Txt size={15} weight="bold" tracking={-0.01} style={{ lineHeight: 19 }} numberOfLines={2}>
          {log.title}
        </Txt>
        <Txt size={12} color={colors.ink3} style={{ fontVariant: ["tabular-nums"] }}>
          {log.summary}
        </Txt>
        {log.stickers.length > 0 ? (
          <View style={[styles.row6, { marginTop: 2, flexWrap: "wrap" }]}>
            {log.stickers.map((k) => (
              <View key={k} style={styles.row3}>
                <Critter kind={k} width={24} height={14} />
                {SPECIES_NAME[k] ? (
                  <Txt size={11} weight="medium" color={colors.ink2}>
                    {SPECIES_NAME[k]}
                  </Txt>
                ) : null}
              </View>
            ))}
            {log.extraStickers ? (
              <Txt size={11} weight="medium" color={colors.ink3}>
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
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20 },
  actions: { flexDirection: "row", gap: 8 },
  addBtn: { width: 44, height: 44, borderRadius: 10, backgroundColor: colors.oceanBlue, alignItems: "center", justifyContent: "center" },
  stats: { flexDirection: "row", gap: 16, marginTop: 14, marginHorizontal: 20 },
  segment: { flexDirection: "row", marginTop: 14, marginHorizontal: 20, padding: 4, borderRadius: 10, backgroundColor: colors.line },
  segItem: { flex: 1, height: 36, borderRadius: 7, alignItems: "center", justifyContent: "center" },
  segOn: { backgroundColor: colors.white },
  month: { marginTop: 20, marginBottom: 10, marginHorizontal: 20 },
  card: { flexDirection: "row", alignItems: "center", gap: 14, marginHorizontal: 20, padding: 12, borderRadius: 12, backgroundColor: colors.white },
  stampFrame: { width: 86, height: 104, padding: 5, backgroundColor: colors.sky, borderWidth: 4, borderStyle: "dotted", borderColor: colors.white },
  stampInner: { flex: 1, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  postmark: { position: "absolute", right: -14, top: -10, width: 44, height: 44, borderRadius: 22, borderWidth: 1.5, borderColor: colors.oceanBlue, backgroundColor: "rgba(255,255,255,0.9)", alignItems: "center", justifyContent: "center", transform: [{ rotate: "-12deg" }] },
  row6: { flexDirection: "row", alignItems: "center", gap: 6 },
  row3: { flexDirection: "row", alignItems: "center", gap: 3 },
  badge: { paddingHorizontal: 7, paddingVertical: 1, borderRadius: 4, borderWidth: 1.5 },
  draft: { paddingHorizontal: 7, paddingVertical: 1, borderRadius: 4, backgroundColor: "#FFF7DC" },
});
