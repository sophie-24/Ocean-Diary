import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, type Href } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";
import { ChevronLeft, CloseIcon } from "../../components/icons";
import { NameTag } from "../../components/ui/NameTag";
import { Txt } from "../../components/ui/Txt";
import type { CritterKind } from "../../data/illustrations";
import { SPECIES_BY_NO } from "../../data/species";
import { colors } from "../../theme/tokens";
import { useCollection } from "../../api/queries";
import { OnStage } from "./stage";
import { useOceanSound, type OceanTrack } from "./oceanSound";
import { Particle } from "./TankParts";
import { PHASES, PHASE_LOOK, clockLabel, phaseOf, type Phase } from "./timeOfDay";

export type Resident = { no: string; date: string; count: number; isNew?: boolean };
/** Stage roster: which catalog species each choreographed critter stands for. */
export type Cast = Partial<Record<CritterKind, string>>;


const fmtDate = (iso: string) => {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  return `${y}년 ${m}월 ${d}일`;
};

/** Resolve the stage roster against the diver's real collection. */
export function useResidents(cast: Cast, only?: Set<string>) {
  const { data: collection } = useCollection();
  return useMemo(() => {
    const out: Partial<Record<CritterKind, Resident>> = {};
    for (const [kind, no] of Object.entries(cast) as [CritterKind, string][]) {
      if (only && !only.has(no)) continue;
      const mark = collection?.get(no);
      if (!mark) continue;
      out[kind] = { no, date: fmtDate(mark.firstSeen), count: mark.count, isNew: mark.isNew };
    }
    return out;
  }, [cast, only, collection]);
}
export type TankKey = "reef" | "ocean" | "macro" | "deep";

export const TANKS: { key: TankKey; name: string; count: string; href?: Href; locked?: boolean }[] = [
  { key: "reef", name: "산호초 수조", count: "산호초 친구들", href: "/sea" },
  { key: "ocean", name: "대양 수조", count: "큰 바다 친구들", href: "/sea/tank/ocean" },
  { key: "macro", name: "마크로 수조", count: "돋보기로 찾기", href: "/sea/tank/macro" },
  { key: "deep", name: "심해 수조", count: "곧 열려요", locked: true },
];

export type TankApi = { phase: Phase; night: boolean; dark: boolean; pick: (k: CritterKind) => () => void };

type Props = {
  title: string;
  /** Receives the number of species actually living in the tank. */
  subtitle: (count: number) => string;
  eyebrow?: string;
  /** Called with light-shaft opacity for the current phase. */
  scene: (rays: number) => ReactNode;
  residents: Partial<Record<CritterKind, Resident>>;
  /** Shown when nothing in this tank has been met yet. */
  emptyHint?: string;
  /** Stage content (fish), authored on a 390×844 stage. */
  children: (api: TankApi) => ReactNode;
  current?: TankKey;
  backHref?: Href;
  /** Optional note override per phase (e.g. place-specific behaviour). */
  notes?: Partial<Record<Phase, string>>;
  footer?: ReactNode;
  /** Ambient loop for this tank. */
  sound?: OceanTrack;
};

export function TankShell({ title, subtitle, eyebrow, scene, residents, emptyHint = "아직 이 수조에서 만난 친구가 없어요. 발견 탭에서 사진을 올려 보세요", children, current, backHref, notes, footer, sound = "bubbles" }: Props) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [sel, setSel] = useState<CritterKind | null>(null);
  const [hud, setHud] = useState(true);
  const ambience = useOceanSound(sound);
  const [preview, setPreview] = useState<Phase | null>(null);
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);

  const phase = preview ?? phaseOf(now.getHours());
  const look = PHASE_LOOK[phase];
  const api: TankApi = { phase, night: phase === "night", dark: phase === "night" || phase === "dusk", pick: (k) => () => setSel(k) };

  const [box, setBox] = useState({ w: 390, h: 844 });
  const scale = Math.max(box.w / 390, box.h / 844);
  const stage = {
    position: "absolute" as const,
    width: 390,
    height: 844,
    left: (box.w - 390) / 2,
    top: (box.h - 844) / 2 + box.h / 2 - 422 * scale,
    transform: [{ scale }],
  };
  const particles = useMemo(
    () => Array.from({ length: 14 }, (_, i) => ({ x: (i * 53) % 390, y: 120 + ((i * 97) % 420), size: 1.5 + (i % 3), dur: (9 + (i % 5) * 2) * 1000, delay: i * 400 })),
    [],
  );

  const onStage = useMemo(() => new Set(Object.keys(residents) as CritterKind[]), [residents]);
  const r = sel ? residents[sel] : undefined;
  const s = r ? SPECIES_BY_NO[r.no] : undefined;

  return (
    <View style={styles.root} onLayout={(e) => setBox({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}>
      <View style={stage}>
        <View style={styles.sceneBox}>{scene(look.rays)}</View>
        <OnStage.Provider value={onStage}>{children(api)}</OnStage.Provider>
        {particles.map((p, i) => (
          <Particle key={i} {...p} />
        ))}
      </View>

      {/* Time-of-day tint. Numeric size and separate stop opacity: percent-sized SVGs and rgba() stops are unreliable on iOS. */}
      <View pointerEvents="none" style={styles.fill}>
        <Svg width={box.w} height={box.h}>
          <Defs>
            <LinearGradient id="tankTint" x1="0" y1="0" x2="0" y2="1">
              {look.tint.map((c, i) => {
                const [r, g, b, a] = c.match(/[\d.]+/g)!.map(Number);
                return <Stop key={i} offset={[0, 0.45, 1][i]} stopColor={`rgb(${r},${g},${b})`} stopOpacity={a} />;
              })}
            </LinearGradient>
          </Defs>
          <Rect x={0} y={0} width={box.w} height={box.h} fill="url(#tankTint)" />
        </Svg>
      </View>

      {onStage.size === 0 ? (
        <View pointerEvents="none" style={styles.emptyWrap}>
          <View style={styles.glass}>
            <Txt size={14} weight="bold" color={colors.white} style={{ textAlign: "center", lineHeight: 22 }}>
              {emptyHint}
            </Txt>
          </View>
        </View>
      ) : null}

      {hud ? (
        <View style={[styles.hudTop, { paddingTop: insets.top + 8 }]} pointerEvents="box-none">
          <View style={styles.row} pointerEvents="box-none">
            <View style={{ flexDirection: "row", gap: 8, flexShrink: 1 }}>
              {backHref ? (
                <Pressable accessibilityRole="button" accessibilityLabel="뒤로" onPress={() => (router.canGoBack() ? router.back() : router.navigate(backHref))} style={[styles.glass, styles.round44]}>
                  <ChevronLeft color={colors.white} />
                </Pressable>
              ) : null}
              <View style={[styles.glass, { flexShrink: 1 }]}>
                {eyebrow ? (
                  <Txt size={11} weight="extraBold" tracking={0.08} color="#8EC5FF">
                    {eyebrow}
                  </Txt>
                ) : null}
                <Txt accessibilityRole="header" size={19} weight="black" color={colors.white} numberOfLines={1}>
                  {title}
                </Txt>
                <Txt size={11} color={colors.darkInkSoft} numberOfLines={1}>
                  {subtitle(onStage.size)}
                </Txt>
              </View>
            </View>
            {!backHref ? (
              <View style={[styles.glass, styles.toggle]} accessibilityRole="tablist">
                <View style={styles.toggleOn} accessibilityRole="tab" accessibilityState={{ selected: true }}>
                  <Txt size={13} weight="extraBold">
                    수족관
                  </Txt>
                </View>
                <Pressable accessibilityRole="tab" accessibilityState={{ selected: false }} onPress={() => router.push("/sea/map")} style={styles.toggleOff}>
                  <Txt size={13} weight="bold" color={colors.sky}>
                    지도
                  </Txt>
                </Pressable>
              </View>
            ) : null}
          </View>
          <View style={styles.row} pointerEvents="box-none">
            <Pressable
              onPress={() => setPreview(PHASES[(PHASES.indexOf(phase) + 1) % 4])}
              accessibilityRole="button"
              accessibilityLabel={`수조 조명 · ${look.label}. 누르면 다른 시간대를 미리 볼 수 있어요`}
              style={[styles.glass, styles.chip]}
            >
              <View style={[styles.dot, { backgroundColor: look.dot }]} />
              <View style={{ flexShrink: 1 }}>
                <Txt size={12} weight="black" color={colors.white}>
                  {look.label}
                  {preview ? " · 미리보기" : ` · ${clockLabel(now)}`}
                </Txt>
                <Txt size={11} color={colors.darkInkSoft} numberOfLines={2}>
                  {notes?.[phase] ?? look.note}
                </Txt>
              </View>
            </Pressable>
            <View style={{ gap: 8 }}>
              <Pressable
                accessibilityRole="switch"
                accessibilityState={{ checked: ambience.on }}
                accessibilityLabel="바다 소리"
                onPress={ambience.toggle}
                style={[styles.glass, styles.round, ambience.on && styles.roundOn]}
              >
                <Txt size={11} weight="extraBold" color={ambience.on ? colors.navy : colors.white}>
                  {ambience.on ? "소리 켬" : "소리"}
                </Txt>
              </Pressable>
              <Pressable accessibilityRole="button" accessibilityLabel="감상 모드 · 화면 글자 숨기기" onPress={() => { setHud(false); setSel(null); }} style={[styles.glass, styles.round]}>
                <Txt size={11} weight="extraBold" color={colors.white}>
                  감상
                </Txt>
              </Pressable>
            </View>
          </View>
        </View>
      ) : (
        <Pressable onPress={() => setHud(true)} accessibilityRole="button" style={[styles.glass, styles.exitView, { bottom: 16 }]}>
          <Txt size={12} weight="extraBold" color={colors.white}>
            감상 모드 · 눌러서 돌아가기
          </Txt>
        </Pressable>
      )}

      {r && s ? (
        <Animated.View entering={FadeInDown.duration(220)} style={[styles.plaque, { bottom: footer || current ? 92 : 24 + insets.bottom }]}>
          <Pressable accessibilityRole="button" accessibilityLabel="명판 닫기" onPress={() => setSel(null)} style={styles.plaqueClose}>
            <CloseIcon size={14} color={colors.white} />
          </Pressable>
          <NameTag ko={s.nameKo} en={s.nameEn} size="md" filled />
          <Txt size={13} color={colors.darkInkSoft} style={{ marginTop: 4 }}>
            처음 만난 날{r.isNew ? " · NEW" : ""}
          </Txt>
          <Txt size={15} weight="extraBold" color={colors.white}>
            {r.date}
          </Txt>
          <View style={{ flexDirection: "row", gap: 8, marginTop: 6, alignSelf: "stretch" }}>
            <View style={styles.plaqueCount}>
              <Txt size={13} weight="extraBold" color={colors.white}>
                만남 {r.count}회
              </Txt>
            </View>
            <Pressable accessibilityRole="button" onPress={() => router.push({ pathname: "/species/[no]", params: { no: r.no } })} style={styles.plaqueCta}>
              <Txt size={13} weight="extraBold" color={colors.white}>
                도감에서 보기
              </Txt>
            </Pressable>
          </View>
        </Animated.View>
      ) : null}

      {hud && footer ? footer : null}
      {hud && !footer && current ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tanks} contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}>
          {TANKS.map((t) => {
            const on = t.key === current;
            return (
              <Pressable
                key={t.key}
                disabled={on || t.locked || !t.href}
                onPress={() => t.href && router.replace(t.href)}
                accessibilityRole="button"
                accessibilityState={{ selected: on, disabled: !!t.locked }}
                accessibilityLabel={`${t.name}, ${t.count}${on ? ", 지금 보는 중" : t.locked ? ", 잠김" : ""}`}
                style={[styles.tank, on ? styles.tankOn : t.locked ? styles.tankLocked : styles.tankOff]}
              >
                <Txt size={13} weight={on ? "black" : "extraBold"} color={on ? colors.navy : colors.white}>
                  {t.name}
                </Txt>
                <Txt size={11} color={on ? colors.inkSoft : colors.darkInkSoft}>
                  {on ? `${t.count} · 보는 중` : t.count}
                </Txt>
              </Pressable>
            );
          })}
        </ScrollView>
      ) : null}
    </View>
  );
}

export const tankStyles = StyleSheet.create({
  glass: { backgroundColor: "rgba(8,24,58,0.5)", borderWidth: 1, borderColor: "rgba(169,210,255,0.25)", borderRadius: 16 },
});

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0B2C66", overflow: "hidden" },
  roundOn: { backgroundColor: "rgba(255,255,255,0.92)" },
  fill: { position: "absolute", left: 0, top: 0, right: 0, bottom: 0 },
  sceneBox: { position: "absolute", left: 0, top: 0, width: 390, height: 844 },
  emptyWrap: { position: "absolute", left: 32, right: 32, top: "40%", alignItems: "center" },
  hudTop: { position: "absolute", left: 0, right: 0, top: 0, paddingHorizontal: 16, gap: 10 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 10 },
  glass: { backgroundColor: "rgba(8,24,58,0.5)", borderWidth: 1, borderColor: "rgba(169,210,255,0.25)", borderRadius: 18, paddingVertical: 10, paddingHorizontal: 14 },
  round44: { width: 44, height: 44, borderRadius: 22, paddingVertical: 0, paddingHorizontal: 0, alignItems: "center", justifyContent: "center" },
  toggle: { flexDirection: "row", paddingVertical: 3, paddingHorizontal: 3, borderRadius: 14 },
  toggleOn: { height: 36, paddingHorizontal: 12, borderRadius: 11, backgroundColor: colors.white, justifyContent: "center" },
  toggleOff: { height: 36, paddingHorizontal: 12, borderRadius: 11, justifyContent: "center" },
  chip: { flexDirection: "row", alignItems: "center", gap: 9, maxWidth: 250, paddingVertical: 8, paddingLeft: 9, paddingRight: 12, borderRadius: 16 },
  dot: { width: 28, height: 28, borderRadius: 14 },
  round: { width: 48, height: 40, borderRadius: 20, paddingVertical: 0, paddingHorizontal: 0, alignItems: "center", justifyContent: "center" },
  exitView: { position: "absolute", alignSelf: "center", borderRadius: 999, paddingVertical: 9 },
  plaque: { position: "absolute", left: 16, right: 16, alignItems: "center", gap: 6, paddingTop: 16, paddingHorizontal: 16, paddingBottom: 14, borderRadius: 22, backgroundColor: "rgba(6,20,50,0.85)", borderWidth: 1, borderColor: "rgba(169,210,255,0.25)" },
  plaqueClose: { position: "absolute", right: 8, top: 8, width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.1)", alignItems: "center", justifyContent: "center" },
  plaqueCount: { height: 40, paddingHorizontal: 12, borderRadius: 12, backgroundColor: "rgba(169,210,255,0.16)", justifyContent: "center" },
  plaqueCta: { flex: 1, height: 40, borderRadius: 12, backgroundColor: colors.oceanBlue, alignItems: "center", justifyContent: "center" },
  tanks: { position: "absolute", left: 0, right: 0, bottom: 12, flexGrow: 0 },
  tank: { minWidth: 112, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 16 },
  tankOn: { backgroundColor: "rgba(255,255,255,0.92)" },
  tankOff: { backgroundColor: "rgba(8,24,58,0.5)", borderWidth: 1, borderColor: "rgba(169,210,255,0.25)" },
  tankLocked: { borderWidth: 1.5, borderStyle: "dashed", borderColor: "rgba(169,210,255,0.45)" },
});
