import { useMemo, useState } from "react";
import { FlatList, Pressable, ScrollView, StyleSheet, Switch, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Svg, { Circle, Path } from "react-native-svg";
import { ScreenHeader, RoundIconButton } from "../../components/ui/ScreenHeader";
import { Chip } from "../../components/ui/Chip";
import { Txt } from "../../components/ui/Txt";
import { SPECIES, SPECIES_GROUPS, TOTAL_SPECIES, type SpeciesEntry } from "../../data/species";
import { SITES, SITE_CATEGORIES, type SiteEntry } from "../../data/sites";
import { MOCK_COLLECTION } from "../../mocks/collection";
import { colors } from "../../theme/tokens";
import { SpeciesCard } from "./SpeciesCard";
import { SiteStampCard } from "./SiteStampCard";

type Book = "species" | "sites";
const ALL = "전체";
const MILESTONE_STEP = 10;

export function DogamScreen() {
  const router = useRouter();
  const [book, setBook] = useState<Book>("species");
  const [group, setGroup] = useState(ALL);
  const [siteCat, setSiteCat] = useState(ALL);
  const [showHidden, setShowHidden] = useState(true);

  const collected = useMemo(() => new Map(MOCK_COLLECTION.map((c) => [c.no, c])), []);
  const gotCount = collected.size;
  const sitesGot = SITES.filter((s) => s.collectedOn).length;

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
        const inCat = c === ALL ? SITES : SITES.filter((s) => s.category === c);
        return { label: c, count: `${inCat.filter((s) => s.collectedOn).length}/${inCat.length}` };
      }),
    [],
  );

  const speciesItems = useMemo(
    () => SPECIES.filter((s) => (group === ALL || s.group === group) && (showHidden || collected.has(s.no))),
    [group, showHidden, collected],
  );
  const siteItems = useMemo(() => SITES.filter((s) => siteCat === ALL || s.category === siteCat), [siteCat]);

  const nextMilestone = Math.ceil((gotCount + 1) / MILESTONE_STEP) * MILESTONE_STEP;
  const pct = Math.round((gotCount / TOTAL_SPECIES) * 100);

  const header = (
    <View>
      <ScreenHeader
        eyebrow={book === "species" ? "MY SPECIES BOOK" : "MY DIVE PASSPORT"}
        title="나의 도감"
        actions={
          <>
            <RoundIconButton label={book === "species" ? "생물 검색" : "명소 검색"}>
              <Svg width={20} height={20} viewBox="0 0 24 24">
                <Circle cx={11} cy={11} r={6.5} fill="none" stroke={colors.navy} strokeWidth={2} />
                <Path d="M16 16 L20.5 20.5" stroke={colors.navy} strokeWidth={2} strokeLinecap="round" />
              </Svg>
            </RoundIconButton>
          </>
        }
      />

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
              <Txt size={14} weight={on ? "black" : "bold"} color={on ? colors.navy : colors.ink2}>
                {label}{" "}
                <Txt size={14} weight="medium" color={colors.ink2}>
                  {count}
                </Txt>
              </Txt>
            </Pressable>
          );
        })}
      </View>

      {book === "species" ? (
        <View style={styles.progress}>
          <Txt size={26} weight="black" color={colors.oceanBlue}>
            {gotCount}
            <Txt size={14} color={colors.ink2}>
              {" "}
              / {TOTAL_SPECIES}종
            </Txt>
          </Txt>
          <View style={{ flex: 1, gap: 6 }}>
            <View
              style={styles.track}
              accessibilityRole="progressbar"
              accessibilityValue={{ min: 0, max: TOTAL_SPECIES, now: gotCount, text: `${pct}%` }}
            >
              <View style={[styles.fill, { width: `${pct}%` }]} />
            </View>
            <Txt size={12} color={colors.ink2}>
              {nextMilestone - gotCount}종 더 모으면{" "}
              <Txt size={12} weight="bold">
                {nextMilestone}종 기념 카드
              </Txt>
              를 받아요
            </Txt>
          </View>
        </View>
      ) : (
        <Txt size={13} color={colors.ink2} style={styles.sitesIntro}>
          난파선, 수중 조각, 동굴처럼 생물이 아닌 이유로 찾아가는 다이빙 명소예요. 로그에 포인트를 적으면 스탬프가 찍혀요.
        </Txt>
      )}

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips} accessibilityRole="tablist">
        {(book === "species" ? groupChips : siteChips).map((c) => (
          <Chip
            key={c.label}
            label={c.label}
            count={c.count}
            selected={(book === "species" ? group : siteCat) === c.label}
            onPress={() => (book === "species" ? setGroup(c.label) : setSiteCat(c.label))}
          />
        ))}
      </ScrollView>

      {book === "species" ? (
        <View style={styles.sortRow}>
          <Txt size={13} weight="extraBold">
            도감 번호순
          </Txt>
          <View style={styles.toggle}>
            <Txt size={13} color={colors.ink2}>
              미수집도 보기
            </Txt>
            <Switch
              value={showHidden}
              onValueChange={setShowHidden}
              trackColor={{ true: colors.oceanBlue, false: colors.lineStrong }}
              accessibilityLabel="미수집 생물도 보기"
            />
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
          renderItem={({ item }) => {
            const mark = collected.get(item.no);
            return (
              <SpeciesCard
                species={item}
                collected={!!mark}
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
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.mist },
  list: { paddingTop: 12, paddingBottom: 32, gap: 10 },
  columns: { gap: 10, paddingHorizontal: 20 },
  segment: { flexDirection: "row", marginTop: 14, marginHorizontal: 20, padding: 4, borderRadius: 14, backgroundColor: colors.track },
  segItem: { flex: 1, height: 40, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  segOn: { backgroundColor: colors.white, shadowColor: "#1E468C", shadowOpacity: 0.12, shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
  progress: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginTop: 14,
    marginHorizontal: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
  },
  track: { height: 8, borderRadius: 4, backgroundColor: colors.track, overflow: "hidden" },
  fill: { height: 8, borderRadius: 4, backgroundColor: colors.oceanBlue },
  sitesIntro: { marginTop: 12, marginHorizontal: 20 },
  chips: { gap: 8, paddingHorizontal: 20, paddingTop: 14, paddingBottom: 2 },
  sortRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 8, paddingBottom: 8 },
  toggle: { flexDirection: "row", alignItems: "center", gap: 8 },
});
