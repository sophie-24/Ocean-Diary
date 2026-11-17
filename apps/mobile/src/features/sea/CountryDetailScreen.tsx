/**
 * 나의 바다 · 국가 상세. Three UI states, driven by what the diver has in that
 * country:
 *
 *   collected       — visited AND at least one species: stats + sites + photos
 *   visited_empty   — visited but 0 species: empty-state + nearby recs + CTA
 *   not_visited     — never logged: notable sites + recs + CTA
 *
 * Every illustration shown comes from `SPECIES_ART` (keys already in the
 * catalog) — no stock imagery, no placeholders.
 */
import { useMemo } from "react";
import { Image, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ChevronLeft, ChevronRight } from "../../components/icons";
import { Txt } from "../../components/ui/Txt";
import { COUNTRY_BY_ISO, type CountryEntry } from "../../data/countries";
import { SPECIES_ART, type CritterKind } from "../../data/illustrations";
import { SITES } from "../../data/sites";
import { SPECIES_BY_NO } from "../../data/species";
import { speciesForCountry } from "../../data/speciesHabitats";
import { usePlaces } from "../../api/queries";
import { colors } from "../../theme/tokens";

type CollectionSummary = {
  visited: boolean;
  uniqueSpecies: number;
  speciesArt: CritterKind[];
  siteLabels: string[];
  logCount: number;
};

function useCollection(country: CountryEntry | undefined): CollectionSummary {
  const { data: places } = usePlaces();
  return useMemo(() => {
    const blank: CollectionSummary = {
      visited: false,
      uniqueSpecies: 0,
      speciesArt: [],
      siteLabels: [],
      logCount: 0,
    };
    if (!country || !places) return blank;

    const speciesIds = new Set<string>();
    const speciesArt = new Set<CritterKind>();
    const siteLabels = new Set<string>();
    let logCount = 0;
    let visited = false;

    for (const place of places) {
      let matches = false;
      for (const label of place.point_labels) {
        const site = SITES.find((s) => s.nameKo === label || s.nameEn === label);
        if (site && site.country === country.nameKo) {
          matches = true;
          break;
        }
      }
      if (!matches && place.region_label.includes(country.nameKo)) matches = true;
      if (!matches) continue;

      visited = true;
      logCount += place.log_count;
      for (const label of place.point_labels) siteLabels.add(label);
      for (const sp of place.species) {
        if (speciesIds.has(sp.species_id)) continue;
        speciesIds.add(sp.species_id);
        const species = SPECIES_BY_NO[sp.species_id];
        if (species?.art) speciesArt.add(species.art);
      }
    }

    return {
      visited,
      uniqueSpecies: speciesIds.size,
      speciesArt: [...speciesArt],
      siteLabels: [...siteLabels],
      logCount,
    };
  }, [country, places]);
}

export function CountryDetailScreen() {
  const router = useRouter();
  const { iso } = useLocalSearchParams<{ iso: string }>();
  const country = iso ? COUNTRY_BY_ISO[iso.toUpperCase()] : undefined;
  const collection = useCollection(country);

  if (!country) {
    return (
      <SafeAreaView edges={["top"]} style={styles.root}>
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="돌아가기"
            onPress={() => router.back()}
            style={styles.hit}
          >
            <ChevronLeft />
          </Pressable>
          <Txt size={16} weight="bold">
            알 수 없는 국가
          </Txt>
        </View>
      </SafeAreaView>
    );
  }

  const state: "collected" | "visited_empty" | "not_visited" = !collection.visited
    ? "not_visited"
    : collection.uniqueSpecies === 0
      ? "visited_empty"
      : "collected";

  return (
    <SafeAreaView edges={["top"]} style={styles.root}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="지도로 돌아가기"
          onPress={() => router.back()}
          style={styles.hit}
        >
          <ChevronLeft />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Txt size={12} weight="extraBold" tracking={0.14} color={colors.oceanBlue}>
            {country.continent.toUpperCase()}
          </Txt>
          <Txt accessibilityRole="header" size={22} weight="black">
            {country.nameKo}
          </Txt>
        </View>
        <View style={styles.flagBubble}>
          <Txt size={28} style={{ lineHeight: 34 }}>
            {country.flag}
          </Txt>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {state === "collected" ? (
          <CollectedView country={country} collection={collection} />
        ) : null}
        {state === "visited_empty" ? (
          <EmptyStateView country={country} onLog={() => router.navigate("/log/new")} />
        ) : null}
        {state === "not_visited" ? (
          <NotVisitedView country={country} onLog={() => router.navigate("/log/new")} />
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

/* ─── State 1: 수집 있음 ──────────────────────────────────────── */
function CollectedView({
  country,
  collection,
}: {
  country: CountryEntry;
  collection: CollectionSummary;
}) {
  return (
    <>
      <View style={styles.statRow}>
        <StatCard label="수집 생물" value={`${collection.uniqueSpecies}종`} />
        <StatCard label="방문 명소" value={`${collection.siteLabels.length}곳`} />
        <StatCard label="그림일기" value={`${collection.logCount}회`} />
      </View>

      {collection.siteLabels.length > 0 ? (
        <Section title={`📍 방문한 다이브 사이트 (${collection.siteLabels.length})`}>
          {collection.siteLabels.map((label) => (
            <View key={label} style={styles.listRow}>
              <View style={styles.listDot} />
              <Txt size={15} weight="bold" style={{ flex: 1 }}>
                {label}
              </Txt>
            </View>
          ))}
        </Section>
      ) : null}

      <Section title={`🐠 여기서 만난 친구들 (${collection.speciesArt.length})`}>
        <View style={styles.speciesGrid}>
          {collection.speciesArt.map((artKey) => (
            <SpeciesTile key={artKey} artKey={artKey} />
          ))}
        </View>
      </Section>

      <Txt size={12} color={colors.ink2} align="center" style={{ marginTop: 24 }}>
        {country.nameKo}에서 만난 친구들 · 그림일기 {collection.logCount}회
      </Txt>
    </>
  );
}

/* ─── State 2: 방문했지만 0종 ─────────────────────────────────── */
function EmptyStateView({
  country,
  onLog,
}: {
  country: CountryEntry;
  onLog: () => void;
}) {
  const recommended = speciesForCountry(country.iso).slice(0, 6);
  return (
    <>
      <View style={styles.hero}>
        <Txt size={18} weight="black" align="center">
          아직 수집한 생물이 없어요
        </Txt>
        <Txt size={14} color={colors.ink2} align="center" style={{ marginTop: 6 }}>
          {country.nameKo}에서 만난 친구를 기록해 보세요
        </Txt>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="로그 작성하기"
          onPress={onLog}
          style={styles.cta}
        >
          <Txt size={15} weight="extraBold" color={colors.white}>
            + 로그 작성하기
          </Txt>
        </Pressable>
      </View>

      {recommended.length > 0 ? (
        <Section title="✨ 여기서 자주 만나는 친구들">
          <View style={styles.speciesGrid}>
            {recommended.map((artKey) => (
              <SpeciesTile key={artKey} artKey={artKey} dimmed />
            ))}
          </View>
          <Txt size={12} color={colors.ink2} style={styles.recNote}>
            다이빙 가이드와 다이버 리포트 기반 추천
          </Txt>
        </Section>
      ) : null}
    </>
  );
}

/* ─── State 3: 미방문 ────────────────────────────────────────── */
function NotVisitedView({
  country,
  onLog,
}: {
  country: CountryEntry;
  onLog: () => void;
}) {
  const recommended = speciesForCountry(country.iso).slice(0, 6);
  const notableSites = country.notableSites ?? [];
  return (
    <>
      <View style={styles.hero}>
        <Txt size={18} weight="black" align="center">
          아직 다녀오지 않았어요
        </Txt>
        <Txt size={14} color={colors.ink2} align="center" style={{ marginTop: 6 }}>
          {notableSites.length > 0
            ? "다이빙으로 유명한 지역이에요"
            : "다음 다이빙 목적지로 어떠세요?"}
        </Txt>
      </View>

      {notableSites.length > 0 ? (
        <Section title="📍 주요 다이빙 포인트">
          {notableSites.map((label) => (
            <View key={label} style={styles.listRow}>
              <View style={styles.listDot} />
              <Txt size={15} weight="bold" style={{ flex: 1 }}>
                {label}
              </Txt>
            </View>
          ))}
        </Section>
      ) : null}

      {recommended.length > 0 ? (
        <Section title="🐠 여기서 만날 수 있는 친구들">
          <View style={styles.speciesGrid}>
            {recommended.map((artKey) => (
              <SpeciesTile key={artKey} artKey={artKey} dimmed />
            ))}
          </View>
          <Txt size={12} color={colors.ink2} style={styles.recNote}>
            다이빙 가이드와 다이버 리포트 기반 추천
          </Txt>
        </Section>
      ) : null}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="로그 작성하기"
        onPress={onLog}
        style={[styles.cta, { marginTop: 20, marginHorizontal: 16 }]}
      >
        <Txt size={15} weight="extraBold" color={colors.white}>
          + 로그 작성하기
        </Txt>
      </Pressable>
    </>
  );
}

/* ─── Small building blocks ──────────────────────────────────── */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Txt size={13} weight="extraBold" color={colors.ink2} style={styles.sectionTitle}>
        {title}
      </Txt>
      {children}
    </View>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statCard}>
      <Txt size={11} color={colors.ink2}>
        {label}
      </Txt>
      <Txt size={18} weight="black" color={colors.oceanBlue} style={{ marginTop: 2 }}>
        {value}
      </Txt>
    </View>
  );
}

function SpeciesTile({ artKey, dimmed = false }: { artKey: CritterKind; dimmed?: boolean }) {
  return (
    <View style={[styles.speciesCard, dimmed && styles.speciesCardDim]}>
      <Image
        source={SPECIES_ART[artKey]}
        style={styles.speciesImg}
        resizeMode="contain"
        accessibilityIgnoresInvertColors
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.mist },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingBottom: 6,
  },
  hit: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  flagBubble: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#DFEBFC",
    borderWidth: 1.5,
    borderColor: colors.oceanBlue,
    alignItems: "center",
    justifyContent: "center",
  },
  scroll: { paddingBottom: 48 },
  statRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    marginTop: 10,
  },
  statCard: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: "center",
  },
  section: { paddingHorizontal: 16, paddingTop: 20 },
  sectionTitle: { marginBottom: 10, paddingHorizontal: 4 },
  listRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 6,
    backgroundColor: colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.line,
  },
  listDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.oceanBlue,
  },
  speciesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  speciesCard: {
    width: "31%",
    aspectRatio: 1,
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
  },
  speciesCardDim: {
    opacity: 0.75,
    backgroundColor: colors.mist,
  },
  speciesImg: { width: "100%", height: "100%" },
  hero: {
    marginHorizontal: 16,
    marginTop: 14,
    padding: 20,
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: "center",
  },
  cta: {
    marginTop: 16,
    height: 50,
    paddingHorizontal: 24,
    borderRadius: 14,
    backgroundColor: colors.navy,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 180,
  },
  recNote: { marginTop: 10, paddingHorizontal: 6 },
});
