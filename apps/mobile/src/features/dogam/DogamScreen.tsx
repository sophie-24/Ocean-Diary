import { useMemo, useState } from "react";
import { FlatList, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Svg, { Circle, Path } from "react-native-svg";
import { ChevronDown, ChevronRight } from "../../components/icons";
import { Txt } from "../../components/ui/Txt";
import { SPECIES, SPECIES_GROUPS, TOTAL_SPECIES, type SpeciesEntry } from "../../data/species";
import { SITES, SITE_CATEGORIES, type SiteEntry } from "../../data/sites";
import { useCollection, useSiteStamps } from "../../api/queries";
import { StateView } from "../../components/ui/StateView";
import { colors } from "../../theme/tokens";
import { MapBookTabs, type MapBookTab } from "./MapBookTabs";
import { SpeciesCard } from "./SpeciesCard";
import { SiteStampCard } from "./SiteStampCard";

type Book = "species" | "sites";
const ALL = "전체";
const MILESTONE_STEP = 10;

type DogamScreenProps = { mapBookTab?: { active: MapBookTab; onChange: (tab: MapBookTab) => void } };

export function DogamScreen({ mapBookTab }: DogamScreenProps = {}) {
  const router = useRouter();
  const [book, setBook] = useState<Book>("species");
  const [group, setGroup] = useState(ALL);
  const [siteCat, setSiteCat] = useState(ALL);
  

  const collectionQuery = useCollection();
  const stampsQuery = useSiteStamps();
  const collected = useMemo(() => collectionQuery.data ?? new Map(), [collectionQuery.data]);
  const stamps = useMemo(() => stampsQuery.data ?? new Map<string, string>(), [stampsQuery.data]);
  const sites = useMemo(() => SITES.map((s) => ({ ...s, collectedOn: stamps.get(s.no) ?? null })), [stamps]);
  const gotCount = collected.size;
  const sitesGot = sites.filter((s) => s.collectedOn).length;

  const groupChips = useMemo(
    () =>
      [ALL, ...SPECIES_GROUPS].map((g) => {
        const inGroup = g === ALL ? SPECIES : SPECIES.filter((s) => s.group === g);
        return { label: g, count: `${inGroup.filter((s) => collected.has(s.no)).length}/${inGroup.length}` };
      }),
    [collected],
  );
  const siteChips = useMemo(
    () =>
      [ALL, ...SITE_CATEGORIES].map((c) => {
        const inCat = c === ALL ? sites : sites.filter((s) => s.category === c);
        return { label: c, count: `${inCat.filter((s) => s.collectedOn).length}/${inCat.length}` };
      }),
    [sites],
  );

  const speciesItems = useMemo(
    () => SPECIES.filter((s) => group === ALL || s.group === group),
    [group],
  );
  const siteItems = useMemo(() => sites.filter((s) => siteCat === ALL || s.category === siteCat), [siteCat, sites]);

  const nextMilestone = Math.ceil((gotCount + 1) / MILESTONE_STEP) * MILESTONE_STEP;
  const pct = Math.round((gotCount / TOTAL_SPECIES) * 100);

  const header = (
    <View>
      <View style={styles.titleRow}>
        <Txt accessibilityRole="header" size={26} weight="bold" tracking={-0.02}>
          도감
        </Txt>
        <View style={styles.actions}>
          <Pressable accessibilityRole="button" accessibilityLabel={book === "species" ? "생물 검색" : "명소 검색"} style={styles.iconBtn} hitSlop={4}>
            <Svg width={20} height={20} viewBox="0 0 24 24">
              <Circle cx={11} cy={11} r={6.5} fill="none" stroke={colors.navy} strokeWidth={2} />
              <Path d="M16 16 L20.5 20.5" stroke={colors.navy} strokeWidth={2} strokeLinecap="round" />
            </Svg>
          </Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel="배지 모음" style={styles.iconBtn} hitSlop={4}>
            <Svg width={20} height={20} viewBox="0 0 24 24">
              <Circle cx={12} cy={9} r={5.5} fill="none" stroke={colors.navy} strokeWidth={1.9} />
              <Path d="M8.5 13.5 L7 21 L12 18.5 L17 21 L15.5 13.5" fill="none" stroke={colors.navy} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </Pressable>
        </View>
      </View>

      {mapBookTab ? (
        <View style={styles.mapBookWrap}>
          <MapBookTabs active={mapBookTab.active} onChange={mapBookTab.onChange} />
        </View>
      ) : null}

      <View accessibilityRole="tablist" style={styles.segment}>
        {(
          [
            ["species", "바다 생물", `${gotCount}/${TOTAL_SPECIES}`],
            ["sites", "명소 스탬프", `${sitesGot}/${SITES.length}`],
          ] as const
        ).map(([key, label, count]) => {
          const on = book === key;
          return (
            <Pressable
              key={key}
              accessibilityRole="tab"
              accessibilityState={{ selected: on }}
              onPress={() => setBook(key)}
              style={[styles.segItem, on && styles.segOn]}
            >
              <Txt size={13} weight="bold" color={on ? colors.navy : colors.ink2}>
                {label}
              </Txt>
              <Txt size={13} weight="medium" color={colors.ink2}>
                {count}
              </Txt>
            </Pressable>
          );
        })}
      </View>

      {book === "species" ? (
        <>
          <View style={styles.progressRow}>
            <Txt size={20} weight="bold" color={colors.oceanBlue}>
              {gotCount}
            </Txt>
            <Txt size={14} color={colors.ink3}>
              / {TOTAL_SPECIES}종
            </Txt>
            <Txt size={12} color={colors.ink2} style={{ marginLeft: "auto" }}>
              {nextMilestone - gotCount}종 더 모으면{" "}
              <Txt size={12} weight="bold" color={colors.navy}>
                {nextMilestone}종 기념 카드
              </Txt>
            </Txt>
          </View>
          <View
            style={styles.track}
            accessibilityRole="progressbar"
            accessibilityValue={{ min: 0, max: TOTAL_SPECIES, now: gotCount, text: `${pct}%` }}
          >
            <View style={[styles.fill, { width: `${pct}%` }]} />
          </View>
        </>
      ) : (
        <Txt size={13} color={colors.ink2} style={styles.sitesIntro}>
          난파선, 수중 조각, 동굴처럼 생물이 아닌 이유로 찾아가는 다이빙 명소예요. 로그에 포인트를 적으면 스탬프가 찍혀요.
        </Txt>
      )}

      {mapBookTab ? (
        <Pressable
          // `/discover/autogen` is a new route — expo-router typed routes regenerate
          // on the next `pnpm expo start`. Cast narrows the gap until then.
          onPress={() => router.navigate("/discover/autogen" as never)}
          accessibilityRole="button"
          accessibilityLabel="자동 생성 1건 검증 대기, 관리자가 일주일 안에 확인해요"
          style={styles.pendingBanner}
        >
          <View style={styles.pendingBadge}>
            <Txt size={14} style={{ lineHeight: 18 }}>✨</Txt>
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Txt size={12} weight="bold" color={colors.navy} style={{ lineHeight: 17 }}>
              자동 생성 1건 검증 대기
            </Txt>
            <Txt size={12} color={colors.ink2} style={{ lineHeight: 17 }}>
              관리자가 일주일 안에 확인해요
            </Txt>
          </View>
          <ChevronRight size={12} color={colors.ink3} strokeWidth={2.5} />
        </Pressable>
      ) : null}

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips} accessibilityRole="tablist">
        {(book === "species" ? groupChips : siteChips).map((c) => {
          const on = (book === "species" ? group : siteCat) === c.label;
          return (
            <Pressable
              key={c.label}
              accessibilityRole="tab"
              accessibilityState={{ selected: on }}
              accessibilityLabel={`${c.label} ${c.count}`}
              onPress={() => (book === "species" ? setGroup(c.label) : setSiteCat(c.label))}
              style={[styles.chip, on ? styles.chipOn : styles.chipOff]}
            >
              <Txt size={13} weight="bold" color={on ? colors.white : colors.navy}>
                {c.label}{" "}
                <Txt size={13} weight="medium" color={on ? colors.white : colors.navy} style={{ opacity: 0.7 }}>
                  {c.count}
                </Txt>
              </Txt>
            </Pressable>
          );
        })}
      </ScrollView>

      {book === "species" ? (
        <View style={styles.sortRow}>
          <View style={styles.sortBtn}>
            <Txt size={13} weight="bold">
              도감 번호순
            </Txt>
            <ChevronDown size={14} color={colors.navy} />
          </View>

        </View>
      ) : (
        <View style={{ height: 12 }} />
      )}
    </View>
  );

  return (
    <SafeAreaView edges={["top"]} style={styles.root}>
      {book === "species" ? (
        <FlatList<SpeciesEntry>
          key="species"
          data={speciesItems}
          keyExtractor={(s) => s.no}
          numColumns={2}
          ListHeaderComponent={header}
          columnWrapperStyle={styles.columns}
          contentContainerStyle={styles.list}
          initialNumToRender={8}
          windowSize={7}
          ListFooterComponent={<StateView error={collectionQuery.error} onRetry={() => void collectionQuery.refetch()} />}
          refreshing={collectionQuery.isRefetching}
          onRefresh={() => void collectionQuery.refetch()}
          renderItem={({ item }) => {
            const mark = collected.get(item.no);
            return (
              <SpeciesCard
                species={item}
                collected={!!mark}
                collectedDate={mark?.firstSeen ?? null}
                isNew={mark?.isNew}
                onPress={() => router.push({ pathname: "/species/[no]", params: { no: item.no } })}
              />
            );
          }}
        />
      ) : (
        <FlatList<SiteEntry>
          key="sites"
          data={siteItems}
          keyExtractor={(s) => s.no}
          numColumns={2}
          ListHeaderComponent={header}
          columnWrapperStyle={styles.columns}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => <SiteStampCard site={item} />}
          ListFooterComponent={<StateView error={stampsQuery.error} onRetry={() => void stampsQuery.refetch()} />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.mist },
  list: { paddingTop: 12, paddingBottom: 32, gap: 10 },
  columns: { gap: 10, paddingHorizontal: 20 },
  titleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 8 },
  actions: { flexDirection: "row", gap: 4 },
  iconBtn: { width: 40, height: 40, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  mapBookWrap: { marginTop: 14, paddingHorizontal: 20 },
  segment: { flexDirection: "row", marginTop: 8, marginHorizontal: 20, padding: 3, borderRadius: 10, backgroundColor: "#EDF2F9" },
  segItem: { flex: 1, height: 34, borderRadius: 7, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 },
  segOn: { backgroundColor: colors.white },
  progressRow: { flexDirection: "row", alignItems: "baseline", gap: 8, marginTop: 16, marginHorizontal: 20 },
  track: { height: 4, borderRadius: 2, backgroundColor: colors.line, overflow: "hidden", marginTop: 8, marginHorizontal: 20 },
  fill: { height: 4, borderRadius: 2, backgroundColor: colors.oceanBlue },
  pendingBanner: {
    marginHorizontal: 20,
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: "#FFFBEB",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  pendingBadge: { width: 28, height: 28, borderRadius: 8, backgroundColor: "#FDE68A", alignItems: "center", justifyContent: "center" },
  sitesIntro: { marginTop: 12, marginHorizontal: 20 },
  chips: { gap: 6, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 2 },
  chip: { height: 36, paddingHorizontal: 14, borderRadius: 8, justifyContent: "center" },
  chipOn: { backgroundColor: colors.navy },
  chipOff: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line },
  sortRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 6, paddingBottom: 8 },
  sortBtn: { flexDirection: "row", alignItems: "center", gap: 4, paddingVertical: 8 },
});
