import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Animated, {
  Easing,
  FadeInDown,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";
import { Critter } from "../../components/Critter";
import { CloseIcon } from "../../components/icons";
import { NameTag } from "../../components/ui/NameTag";
import { Txt } from "../../components/ui/Txt";
import type { CritterKind } from "../../data/illustrations";
import { SPECIES_BY_NO } from "../../data/species";
import { colors } from "../../theme/tokens";
import { ReefScene } from "./ReefScene";
import { SwimmingFish } from "./SwimmingFish";
import { PHASES, PHASE_LOOK, clockLabel, phaseOf, type Phase } from "./timeOfDay";

type Resident = { no: string; date: string; place: string; count: number };

// Mock residents of the reef tank (first meeting per species). Phase 5: GET /v1/collection.
const RESIDENTS: Record<string, Resident> = {
  napoleon: { no: "029", date: "2025년 9월 14일", place: "호주 리저드섬 코드 홀", count: 1 },
  lionfish: { no: "027", date: "2025년 4월 14일", place: "보홀 발리카삭", count: 2 },
  boxfish: { no: "032", date: "2025년 4월 16일", place: "보홀 발리카삭", count: 1 },
  puffer: { no: "031", date: "2025년 11월 22일", place: "모알보알 페스카도르 섬", count: 1 },
  mandarin: { no: "026", date: "2026년 11월 1일", place: "말라파스쿠아 라이트하우스", count: 1 },
  moray: { no: "030", date: "2025년 4월 15일", place: "보홀 발리카삭", count: 4 },
  epaulette: { no: "015", date: "2025년 9월 12일", place: "호주 헤론섬", count: 1 },
  whitetip: { no: "006", date: "2025년 4월 15일", place: "보홀 발리카삭", count: 3 },
  blacktip: { no: "005", date: "2025년 4월 15일", place: "보홀 발리카삭", count: 2 },
  grouper: { no: "028", date: "2025년 9월 14일", place: "호주 리저드섬 코드 홀", count: 1 },
  trevally: { no: "034", date: "2025년 4월 15일", place: "보홀 발리카삭", count: 2 },
};

const TANKS = [
  { key: "reef", name: "산호초 수조", count: "11종", ready: true },
  { key: "ocean", name: "대양 수조", count: "5종", ready: false },
  { key: "macro", name: "마크로 수조", count: "8종 · 돋보기", ready: false },
  { key: "deep", name: "심해 수조", count: "30종에 열려요", ready: false, locked: true },
];

function Particle({ x, y, size, dur, delay }: { x: number; y: number; size: number; dur: number; delay: number }) {
  const t = useSharedValue(0);
  const reduced = useReducedMotion();
  useEffect(() => {
    if (reduced) return;
    t.value = withRepeat(withSequence(withTiming(0, { duration: delay }), withTiming(1, { duration: dur, easing: Easing.linear })), -1);
  }, [t, dur, delay, reduced]);
  const st = useAnimatedStyle(() => ({ opacity: t.value < 0.1 ? t.value * 8 : 0.8 * (1 - t.value), transform: [{ translateX: -30 * t.value }, { translateY: 260 * t.value }] }));
  return <Animated.View pointerEvents="none" style={[{ position: "absolute", left: x, top: y, width: size, height: size, borderRadius: size, backgroundColor: "rgba(255,255,255,0.75)" }, st]} />;
}

function Peek({ onPress }: { onPress: () => void }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withRepeat(withSequence(withTiming(0, { duration: 2100 }), withTiming(1, { duration: 1000 }), withTiming(1, { duration: 2800 }), withTiming(0, { duration: 1100 })), -1);
  }, [t]);
  const st = useAnimatedStyle(() => ({ transform: [{ translateX: 26 * (1 - t.value) }] }));
  return (
    <View style={{ position: "absolute", left: 96, top: 636, width: 52, height: 30, overflow: "hidden", borderBottomLeftRadius: 12, borderBottomRightRadius: 12 }}>
      <Animated.View style={st}>
        <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel="곰치 · 눌러서 명판 보기">
          <Critter kind="moray" width={120} height={52} />
        </Pressable>
      </Animated.View>
    </View>
  );
}

function Dance({ onPress }: { onPress: () => void }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withRepeat(withTiming(1, { duration: 2100, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, [t]);
  const st = useAnimatedStyle(() => ({ transform: [{ perspective: 500 }, { translateY: -34 * t.value }, { rotateZ: `${-6 + 10 * t.value}deg` }, { rotateY: `${-20 + 40 * t.value}deg` }] }));
  return (
    <Animated.View style={[{ position: "absolute", left: 176, top: 636 }, st]}>
      <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel="만다린피쉬 한 쌍 · 짝짓기 춤 추는 중" style={{ flexDirection: "row", alignItems: "flex-end", gap: 2 }}>
        <Critter kind="mandarin" width={46} height={29} />
        <View style={{ transform: [{ scaleX: -1 }] }}>
          <Critter kind="mandarin" width={40} height={25} />
        </View>
      </Pressable>
    </Animated.View>
  );
}

export function AquariumScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [sel, setSel] = useState<CritterKind | null>(null);
  const [hud, setHud] = useState(true);
  const [preview, setPreview] = useState<Phase | null>(null);
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);

  const phase = preview ?? phaseOf(now.getHours());
  const look = PHASE_LOOK[phase];
  const night = phase === "night";
  const dark = phase === "night" || phase === "dusk";
  const pick = (k: CritterKind) => () => setSel(k);

  const mid = useMemo(
    () => [
      ...(night ? [] : [{ kind: "napoleon" as const, w: 164, h: 78, left: 10, top: 300, dx: 190, dur: 22, phase: 3 }]),
      { kind: "puffer" as const, w: 70, h: 41, left: 296, top: 268, dx: -150, dur: 18, phase: 8 },
      { kind: "boxfish" as const, w: 58, h: 35, left: 40, top: 420, dx: 220, dur: 16, phase: 2 },
      { kind: "epaulette" as const, w: 92, h: 37, left: 150, top: 664, dx: 70, dur: 26, phase: 12 },
      { kind: "grouper" as const, w: 230, h: 108, left: -60, top: 470, dx: 300, dur: 26, phase: 6 },
      ...(night ? [{ kind: "whitetip" as const, w: 146, h: 60, left: 20, top: 560, dx: 230, dur: 20, phase: 7 }] : []),
    ],
    [night],
  );
  const far = [
    { kind: "blacktip" as const, w: 96, h: 40, left: 10, top: 196, dx: 260, dur: 34, phase: 4 },
    { kind: "trevally" as const, w: 44, h: 22, left: 200, top: 156, dx: -150, dur: 22, phase: 10 },
    { kind: "trevally" as const, w: 38, h: 19, left: 230, top: 178, dx: -160, dur: 24, phase: 11 },
  ];
  const particles = useMemo(
    () => Array.from({ length: 14 }, (_, i) => ({ x: (i * 53) % 390, y: 120 + ((i * 97) % 420), size: 1.5 + (i % 3), dur: (9 + (i % 5) * 2) * 1000, delay: i * 400 })),
    [],
  );

  // The scene is authored on a 390×844 stage (like the canvas) and scaled to cover the screen, anchored to the sand.
  const [box, setBox] = useState({ w: 390, h: 844 });
  const scale = Math.max(box.w / 390, box.h / 844);
  const stageStyle = {
    position: "absolute" as const,
    width: 390,
    height: 844,
    left: (box.w - 390) / 2,
    top: (box.h - 844) / 2 + box.h / 2 - 422 * scale,
    transform: [{ scale }],
  };

  const r = sel ? RESIDENTS[sel] : null;
  const s = r ? SPECIES_BY_NO[r.no] : null;

  return (
    <View style={styles.root} onLayout={(e) => setBox({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}>
      <View style={stageStyle}>
      <View style={StyleSheet.absoluteFill}>
        <ReefScene rays={look.rays} />
      </View>

      {far.map((f, i) => (
        <SwimmingFish key={`far${i}`} {...f} duration={f.dur} far label={`${SPECIES_BY_NO[RESIDENTS[f.kind].no].nameKo} · 눌러서 명판 보기`} onPress={pick(f.kind)} />
      ))}
      {!night ? (
        <Pressable style={{ position: "absolute", left: 250, top: 644 }} onPress={pick("whitetip")} accessibilityRole="button" accessibilityLabel="백기흉상어 · 쉬는 중">
          <Critter kind="whitetip" width={136} height={56} />
        </Pressable>
      ) : null}
      {night ? (
        <Pressable style={{ position: "absolute", left: 160, top: 576, opacity: 0.75 }} onPress={pick("napoleon")} accessibilityRole="button" accessibilityLabel="나폴레옹피쉬 · 자는 중">
          <Critter kind="napoleon" width={150} height={71} />
        </Pressable>
      ) : null}
      <Peek onPress={pick("moray")} />
      <Pressable style={{ position: "absolute", left: 270, top: 520 }} onPress={pick("lionfish")} accessibilityRole="button" accessibilityLabel="라이언피쉬 · 눌러서 명판 보기">
        <Critter kind="lionfish" width={92} height={60} />
      </Pressable>
      {dark ? (
        <Dance onPress={pick("mandarin")} />
      ) : (
        <Pressable style={{ position: "absolute", left: 190, top: 682, opacity: 0.55 }} onPress={pick("mandarin")} accessibilityRole="button" accessibilityLabel="만다린피쉬 · 산호 틈에 숨어 있어요. 해 질 녘에 나와요">
          <Critter kind="mandarin" width={30} height={19} />
        </Pressable>
      )}
      {mid.map((f) => (
        <SwimmingFish key={f.kind} {...f} duration={f.dur} label={`${SPECIES_BY_NO[RESIDENTS[f.kind].no].nameKo} · 눌러서 명판 보기`} onPress={pick(f.kind)} />
      ))}
      {particles.map((p, i) => (
        <Particle key={i} {...p} />
      ))}
      </View>

      {/* Time-of-day lighting */}
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <Svg width="100%" height="100%">
          <Defs>
            <LinearGradient id="tint" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={look.tint[0]} />
              <Stop offset="0.45" stopColor={look.tint[1]} />
              <Stop offset="1" stopColor={look.tint[2]} />
            </LinearGradient>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#tint)" />
        </Svg>
      </View>

      {hud ? (
        <View style={[styles.hudTop, { paddingTop: insets.top + 8 }]} pointerEvents="box-none">
          <View style={styles.headRow} pointerEvents="box-none">
            <View style={styles.glass}>
              <Txt accessibilityRole="header" size={20} weight="black" color={colors.white}>
                나의 바다
              </Txt>
              <Txt size={12} color={colors.darkInkSoft}>
                산호초 수조 · {Object.keys(RESIDENTS).length}종이 살고 있어요
              </Txt>
            </View>
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
          </View>
          <View style={styles.headRow} pointerEvents="box-none">
            <Pressable
              onPress={() => setPreview(PHASES[(PHASES.indexOf(phase) + 1) % 4])}
              accessibilityRole="button"
              accessibilityLabel={`수조 조명 · ${look.label} ${preview ? "" : clockLabel(now)}. 누르면 다른 시간대를 미리 볼 수 있어요`}
              style={[styles.glass, styles.chip]}
            >
              <View style={[styles.dot, { backgroundColor: look.dot }]} />
              <View style={{ flexShrink: 1 }}>
                <Txt size={12} weight="black" color={colors.white}>
                  {look.label}
                  {preview ? " · 미리보기" : ` · ${clockLabel(now)}`}
                </Txt>
                <Txt size={11} color={colors.darkInkSoft} numberOfLines={2}>
                  {look.note}
                </Txt>
              </View>
            </Pressable>
            <View style={{ gap: 8 }}>
              <Pressable accessibilityRole="button" accessibilityLabel="바다 소리 설정 · 음원 준비 중" style={[styles.glass, styles.round]}>
                <Txt size={11} weight="extraBold" color={colors.white}>
                  소리
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
        <Animated.View entering={FadeInDown.duration(220)} style={styles.plaque} accessibilityRole="summary">
          <Pressable accessibilityRole="button" accessibilityLabel="명판 닫기" onPress={() => setSel(null)} style={styles.plaqueClose}>
            <CloseIcon size={14} color={colors.white} />
          </Pressable>
          <NameTag ko={s.nameKo} en={s.nameEn} size="md" filled />
          <Txt size={15} weight="extraBold" color={colors.white} style={{ marginTop: 4 }}>
            {r.date}
          </Txt>
          <Txt size={13} color={colors.darkInkSoft}>
            {r.place}에서 처음 만났어요
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

      {hud ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tanks} contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}>
          {TANKS.map((t, i) => (
            <View
              key={t.key}
              accessible
              accessibilityLabel={`${t.name}, ${t.count}${i === 0 ? ", 지금 보는 중" : t.ready ? "" : ", 준비 중"}`}
              style={[styles.tank, i === 0 ? styles.tankOn : t.locked ? styles.tankLocked : styles.tankOff]}
            >
              <Txt size={13} weight={i === 0 ? "black" : "extraBold"} color={i === 0 ? colors.navy : colors.white}>
                {t.name}
              </Txt>
              <Txt size={11} color={i === 0 ? colors.inkSoft : colors.darkInkSoft}>
                {i === 0 ? `${t.count} · 보는 중` : t.ready ? t.count : `${t.count} · 곧`}
              </Txt>
            </View>
          ))}
        </ScrollView>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0B2C66", overflow: "hidden" },
  hudTop: { position: "absolute", left: 0, right: 0, top: 0, paddingHorizontal: 16, gap: 10 },
  headRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 10 },
  glass: { backgroundColor: "rgba(8,24,58,0.5)", borderWidth: 1, borderColor: "rgba(169,210,255,0.25)", borderRadius: 18, paddingVertical: 10, paddingHorizontal: 14 },
  toggle: { flexDirection: "row", padding: 3, paddingVertical: 3, paddingHorizontal: 3, borderRadius: 14 },
  toggleOn: { height: 36, paddingHorizontal: 12, borderRadius: 11, backgroundColor: colors.white, justifyContent: "center" },
  toggleOff: { height: 36, paddingHorizontal: 12, borderRadius: 11, justifyContent: "center" },
  chip: { flexDirection: "row", alignItems: "center", gap: 9, maxWidth: 250, paddingVertical: 8, paddingLeft: 9, paddingRight: 12, borderRadius: 16 },
  dot: { width: 28, height: 28, borderRadius: 14 },
  round: { width: 48, height: 40, borderRadius: 20, paddingVertical: 0, paddingHorizontal: 0, alignItems: "center", justifyContent: "center" },
  exitView: { position: "absolute", alignSelf: "center", borderRadius: 999, paddingVertical: 9 },
  plaque: { position: "absolute", left: 16, right: 16, bottom: 92, alignItems: "center", gap: 6, paddingTop: 16, paddingHorizontal: 16, paddingBottom: 14, borderRadius: 22, backgroundColor: "rgba(6,20,50,0.85)", borderWidth: 1, borderColor: "rgba(169,210,255,0.25)" },
  plaqueClose: { position: "absolute", right: 8, top: 8, width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.1)", alignItems: "center", justifyContent: "center" },
  plaqueCount: { height: 40, paddingHorizontal: 12, borderRadius: 12, backgroundColor: "rgba(169,210,255,0.16)", justifyContent: "center" },
  plaqueCta: { flex: 1, height: 40, borderRadius: 12, backgroundColor: colors.oceanBlue, alignItems: "center", justifyContent: "center" },
  tanks: { position: "absolute", left: 0, right: 0, bottom: 12, flexGrow: 0 },
  tank: { minWidth: 112, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 16 },
  tankOn: { backgroundColor: "rgba(255,255,255,0.92)" },
  tankOff: { backgroundColor: "rgba(8,24,58,0.5)", borderWidth: 1, borderColor: "rgba(169,210,255,0.25)" },
  tankLocked: { borderWidth: 1.5, borderStyle: "dashed", borderColor: "rgba(169,210,255,0.45)" },
});
