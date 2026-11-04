import { useEffect } from "react";
import { Pressable, Share, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";
import { Critter } from "../../components/Critter";
import { ChevronRight, CloseIcon, GlobeIcon, ShareIcon } from "../../components/icons";
import { NameTag } from "../../components/ui/NameTag";
import { Txt } from "../../components/ui/Txt";
import { SPECIES_BY_NO } from "../../data/species";
import { MOCK_COLLECTION } from "../../mocks/collection";
import { MOCK_RESULT } from "../../mocks/discover";
import { MOCK_QUESTS } from "../../mocks/home";
import { colors } from "../../theme/tokens";
import { useDiscover } from "./discoverStore";

function Sparkle({ x, y, s, delay }: { x: number; y: number; s: number; delay: number }) {
  const v = useSharedValue(0.3);
  const reduced = useReducedMotion();
  useEffect(() => {
    if (!reduced) v.value = withDelay(delay, withRepeat(withSequence(withTiming(1, { duration: 700 }), withTiming(0.25, { duration: 700 })), -1));
  }, [v, delay, reduced]);
  const style = useAnimatedStyle(() => ({ opacity: v.value, transform: [{ scale: 0.8 + 0.35 * v.value }] }));
  return (
    <Animated.View style={[{ position: "absolute", left: x, top: y }, style]} pointerEvents="none">
      <Svg width={s} height={s} viewBox="0 0 24 24">
        <Path d="M12 2 L14 10 L22 12 L14 14 L12 22 L10 14 L2 12 L10 10 Z" fill={colors.sunny} />
      </Svg>
    </Animated.View>
  );
}

export function DiscoverCollectedScreen() {
  const router = useRouter();
  const reduced = useReducedMotion();
  const { pickedCandidate } = useDiscover();
  const cand = MOCK_RESULT.candidates[pickedCandidate] ?? MOCK_RESULT.candidates[0];
  const s = SPECIES_BY_NO[cand.no];
  const nth = MOCK_COLLECTION.length;
  const saved = MOCK_RESULT.saved;
  const q = MOCK_QUESTS.region;

  const stamp = useSharedValue(reduced ? 1 : 2.4);
  const stampOpacity = useSharedValue(reduced ? 1 : 0);
  useEffect(() => {
    if (!cand.isNewForMe || reduced) return;
    stampOpacity.value = withDelay(700, withTiming(1, { duration: 120 }));
    stamp.value = withDelay(700, withSpring(1, { damping: 9, stiffness: 180 }));
    const t = setTimeout(() => void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined), 800);
    return () => clearTimeout(t);
  }, [cand.isNewForMe, reduced, stamp, stampOpacity]);
  const stampStyle = useAnimatedStyle(() => ({ opacity: stampOpacity.value, transform: [{ rotate: "-12deg" }, { scale: stamp.value }] }));

  return (
    <SafeAreaView style={styles.root}>
      <Sparkle x={48} y={150} s={16} delay={0} />
      <Sparkle x={330} y={130} s={20} delay={700} />
      <Sparkle x={300} y={470} s={14} delay={1300} />

      <View style={styles.topRow}>
        <Pressable accessibilityRole="button" accessibilityLabel="닫기" onPress={() => router.navigate("/")} style={styles.close}>
          <CloseIcon />
        </Pressable>
      </View>

      <Animated.View entering={FadeIn.duration(400)} style={styles.headline}>
        <Txt size={12} weight="extraBold" tracking={0.14} color={colors.oceanBlue}>
          MY SPECIES BOOK · No.{s.no}
        </Txt>
        <Txt accessibilityRole="header" size={22} weight="black" align="center">
          {cand.isNewForMe ? `도감의 ${nth}번째 친구가 생겼어요!` : `${s.nameKo}를 또 만났어요!`}
        </Txt>
      </Animated.View>

      <Animated.View entering={reduced ? undefined : FadeInDown.springify().damping(14).delay(150)} style={styles.card}>
        <View style={styles.cardArt}>{s.art ? <Critter kind={s.art} width={290} height={138} /> : null}</View>
        <NameTag ko={s.nameKo} en={`${s.nameEn} · ${s.sciName}`} size="md" filled style={{ marginTop: -20 }} />
        <View style={styles.meta}>
          {(
            [
              ["날짜", saved.date],
              ["포인트", saved.point],
              ["수심", saved.depth],
            ] as const
          ).map(([k, v], i) => (
            <View key={k} style={[styles.metaCell, i === 1 && styles.metaMid]}>
              <Txt size={12} color={colors.ink2}>
                {k}
              </Txt>
              <Txt size={12} weight="extraBold">
                {v}
              </Txt>
            </View>
          ))}
        </View>
        {cand.isNewForMe ? (
          <Animated.View style={[styles.stamp, stampStyle]} accessibilityLabel="새로운 만남 도장">
            <Txt size={20} weight="black" color={colors.coral} tracking={0.06}>
              NEW
            </Txt>
            <Txt size={15} weight="black" color={colors.coral}>
              ENCOUNTER!
            </Txt>
          </Animated.View>
        ) : null}
      </Animated.View>

      <Animated.View entering={reduced ? undefined : FadeInDown.delay(500)} style={styles.extras}>
        <View style={styles.quest}>
          <View style={styles.questBadge}>
            <GlobeIcon size={20} />
          </View>
          <View style={{ flex: 1 }}>
            <Txt size={14} weight="black">
              {q.title}까지 {q.remaining}종!
            </Txt>
            <View style={styles.qTrack}>
              <View style={[styles.qFill, { width: `${(q.current / q.goal) * 100}%` }]} />
            </View>
          </View>
          <Txt size={13} weight="black">
            {q.current} / {q.goal}
          </Txt>
        </View>
        <Pressable accessibilityRole="link" onPress={() => router.navigate("/sea")} style={styles.seaLink}>
          <Txt size={14} weight="extraBold" style={{ flex: 1 }}>
            나의 바다에 새 친구가 헤엄쳐 들어왔어요
          </Txt>
          <ChevronRight />
        </Pressable>
      </Animated.View>

      <View style={styles.bottom}>
        <Pressable accessibilityRole="button" onPress={() => router.navigate("/log")} style={styles.primary}>
          <Txt size={16} weight="black" color={colors.white}>
            그림일기에 스티커로 붙이기
          </Txt>
        </Pressable>
        <View style={{ flexDirection: "row", gap: 10 }}>
          <Pressable accessibilityRole="button" onPress={() => router.navigate("/dogam")} style={styles.secondary}>
            <Txt size={15} weight="bold">
              도감에서 보기
            </Txt>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="카드 공유하기"
            onPress={() => void Share.share({ message: `오션 다이어리에서 ${s.nameKo}를 만났어요! (${saved.date} ${saved.point})` })}
            style={styles.square}
          >
            <ShareIcon />
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#EAF3FC" },
  topRow: { paddingHorizontal: 12 },
  close: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  headline: { marginTop: 4, alignItems: "center", paddingHorizontal: 20, gap: 4 },
  card: {
    marginTop: 20,
    marginHorizontal: 30,
    paddingTop: 14,
    paddingHorizontal: 14,
    paddingBottom: 18,
    borderRadius: 26,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    shadowColor: "#1E468C",
    shadowOpacity: 0.16,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: 18 },
    elevation: 8,
  },
  cardArt: { height: 200, borderRadius: 18, backgroundColor: colors.mist, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  meta: { flexDirection: "row", marginTop: 14 },
  metaCell: { flex: 1, alignItems: "center" },
  metaMid: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: "#E6EEF8" },
  stamp: { position: "absolute", right: -14, top: 104, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 3, borderColor: colors.coral, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.85)", alignItems: "center" },
  extras: { marginTop: 18, marginHorizontal: 20, gap: 8 },
  quest: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12, paddingHorizontal: 14, borderRadius: 18, backgroundColor: "#FFF7DC", borderWidth: 1, borderColor: "#F3DE95" },
  questBadge: { width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderStyle: "dashed", borderColor: colors.navy, backgroundColor: colors.sunny, alignItems: "center", justifyContent: "center" },
  qTrack: { height: 6, borderRadius: 3, marginTop: 6, backgroundColor: "#F3DE95", overflow: "hidden" },
  qFill: { height: 6, borderRadius: 3, backgroundColor: colors.navy },
  seaLink: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 12, paddingHorizontal: 14, borderRadius: 18, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line },
  bottom: { marginTop: "auto", marginHorizontal: 20, marginBottom: 16, gap: 10 },
  primary: { height: 54, borderRadius: 18, backgroundColor: colors.oceanBlue, alignItems: "center", justifyContent: "center" },
  secondary: { flex: 1, height: 50, borderRadius: 16, borderWidth: 1.5, borderColor: colors.lineStrong, backgroundColor: colors.white, alignItems: "center", justifyContent: "center" },
  square: { width: 50, height: 50, borderRadius: 16, borderWidth: 1.5, borderColor: colors.lineStrong, backgroundColor: colors.white, alignItems: "center", justifyContent: "center" },
});
