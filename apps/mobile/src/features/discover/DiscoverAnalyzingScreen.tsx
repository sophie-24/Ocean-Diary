import { useEffect, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import Svg, { Path, Rect } from "react-native-svg";
import { Critter } from "../../components/Critter";
import { CheckIcon, ChevronLeft } from "../../components/icons";
import { Txt } from "../../components/ui/Txt";
import { ANALYSIS_STEPS, MOCK_MEDIA_GROUPS } from "../../mocks/discover";
import { colors } from "../../theme/tokens";
import { useDiscover } from "./discoverStore";

const MOCK_DURATION_MS = 4200;
const ACCENT = "#8EC5FF";

export function DiscoverAnalyzingScreen() {
  const router = useRouter();
  const reduced = useReducedMotion();
  const { selected } = useDiscover();
  const first = MOCK_MEDIA_GROUPS.flatMap((g) => g.items).find((m) => m.id === selected[0]) ?? MOCK_MEDIA_GROUPS[0].items[0];
  const [pct, setPct] = useState(0);

  // Mock progress until the identification-jobs API is wired up (phase 5).
  useEffect(() => {
    const started = Date.now();
    const t = setInterval(() => {
      const p = Math.min(100, Math.round(((Date.now() - started) / MOCK_DURATION_MS) * 100));
      setPct(p);
      if (p >= 100) {
        clearInterval(t);
        router.replace("/discover/result");
      }
    }, 120);
    return () => clearInterval(t);
  }, [router]);

  const step = pct < 30 ? 0 : pct < 80 ? 1 : 2;

  const scan = useSharedValue(0.06);
  const bob = useSharedValue(0);
  const ping = useSharedValue(0);
  useEffect(() => {
    if (reduced) return;
    scan.value = withRepeat(withTiming(0.9, { duration: 1300, easing: Easing.inOut(Easing.quad) }), -1, true);
    bob.value = withRepeat(withTiming(1, { duration: 1600, easing: Easing.inOut(Easing.sin) }), -1, true);
    ping.value = withRepeat(withSequence(withTiming(1, { duration: 1800 }), withDelay(0, withTiming(0, { duration: 0 }))), -1);
  }, [reduced, scan, bob, ping]);

  const scanStyle = useAnimatedStyle(() => ({ top: `${scan.value * 100}%` }));
  const bobStyle = useAnimatedStyle(() => ({ transform: [{ translateY: -8 * bob.value }, { rotate: `${-2 + 4 * bob.value}deg` }] }));
  const pingStyle = useAnimatedStyle(() => ({ opacity: 0.7 * (1 - ping.value), transform: [{ scale: 0.4 + 1.2 * ping.value }] }));

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.top}>
        <Pressable accessibilityRole="button" accessibilityLabel="분석 취소하고 돌아가기" onPress={() => router.back()} style={styles.hit}>
          <ChevronLeft color={colors.white} />
        </Pressable>
        <View style={styles.counter}>
          <Txt size={13} weight="bold" color={colors.white}>
            {selected.length || 1}개 중 1번째
          </Txt>
        </View>
        <View style={styles.hit} />
      </View>

      <View style={styles.polaroid}>
        <View style={[styles.photo, { backgroundColor: first.bg }]}>
          <View style={styles.glare} />
          <Critter kind={first.kind} width={204} height={96} style={{ position: "absolute", left: 8, top: 40 }} />
          <Animated.View style={[styles.scan, scanStyle]} />
          {(["tl", "tr", "bl", "br"] as const).map((c) => (
            <View key={c} style={[styles.corner, cornerStyle[c]]} />
          ))}
        </View>
        <Txt size={12} weight="bold" color={colors.ink2} style={{ marginTop: 8 }}>
          11.02 모나드 숄 · {first.dur ? `영상 ${first.dur}` : "사진"}
        </Txt>
      </View>

      <View style={styles.diverZone}>
        <Animated.View style={[styles.ping, pingStyle]} />
        <Animated.View style={bobStyle}>
          <Svg width={134} height={80} viewBox="0 0 134 80">
            <Rect x={50} y={12} width={30} height={20} rx={8} fill="#F5D66B" stroke="#C99A2A" strokeWidth={2} />
            <Rect x={14} y={26} width={100} height={44} rx={22} fill="#F5D66B" stroke="#C99A2A" strokeWidth={2} />
            <Path d="M30 48 H98" stroke="#C99A2A" strokeWidth={2} strokeLinecap="round" />
          </Svg>
        </Animated.View>
      </View>

      <View style={styles.copy}>
        <Txt size={23} weight="black" color={colors.white} align="center" accessibilityRole="header">
          AI가 바닷속 친구를 찾고 있어요…
        </Txt>
        <Txt size={14} color="#C3D8F5" align="center" style={{ marginTop: 6 }}>
          {first.dur ? `영상 ${first.dur}을 장면별로 살펴보는 중` : "사진 속 생물을 살펴보는 중"}
        </Txt>
      </View>

      <View style={styles.steps} accessibilityLiveRegion="polite">
        {ANALYSIS_STEPS.map((label, i) => {
          const done = i < step;
          const now = i === step;
          return (
            <View key={label} style={styles.stepRow}>
              <View style={[styles.stepDot, done && styles.stepDone, now && styles.stepNow]}>{done ? <CheckIcon size={12} /> : null}</View>
              <Txt size={14} weight={now ? "bold" : "regular"} color={done ? "#D6E4F7" : now ? colors.white : "#A9BEDD"} style={{ flex: 1 }}>
                {label}
              </Txt>
            </View>
          );
        })}
        <View style={styles.stepRow} accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: pct }}>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${pct}%` }]} />
          </View>
          <Txt size={12} weight="bold" color="#D6E4F7">
            {pct}%
          </Txt>
        </View>
      </View>

      <Pressable accessibilityRole="button" onPress={() => router.navigate("/")} style={styles.later}>
        <Txt size={15} weight="bold" color={colors.white}>
          다 되면 알려주세요
        </Txt>
      </Pressable>
    </SafeAreaView>
  );
}

const C = 18;
const cornerStyle = StyleSheet.create({
  tl: { left: 8, top: 8, borderLeftWidth: 3, borderTopWidth: 3 },
  tr: { right: 8, top: 8, borderRightWidth: 3, borderTopWidth: 3 },
  bl: { left: 8, bottom: 8, borderLeftWidth: 3, borderBottomWidth: 3 },
  br: { right: 8, bottom: 8, borderRightWidth: 3, borderBottomWidth: 3 },
});

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.deepSea },
  top: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 12 },
  hit: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  counter: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.14)" },
  polaroid: {
    alignSelf: "center",
    width: 240,
    marginTop: 24,
    paddingTop: 10,
    paddingHorizontal: 10,
    paddingBottom: 10,
    borderRadius: 6,
    backgroundColor: colors.white,
    transform: [{ rotate: "-2deg" }],
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 32,
    shadowOffset: { width: 0, height: 16 },
    elevation: 12,
  },
  photo: { height: 170, overflow: "hidden" },
  glare: { position: "absolute", left: -10, top: -40, width: 80, height: 260, backgroundColor: "rgba(255,255,255,0.12)", transform: [{ rotate: "22deg" }] },
  scan: { position: "absolute", left: 0, right: 0, height: 3, backgroundColor: ACCENT, shadowColor: ACCENT, shadowOpacity: 0.8, shadowRadius: 10, shadowOffset: { width: 0, height: 0 } },
  corner: { position: "absolute", width: C, height: C, borderColor: ACCENT },
  diverZone: { height: 120, alignItems: "center", justifyContent: "center", marginTop: 18 },
  ping: { position: "absolute", width: 90, height: 90, borderRadius: 45, borderWidth: 2, borderColor: ACCENT },
  copy: { paddingHorizontal: 24, marginTop: 8 },
  steps: { marginTop: 20, marginHorizontal: 20, paddingVertical: 16, paddingHorizontal: 18, gap: 12, borderRadius: 22, backgroundColor: "rgba(255,255,255,0.09)", borderWidth: 1, borderColor: "rgba(255,255,255,0.14)" },
  stepRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  stepDot: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: "rgba(255,255,255,0.35)", alignItems: "center", justifyContent: "center" },
  stepDone: { backgroundColor: colors.oceanBlue, borderColor: colors.oceanBlue },
  stepNow: { borderColor: ACCENT, borderWidth: 2.5 },
  track: { flex: 1, height: 6, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.15)", overflow: "hidden" },
  fill: { height: 6, borderRadius: 3, backgroundColor: ACCENT },
  later: { marginTop: "auto", marginHorizontal: 20, marginBottom: 16, height: 52, borderRadius: 18, borderWidth: 1.5, borderColor: "rgba(255,255,255,0.35)", alignItems: "center", justifyContent: "center" },
});
