import { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Animated, { FadeInDown, runOnJS } from "react-native-reanimated";
import { GestureDetector, usePanGesture, usePinchGesture, useSimultaneousGestures } from "react-native-gesture-handler";
import Svg, { Path } from "react-native-svg";
import mapData from "../../../../../data/map/world-map.json";
import { Critter } from "../../components/Critter";
import { ChevronLeft, ChevronRight, CloseIcon, SearchIcon } from "../../components/icons";
import { Txt } from "../../components/ui/Txt";
import { isCritterKind, type CritterKind } from "../../data/illustrations";
import { CONTINENTS, COUNTRIES, type Continent, type CountryEntry, findCountry } from "../../data/countries";
import { SITES } from "../../data/sites";
import { usePlaces } from "../../api/queries";
import { MapBookTabs, type MapBookTab } from "../dogam/MapBookTabs";
import { colors, fonts } from "../../theme/tokens";

type Mode = "world" | "ph" | "au";
type VB = [number, number, number, number];
type Region = { k: keyof typeof mapData.P; name: string; n: number; meta: string; logs: number; sites: number; kinds: CritterKind[]; mode: Mode; tank?: string };

type Known = { k: Region["k"]; name: string; area: string; country: string; aliases: string[]; mode: Mode; tank?: string };

// Dive regions the map can pin (coordinates live in world-map.json → P). The diver's
// logs are matched by region label; we never store GPS.
const KNOWN: Known[] = [
  { k: "malapascua", name: "말라파스쿠아", area: "세부 북쪽", country: "필리핀", aliases: ["말라파스쿠아", "malapascua"], mode: "ph", tank: "malapascua" },
  { k: "moalboal", name: "모알보알", area: "세부 남서쪽", country: "필리핀", aliases: ["모알보알", "moalboal"], mode: "ph" },
  { k: "balicasag", name: "발리카삭", area: "보홀", country: "필리핀", aliases: ["발리카삭", "balicasag", "보홀", "bohol"], mode: "ph" },
  { k: "anilao", name: "아닐라오", area: "바탕가스", country: "필리핀", aliases: ["아닐라오", "anilao", "바탕가스"], mode: "ph" },
  { k: "tubbataha", name: "투바타하", area: "술루해 리브어보드", country: "필리핀", aliases: ["투바타하", "tubbataha"], mode: "ph" },
  { k: "lizard", name: "리저드섬", area: "그레이트배리어리프", country: "호주", aliases: ["리저드", "lizard"], mode: "au" },
  { k: "heron", name: "헤론섬", area: "그레이트배리어리프", country: "호주", aliases: ["헤론", "heron"], mode: "au" },
];
const COUNTRY_ID: Record<Exclude<Mode, "world">, string> = { ph: "608", au: "036" };

const fmtRange = (a: string, b: string) => {
  const d = (x: string) => x.replace(/-/g, ".");
  return a === b ? d(a) : `${d(a)} – ${d(b).slice(5)}`;
};

/** Group the diver's places (GET /v1/places) onto the known map regions. */
function useRegions() {
  const { data: places } = usePlaces();
  return useMemo(() => {
    const regions: Region[] = [];
    for (const known of KNOWN) {
      const hits = (places ?? []).filter((p) => known.aliases.some((a) => p.region_label.toLowerCase().includes(a.toLowerCase())));
      if (!hits.length) continue;
      const species = new Map<string, string | null>();
      for (const h of hits) for (const sp of h.species) species.set(sp.species_id, sp.art_key);
      const first = hits.map((h) => h.first_date).sort()[0];
      const last = hits.map((h) => h.last_date).sort().at(-1) ?? first;
      regions.push({
        k: known.k,
        name: known.name,
        n: species.size,
        meta: `${known.area} · ${fmtRange(first, last)}`,
        logs: hits.reduce((n, h) => n + h.log_count, 0),
        sites: hits.reduce((n, h) => n + h.stamp_count, 0),
        kinds: [...species.values()].filter((a): a is CritterKind => !!a && isCritterKind(a)).slice(0, 8),
        mode: known.mode,
        tank: known.tank,
      });
    }
    return regions;
  }, [places]);
}

const pad = (b: number[][], k: number): VB => {
  const [[x0, y0], [x1, y1]] = b;
  const w = x1 - x0;
  const h = y1 - y0;
  return [x0 - w * k, y0 - h * k, w * (1 + 2 * k), h * (1 + 2 * k)];
};
const FRAMES: Record<Mode, VB> = {
  world: [0, 0, mapData.W, mapData.H],
  ph: pad(mapData.phBox, 0.25),
  au: pad(mapData.auBox, 0.12),
};

const DETAIL_IDS = new Set<string>(mapData.detail.map((c) => c.id ?? ""));

/** Fit the requested frame into the view's aspect ratio (keeps centre). */
const fit = (vb: VB, aspect: number): VB => {
  const [x, y, w, h] = vb;
  const cx = x + w / 2;
  const cy = y + h / 2;
  const nw = Math.max(w, h * aspect);
  const nh = nw / aspect;
  return [cx - nw / 2, cy - nh / 2, nw, nh];
};

type SeaMapScreenProps = { mapBookTab?: { active: MapBookTab; onChange: (tab: MapBookTab) => void } };

export function SeaMapScreen({ mapBookTab }: SeaMapScreenProps = {}) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const regions = useRegions();
  const [size, setSize] = useState({ w: 390, h: 600 });
  const aspect = size.w / size.h;
  const [mode, setMode] = useState<Mode>("world");
  const [vb, setVb] = useState<VB>(() => fit(FRAMES.world, 390 / 600));
  const [sel, setSel] = useState<Region["k"] | null>(null);
  const [q, setQ] = useState("");
  const [focus, setFocus] = useState(false);
  const [searchContinent, setSearchContinent] = useState<Continent | "all">("all");
  const raf = useRef<number | null>(null);
  const start = useRef<VB>(vb);

  const go = (m: Mode, s: Region["k"] | null = null) => {
    setMode(m);
    setSel(s);
    setFocus(false);
    const from = vb;
    const to = fit(FRAMES[m], aspect);
    const t0 = Date.now();
    if (raf.current) cancelAnimationFrame(raf.current);
    const step = () => {
      const t = Math.min(1, (Date.now() - t0) / 520);
      const e = 1 - Math.pow(1 - t, 3);
      setVb(from.map((v, i) => v + (to[i] - v) * e) as VB);
      if (t < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
  };
  useEffect(() => () => (raf.current ? cancelAnimationFrame(raf.current) : undefined), []);
  useEffect(() => {
    setVb(fit(FRAMES[mode], aspect));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aspect]);

  const beginGesture = () => {
    start.current = vb;
  };
  const panTo = (tx: number, ty: number) => {
    const [x, y, w, h] = start.current;
    setVb([x - (tx * w) / size.w, y - (ty * h) / size.h, w, h]);
  };
  const zoomTo = (scale: number) => {
    const [x, y, w, h] = start.current;
    const nw = Math.min(mapData.W * 1.2, Math.max(18, w / scale));
    const nh = nw / aspect;
    setVb([x + w / 2 - nw / 2, y + h / 2 - nh / 2, nw, nh]);
  };
  const pan = usePanGesture({
    onBegin: () => {
      "worklet";
      runOnJS(beginGesture)();
    },
    onUpdate: (e) => {
      "worklet";
      runOnJS(panTo)(e.translationX, e.translationY);
    },
  });
  const pinch = usePinchGesture({
    onBegin: () => {
      "worklet";
      runOnJS(beginGesture)();
    },
    onUpdate: (e) => {
      "worklet";
      runOnJS(zoomTo)(e.scale);
    },
  });
  const gesture = useSimultaneousGestures(pan, pinch);

  const zoomed = vb[2] < mapData.W * 0.5;
  const land = useMemo(
    () => (zoomed ? [...mapData.world.filter((c) => !c.sea && !DETAIL_IDS.has(c.id ?? "")), ...mapData.detail] : mapData.world),
    [zoomed],
  );
  const toScreen = (p: number[]) => [((p[0] - vb[0]) * size.w) / vb[2], ((p[1] - vb[1]) * size.h) / vb[3]];
  const visitedIds = useMemo(() => new Set(regions.map((r) => COUNTRY_ID[r.mode as Exclude<Mode, "world">])), [regions]);
  const visitedCountries = visitedIds.size;
  const region = regions.find((r) => r.k === sel);
  // How many unique species the diver has collected per country (keyed by ISO).
  const collectedByIso = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of regions) {
      const iso = r.mode === "ph" ? "PH" : r.mode === "au" ? "AU" : null;
      if (!iso) continue;
      map.set(iso, (map.get(iso) ?? 0) + r.n);
    }
    return map;
  }, [regions]);

  // Full country list filtered by continent chip + search text. Shown as an
  // overlay below the search bar whenever the field is focused.
  const countryResults = useMemo(() => {
    const trimmed = q.trim().toLowerCase();
    return COUNTRIES.filter(
      (c) =>
        (searchContinent === "all" || c.continent === searchContinent) &&
        (!trimmed ||
          c.nameKo.toLowerCase().includes(trimmed) ||
          c.nameEn.toLowerCase().includes(trimmed) ||
          c.iso === trimmed.toUpperCase()),
    ).map((c) => ({
      country: c,
      collectedCount: collectedByIso.get(c.iso) ?? 0,
      visited: collectedByIso.has(c.iso),
    }));
  }, [q, searchContinent, collectedByIso]);

  const onPickCountry = (country: CountryEntry) => {
    setQ("");
    setFocus(false);
    setSearchContinent("all");
    if (country.iso === "PH") go("ph");
    else if (country.iso === "AU") go("au");
    else router.push({ pathname: "/sea/country/[iso]", params: { iso: country.iso } });
  };
  const pins = mode === "world" ? [] : regions.filter((r) => r.mode === mode);

  return (
    <SafeAreaView edges={["top"]} style={styles.root}>
      <View style={styles.header}>
        {mapBookTab ? (
          <MapBookTabs active={mapBookTab.active} onChange={mapBookTab.onChange} />
        ) : (
          <Pressable accessibilityRole="button" accessibilityLabel="뒤로" onPress={() => (router.canGoBack() ? router.back() : router.navigate("/(tabs)/dogam"))} style={styles.hit}>
            <ChevronLeft />
          </Pressable>
        )}
        <View style={{ flex: 1 }}>
          <Txt size={12} weight="extraBold" tracking={0.14} color={colors.oceanBlue}>
            {mapBookTab ? "MY SPECIES BOOK" : "MY OCEAN MAP"}
          </Txt>
          <Txt accessibilityRole="header" size={22} weight="black">
            {mapBookTab ? "도감" : "나의 바다 지도"}
          </Txt>
        </View>
        <View style={styles.stat}>
          <Txt size={11} color={colors.ink2}>
            다녀온 나라
          </Txt>
          <Txt size={16} weight="black" color={colors.oceanBlue}>
            {visitedCountries}곳
          </Txt>
        </View>
      </View>

      <View style={[styles.search, focus && { borderColor: colors.oceanBlue }]}>
        <SearchIcon size={18} color={colors.ink2} />
        <TextInput
          value={q}
          onChangeText={(t) => {
            setQ(t);
            setFocus(true);
          }}
          onFocus={() => setFocus(true)}
          placeholder="나라나 지역 찾기 (예: 필리핀, 말라파스쿠아)"
          placeholderTextColor="#8C9AB5"
          accessibilityLabel="나라나 지역 검색"
          style={styles.searchInput}
          returnKeyType="search"
        />
        {q ? (
          <Pressable accessibilityRole="button" accessibilityLabel="검색어 지우기" onPress={() => { setQ(""); setFocus(false); }} hitSlop={8}>
            <CloseIcon size={16} color={colors.ink2} />
          </Pressable>
        ) : null}
      </View>
      {focus ? (
        <View style={styles.results} accessibilityRole="list">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipRow}
            keyboardShouldPersistTaps="handled"
          >
            {(["all", ...CONTINENTS] as const).map((c) => (
              <Pressable
                key={c}
                accessibilityRole="button"
                accessibilityState={{ selected: searchContinent === c }}
                onPress={() => setSearchContinent(c)}
                style={[styles.chip, searchContinent === c ? styles.chipOn : styles.chipOff]}
              >
                <Txt
                  size={12}
                  weight="extraBold"
                  color={searchContinent === c ? colors.white : colors.navy}
                >
                  {c === "all" ? "전체" : c}
                </Txt>
              </Pressable>
            ))}
          </ScrollView>
          <ScrollView style={{ maxHeight: 360 }} keyboardShouldPersistTaps="handled">
            {countryResults.map((r) => (
              <Pressable
                key={r.country.iso}
                accessibilityRole="button"
                accessibilityLabel={`${r.country.nameKo}, ${
                  r.visited ? `${r.collectedCount}종 수집` : "아직 안 가봤어요"
                }`}
                onPress={() => onPickCountry(r.country)}
                style={styles.resultRow}
              >
                <View style={[styles.flagIcon, r.visited && styles.flagIconVisited]}>
                  <Txt size={24} style={styles.flagText}>
                    {r.country.flag}
                  </Txt>
                </View>
                <View style={{ flex: 1 }}>
                  <Txt size={14} weight="bold">
                    {r.country.nameKo}
                  </Txt>
                  <Txt size={12} color={colors.ink2}>
                    {r.country.continent}
                    {r.visited ? ` · ${r.collectedCount}종 수집` : " · 아직 안 가봤어요"}
                  </Txt>
                </View>
                <ChevronRight color={colors.ink2} />
              </Pressable>
            ))}
            {countryResults.length === 0 ? (
              <View style={{ paddingVertical: 24, alignItems: "center" }}>
                <Txt size={13} color={colors.ink2}>
                  찾는 나라가 없어요
                </Txt>
              </View>
            ) : null}
          </ScrollView>
        </View>
      ) : null}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.presets}
      >
        {(["all", ...CONTINENTS] as const).map((c) => {
          const active = c === "all" ? mode === "world" && !focus : searchContinent === c && focus;
          const label = c === "all" ? "전체" : c;
          return (
            <Pressable
              key={c}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              onPress={() => {
                if (c === "all") {
                  setFocus(false);
                  setSearchContinent("all");
                  go("world");
                } else {
                  // Opens the search overlay pre-filtered to that continent so the diver
                  // sees every listed country instead of just two presets.
                  setSearchContinent(c);
                  setFocus(true);
                }
              }}
              style={[styles.preset, active ? styles.presetOn : styles.presetOff]}
            >
              <Txt size={13} weight="extraBold" color={active ? colors.white : colors.navy}>
                {label}
              </Txt>
            </Pressable>
          );
        })}
      </ScrollView>

      <GestureDetector gesture={gesture}>
        <View
          style={styles.map}
          onLayout={(e) => setSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}
          accessibilityLabel={mode === "world" ? "세계 지도. 다녀온 나라 필리핀과 호주가 파란색으로 표시되어 있어요" : `${mode === "ph" ? "필리핀" : "호주"} 지도`}
        >
          <Svg width={size.w} height={size.h} viewBox={vb.map((v) => v.toFixed(2)).join(" ")}>
            <Path d={mapData.sph} fill="#CFE3FA" />
            <Path d={mapData.grat} stroke="#B9D4F3" strokeWidth={vb[2] / 1000} fill="none" />
            {land.map((c) => (
              <Path key={`${c.id}-${c.name}`} d={c.d} fill={visitedIds.has(c.id ?? "") ? "#6FA3EC" : colors.white} stroke={visitedIds.has(c.id ?? "") ? colors.oceanBlue : "#B9CCE6"} strokeWidth={vb[2] / 1400} />
            ))}
          </Svg>

          {mode === "world"
            ? (
                [
                  ["필리핀", "16종", mapData.P.malapascua, "ph"],
                  ["호주", "6종", mapData.P.lizard, "au"],
                ] as const
              ).map(([name, n, at, m]) => {
                const [x, y] = toScreen(at);
                return (
                  <Pressable key={name} accessibilityRole="button" accessibilityLabel={`${name} · 생물 ${n}, 눌러서 확대`} onPress={() => go(m)} style={[styles.badge, { left: x + 8, top: y - 14 }]}>
                    <View style={styles.badgeDot} />
                    <Txt size={12} weight="extraBold">
                      {name}
                    </Txt>
                    <Txt size={11} color={colors.ink2}>
                      {n}
                    </Txt>
                  </Pressable>
                );
              })
            : pins.map((r) => {
                const [x, y] = toScreen(mapData.P[r.k]);
                const on = sel === r.k;
                return (
                  <Pressable key={r.k} accessibilityRole="button" accessibilityLabel={`${r.name}, 생물 ${r.n}종`} onPress={() => setSel(r.k)} style={[styles.pin, { left: x - 16, top: y - 16 }]}>
                    <View style={[styles.pinDot, on && styles.pinDotOn]}>
                      <Txt size={13} weight="black" color={colors.white}>
                        {r.n}
                      </Txt>
                    </View>
                    <View style={[styles.pinTag, on && { backgroundColor: colors.navy }]}>
                      <Txt size={12} weight="extraBold" color={on ? colors.white : colors.navy}>
                        {r.name}
                      </Txt>
                    </View>
                  </Pressable>
                );
              })}
        </View>
      </GestureDetector>

      {region ? (
        <Animated.View entering={FadeInDown.duration(220)} style={[styles.sheet, { paddingBottom: 16 + insets.bottom }]}>
          <View style={styles.sheetHead}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${region.mode === "ph" ? "필리핀" : "호주"} 전체 상세 보기`}
              onPress={() => {
                const iso = region.mode === "ph" ? "PH" : "AU";
                router.push({ pathname: "/sea/country/[iso]", params: { iso } });
              }}
              style={{ flex: 1 }}
            >
              <Txt size={20} weight="black">
                {region.name}
              </Txt>
              <Txt size={12} color={colors.ink2}>
                {region.meta} · 다이빙 {region.logs}회
              </Txt>
              <Txt size={12} weight="bold" color={colors.oceanBlue} style={{ marginTop: 4 }}>
                {region.mode === "ph" ? "필리핀" : "호주"} 전체 보기 →
              </Txt>
            </Pressable>
            <Pressable accessibilityRole="button" accessibilityLabel="닫기" onPress={() => setSel(null)} style={styles.hit}>
              <CloseIcon size={18} />
            </Pressable>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
            {region.kinds.map((k) => (
              <View key={k} style={styles.kindChip}>
                <Critter kind={k} width={56} height={32} />
              </View>
            ))}
          </ScrollView>
          <Txt size={13} color={colors.ink2}>
            만난 생물 {region.n}종{region.sites ? ` · 명소 스탬프 ${region.sites}개` : ""}
          </Txt>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <Pressable accessibilityRole="button" onPress={() => router.navigate("/log")} style={styles.secondary}>
              <Txt size={13} weight="bold">
                그림일기 {region.logs}
              </Txt>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              disabled={!region.tank}
              onPress={() => region.tank && router.push({ pathname: "/sea/place/[id]", params: { id: region.tank } })}
              style={[styles.primary, !region.tank && { opacity: 0.5 }]}
            >
              <Txt size={14} weight="extraBold" color={colors.white}>
                {region.tank ? "이 바다 수족관에 들어가기" : "장소 수족관 준비 중"}
              </Txt>
              {region.tank ? <ChevronRight color={colors.white} /> : null}
            </Pressable>
          </View>
        </Animated.View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.mist },
  header: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12 },
  hit: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  stat: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 14, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, alignItems: "center" },
  search: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 10, marginHorizontal: 16, height: 46, paddingHorizontal: 14, borderRadius: 14, backgroundColor: colors.white, borderWidth: 1.5, borderColor: colors.line },
  searchInput: { flex: 1, fontFamily: fonts.medium, fontSize: 14, color: colors.navy, paddingVertical: 0 },
  results: { position: "absolute", top: 160, left: 16, right: 16, zIndex: 10, borderRadius: 14, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, overflow: "hidden", elevation: 6, shadowColor: "#1E468C", shadowOpacity: 0.15, shadowRadius: 16, shadowOffset: { width: 0, height: 8 } },
  chipRow: { gap: 6, paddingHorizontal: 10, paddingTop: 10, paddingBottom: 6 },
  chip: { height: 30, paddingHorizontal: 12, borderRadius: 999, borderWidth: 1.5, justifyContent: "center" },
  chipOn: { backgroundColor: colors.navy, borderColor: colors.navy },
  chipOff: { backgroundColor: colors.white, borderColor: colors.lineStrong },
  resultRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 10, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: "#EDF2F9" },
  resultIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  flagIcon: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", backgroundColor: colors.mist, borderWidth: 1, borderColor: colors.line },
  flagIconVisited: { backgroundColor: "#DFEBFC", borderColor: colors.oceanBlue },
  flagText: { lineHeight: 30 },
  presets: { flexDirection: "row", gap: 6, marginTop: 10, paddingHorizontal: 16 },
  preset: { height: 34, paddingHorizontal: 14, borderRadius: 999, borderWidth: 1.5, justifyContent: "center" },
  presetOn: { backgroundColor: colors.navy, borderColor: colors.navy },
  presetOff: { backgroundColor: colors.white, borderColor: colors.lineStrong },
  map: { flex: 1, marginTop: 10, overflow: "hidden", backgroundColor: "#DCEBFC" },
  badge: { position: "absolute", height: 28, paddingLeft: 6, paddingRight: 10, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.95)", flexDirection: "row", alignItems: "center", gap: 5 },
  badgeDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.oceanBlue },
  pin: { position: "absolute", flexDirection: "row", alignItems: "center", gap: 4 },
  pinDot: { width: 32, height: 32, borderRadius: 16, borderWidth: 3, borderColor: colors.white, backgroundColor: colors.oceanBlue, alignItems: "center", justifyContent: "center" },
  pinDotOn: { backgroundColor: colors.navy, transform: [{ scale: 1.15 }] },
  pinTag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, backgroundColor: "rgba(255,255,255,0.92)" },
  sheet: { position: "absolute", left: 0, right: 0, bottom: 0, paddingTop: 14, paddingHorizontal: 20, gap: 10, backgroundColor: colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, shadowColor: "#1E468C", shadowOpacity: 0.15, shadowRadius: 24, shadowOffset: { width: 0, height: -8 }, elevation: 10 },
  sheetHead: { flexDirection: "row", alignItems: "flex-start" },
  kindChip: { width: 68, height: 46, borderRadius: 12, backgroundColor: colors.mist, alignItems: "center", justifyContent: "center" },
  secondary: { width: 110, height: 48, borderRadius: 14, borderWidth: 1.5, borderColor: colors.lineStrong, alignItems: "center", justifyContent: "center" },
  primary: { flex: 1, height: 48, borderRadius: 14, backgroundColor: colors.navy, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 },
});