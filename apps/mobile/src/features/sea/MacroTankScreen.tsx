import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown, runOnJS, useAnimatedStyle, useSharedValue } from "react-native-reanimated";
import { GestureDetector, usePanGesture } from "react-native-gesture-handler";
import { Critter } from "../../components/Critter";
import { ChevronLeft, CloseIcon, SearchIcon } from "../../components/icons";
import { Txt } from "../../components/ui/Txt";
import type { CritterKind } from "../../data/illustrations";
import { colors } from "../../theme/tokens";
import { MacroScene } from "./MacroScene";
import { VideoScene } from "./VideoScene";
import { macroVideos } from "./sceneVideos";
import { useOceanSound } from "./oceanSound";
import { TANKS } from "./TankShell";
import { useCollection } from "../../api/queries";
import { SPECIES } from "../../data/species";

const NO_BY_ART = new Map(SPECIES.flatMap((s) => (s.art ? [[s.art, s.no] as const] : [])));

type Hidden = { kind: CritterKind; x: number; y: number; w: number; h: number; rot: number; name: string; short: string; en: string; size: string; date: string; hint?: string };

// Positions are on the 390×844 stage. Only macro species the diver has met are hidden in the reef.
const HIDDEN: Hidden[] = [
  { kind: "pygmy", x: 326, y: 372, w: 20, h: 24, rot: 0, name: "바기반트피그미해마", short: "피그미해마", en: "Bargibant's Pygmy Seahorse", size: "약 2cm", date: "", hint: "분홍 부채산호의 동글동글한 혹 사이" },
  { kind: "ghostpipe", x: 96, y: 304, w: 46, h: 20, rot: -35, name: "오네이트 고스트파이프피쉬", short: "고스트파이프", en: "Ornate Ghost Pipefish", size: "약 10cm", date: "", hint: "노란 바다나리 깃털 팔 사이에 거꾸로" },
  { kind: "seabunny", x: 236, y: 522, w: 16, h: 12, rot: 0, name: "바다토끼 누디브랜치", short: "바다토끼", en: "Sea Bunny", size: "약 1cm", date: "", hint: "노란 해면 아래, 쌀알만 한 흰 솜뭉치" },
  { kind: "pikachu", x: 168, y: 450, w: 28, h: 14, rot: -6, name: "피카츄 누디브랜치", short: "피카츄", en: "Pikachu Nudibranch", size: "약 2cm", date: "" },
  { kind: "pyjama", x: 58, y: 462, w: 30, h: 15, rot: 8, name: "파자마 누디브랜치", short: "파자마", en: "Pyjama Chromodoris", size: "약 5cm", date: "" },
  { kind: "harlequin", x: 300, y: 562, w: 28, h: 17, rot: 0, name: "하리퀸새우", short: "하리퀸", en: "Harlequin Shrimp", size: "약 5cm", date: "" },
  { kind: "mantis", x: 176, y: 606, w: 38, h: 21, rot: 0, name: "공작갯가재", short: "갯가재", en: "Peacock Mantis Shrimp", size: "약 15cm", date: "" },
  { kind: "boxercrab", x: 338, y: 612, w: 22, h: 16, rot: 0, name: "복서크랩", short: "복서크랩", en: "Boxer Crab", size: "약 2cm", date: "" },
];

const LENS = 140;
const ZOOM = 2.6;
const FIND_RADIUS = 20;
const NEAR_RADIUS = 46;

function Critters({ hidden, found, camouflage }: { hidden: Hidden[]; found: Set<CritterKind>; camouflage: boolean }) {
  return (
    <>
      {hidden.map((c) => (
        <View
          key={c.kind}
          pointerEvents="none"
          style={{
            position: "absolute",
            left: c.x - c.w / 2,
            top: c.y - c.h / 2,
            transform: [{ rotate: `${c.rot}deg` }],
            // Outside the lens, unfound critters blend into the reef.
            opacity: camouflage && !found.has(c.kind) ? 0.55 : 1,
          }}
        >
          <Critter kind={c.kind} width={c.w} height={c.h} />
        </View>
      ))}
    </>
  );
}

export function MacroTankScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [found, setFound] = useState<Set<CritterKind>>(() => new Set<CritterKind>());
  // Same ambience as the reef tank while the diver has sound on.
  useOceanSound("bubbles");
  const { data: collection } = useCollection();
  const hidden = useMemo<Hidden[]>(
    () =>
      HIDDEN.flatMap((c): Hidden[] => {
        const no = NO_BY_ART.get(c.kind);
        const mark = no ? collection?.get(no) : undefined;
        return mark ? [{ ...c, date: mark.firstSeen.replace(/-/g, ".") }] : [];
      }),
    [collection],
  );
  const [card, setCard] = useState<{ kind: CritterKind; fresh: boolean } | null>(null);
  const [near, setNear] = useState(false);
  const [hintI, setHintI] = useState(0);
  const [box, setBox] = useState({ w: 390, h: 844 });

  const scale = Math.max(box.w / 390, box.h / 844);
  const stage = { position: "absolute" as const, width: 390, height: 844, left: (box.w - 390) / 2, top: (box.h - 844) / 2 + box.h / 2 - 422 * scale, transform: [{ scale }] };

  const lx = useSharedValue(296);
  const ly = useSharedValue(392);
  const missing = hidden.filter((c) => !found.has(c.kind));

  const check = (x: number, y: number) => {
    const hit = missing.find((c) => Math.hypot(c.x - x, c.y - y) < FIND_RADIUS);
    if (hit) {
      setFound((f) => new Set(f).add(hit.kind));
      setCard({ kind: hit.kind, fresh: true });
      setNear(false);
      setHintI(0);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
      return;
    }
    const isNear = missing.some((c) => Math.hypot(c.x - x, c.y - y) < NEAR_RADIUS);
    if (isNear !== near) {
      setNear(isNear);
      if (isNear) void Haptics.selectionAsync().catch(() => undefined);
    }
  };

  const pan = usePanGesture({
    minDistance: 0,
    onBegin: (e) => {
      "worklet";
      lx.value = Math.max(40, Math.min(350, e.x));
      ly.value = Math.max(200, Math.min(650, e.y));
      runOnJS(check)(lx.value, ly.value);
    },
    onUpdate: (e) => {
      "worklet";
      lx.value = Math.max(40, Math.min(350, e.x));
      ly.value = Math.max(200, Math.min(650, e.y));
      runOnJS(check)(lx.value, ly.value);
    },
  });

  const lensStyle = useAnimatedStyle(() => ({ left: lx.value - LENS / 2, top: ly.value - LENS / 2 }));
  const lensInner = useAnimatedStyle(() => ({
    left: LENS / 2 - lx.value * ZOOM,
    top: LENS / 2 - ly.value * ZOOM,
  }));

  const hint = missing.length ? missing[hintI % missing.length].hint ?? `${missing[hintI % missing.length].short}를 찾아보세요` : null;
  const cardData = card ? hidden.find((c) => c.kind === card.kind) : undefined;
  const sceneMemo = useMemo(() => <VideoScene phase="day" videos={macroVideos} fallback={<MacroScene p="mcA" />} />, []);
  const lensScene = useMemo(() => <MacroScene p="mcL" />, []);

  return (
    <View style={styles.root} onLayout={(e) => setBox({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}>
      <GestureDetector gesture={pan}>
        <View style={stage} accessibilityLabel="돋보기 수조. 끌어서 돋보기를 움직이며 숨은 생물을 찾아요">
          {sceneMemo}
          <Critters hidden={hidden} found={found} camouflage />
          {hidden.filter((c) => found.has(c.kind)).map((c) => (
            <View key={c.kind} pointerEvents="none" style={{ position: "absolute", left: c.x - 20, top: c.y - 20, alignItems: "center" }}>
              <View style={styles.ring} />
              <View style={styles.tag}>
                <Txt size={9} weight="black">
                  {c.short}
                </Txt>
              </View>
            </View>
          ))}

          {/* Magnifier */}
          <Animated.View pointerEvents="none" style={[{ position: "absolute", width: LENS, height: LENS }, lensStyle]}>
            <View style={styles.lensClip}>
              <Animated.View style={[{ position: "absolute", width: 390 * ZOOM, height: 844 * ZOOM }, lensInner]}>
                <View style={{ width: 390, height: 844, transform: [{ scale: ZOOM }], transformOrigin: "top left" }}>
                  {lensScene}
                  <Critters hidden={hidden} found={found} camouflage={false} />
                </View>
              </Animated.View>
              <View style={styles.lensGlare} />
            </View>
            <View style={[styles.lensRing, { borderColor: near ? colors.sunny : "#E8EEF8" }]} />
            <View style={styles.handle} />
            {near && !card ? (
              <View style={styles.nearPill}>
                <Txt size={12} weight="bold" color={colors.white}>
                  조금만 더! 뭔가 있어요
                </Txt>
              </View>
            ) : null}
          </Animated.View>
        </View>
      </GestureDetector>

      <View style={[styles.top, { paddingTop: insets.top + 8 }]} pointerEvents="box-none">
        <View style={{ flexDirection: "row", gap: 10, alignItems: "flex-start" }} pointerEvents="box-none">
          <Pressable accessibilityRole="button" accessibilityLabel="산호초 수조로 돌아가기" onPress={() => (router.canGoBack() ? router.back() : router.replace("/sea/tank/reef"))} style={[styles.glass, styles.round]}>
            <ChevronLeft color={colors.white} />
          </Pressable>
          <View style={styles.glass}>
            <Txt accessibilityRole="header" size={19} weight="black" color={colors.white}>
              마크로 수조
            </Txt>
            <Txt size={11} color={colors.darkInkSoft}>
              돋보기를 끌어서 숨은 친구를 찾아요
            </Txt>
          </View>
        </View>
        <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }} pointerEvents="box-none">
          <View style={styles.counter} accessibilityLabel={`찾은 친구 ${found.size}종, 전체 ${hidden.length}종`} accessibilityLiveRegion="polite">
            <SearchIcon size={15} />
            <Txt size={12} weight="black">
              {found.size} / {hidden.length}
            </Txt>
            <View style={{ flexDirection: "row", gap: 3 }}>
              {hidden.map((c) => (
                <View key={c.kind} style={[styles.pip, { backgroundColor: found.has(c.kind) ? colors.sunny : colors.lineStrong }]} />
              ))}
            </View>
          </View>
          {hint ? (
            <Pressable accessibilityRole="button" accessibilityLabel={`힌트 · ${hint}. 누르면 다른 힌트`} onPress={() => setHintI((i) => i + 1)} style={styles.hint}>
              <Txt size={11} weight="black" color={colors.sunny} style={{ flexShrink: 0 }}>
                힌트
              </Txt>
              <Txt size={11} weight="bold" color="#FFE7A3" numberOfLines={1} style={{ flexShrink: 1 }}>
                {hint}
              </Txt>
            </Pressable>
          ) : null}
        </View>
      </View>

      {card && cardData ? (
        <Animated.View entering={FadeInDown.springify().damping(14)} style={[styles.card, { bottom: 100 + insets.bottom }]} accessibilityRole="alert">
          <Pressable accessibilityRole="button" accessibilityLabel="닫기" onPress={() => setCard(null)} style={styles.cardClose}>
            <CloseIcon size={14} color={colors.ink2} />
          </Pressable>
          <View style={styles.cardArt}>
            <Critter kind={cardData.kind} width={84} height={62} />
          </View>
          <View style={{ flex: 1, paddingRight: 22 }}>
            <Txt size={11} weight="black" color={card.fresh ? colors.coral : colors.oceanBlue}>
              {card.fresh ? "찾았다! 오늘의 발견 +1" : "마크로 수조 친구"}
            </Txt>
            <Txt size={16} weight="black">
              {cardData.name}
            </Txt>
            <Txt size={11} color={colors.inkSoft}>
              {cardData.en}
            </Txt>
            <Txt size={11} color={colors.inkSoft}>
              실제 크기 {cardData.size}
            </Txt>
            <Txt size={12} color={colors.ink2} style={{ marginTop: 4 }}>
              처음 만난 날 {cardData.date}
            </Txt>
            {NO_BY_ART.get(cardData.kind) ? (
              <Pressable accessibilityRole="button" onPress={() => router.push({ pathname: "/species/[no]", params: { no: NO_BY_ART.get(cardData.kind)! } })} style={styles.cardCta}>
                <Txt size={12} weight="bold" color={colors.white}>
                  도감에서 보기
                </Txt>
              </Pressable>
            ) : null}
          </View>
        </Animated.View>
      ) : null}

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={[styles.tray, { bottom: 86 + insets.bottom }]} contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}>
        {hidden.map((c) => {
          const f = found.has(c.kind);
          return (
            <Pressable
              key={c.kind}
              disabled={!f}
              accessibilityRole="button"
              accessibilityLabel={f ? `${c.name} 보기` : "아직 못 찾은 친구"}
              onPress={() => setCard({ kind: c.kind, fresh: false })}
              style={[styles.slot, f ? styles.slotOn : styles.slotOff]}
            >
              <Critter kind={c.kind} width={46} height={34} ghost={!f} />
              <Txt size={10} weight="extraBold" color={f ? colors.white : "#8FA6C8"}>
                {f ? c.short : "???"}
              </Txt>
            </Pressable>
          );
        })}
      </ScrollView>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={[styles.switcher, { bottom: 16 + insets.bottom }]}
        contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}
      >
        {TANKS.map((t) => {
          const on = t.key === "macro";
          return (
            <Pressable
              key={t.key}
              disabled={on || t.locked || !t.href}
              onPress={() => t.href && router.replace(t.href)}
              accessibilityRole="button"
              accessibilityState={{ selected: on, disabled: !!t.locked }}
              accessibilityLabel={`${t.name}${on ? ", 지금 보는 중" : ""}`}
              style={[styles.switcherChip, on ? styles.switcherOn : styles.switcherOff]}
            >
              <Txt size={13} weight={on ? "black" : "extraBold"} color={on ? colors.navy : colors.white}>
                {t.name}
              </Txt>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#071A33", overflow: "hidden" },
  ring: { width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderStyle: "dashed", borderColor: "rgba(247,201,72,0.85)" },
  tag: { marginTop: 1, paddingHorizontal: 7, paddingVertical: 1, borderRadius: 999, backgroundColor: "rgba(247,201,72,0.92)" },
  lensClip: { position: "absolute", width: LENS, height: LENS, borderRadius: LENS / 2, overflow: "hidden", backgroundColor: "#071A33" },
  lensGlare: { position: "absolute", left: 22, top: 18, width: 46, height: 26, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.22)", transform: [{ rotate: "-30deg" }] },
  lensRing: { position: "absolute", left: -6, top: -6, width: LENS + 12, height: LENS + 12, borderRadius: (LENS + 12) / 2, borderWidth: 6 },
  handle: { position: "absolute", left: LENS - 14, top: LENS - 14, width: 16, height: 58, borderRadius: 9, backgroundColor: "#1F3F7A", transform: [{ rotate: "-45deg" }] },
  nearPill: { position: "absolute", top: -40, alignSelf: "center", paddingHorizontal: 12, height: 28, borderRadius: 999, backgroundColor: colors.sunny, justifyContent: "center" },
  top: { position: "absolute", left: 16, right: 16, top: 0, gap: 10 },
  glass: { backgroundColor: "rgba(8,24,58,0.5)", borderWidth: 1, borderColor: "rgba(169,210,255,0.22)", borderRadius: 12, paddingVertical: 8, paddingHorizontal: 14 },
  round: { width: 44, height: 44, borderRadius: 22, paddingVertical: 0, paddingHorizontal: 0, alignItems: "center", justifyContent: "center" },
  counter: { height: 34, paddingHorizontal: 12, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.94)", flexDirection: "row", alignItems: "center", gap: 8 },
  pip: { width: 7, height: 7, borderRadius: 4 },
  hint: { flex: 1, height: 34, paddingHorizontal: 12, borderRadius: 999, borderWidth: 1, borderColor: "rgba(247,201,72,0.5)", backgroundColor: "rgba(8,24,58,0.55)", flexDirection: "row", alignItems: "center", gap: 6 },
  card: { position: "absolute", left: 16, right: 16, flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 12, backgroundColor: colors.white },
  cardCta: { alignSelf: "flex-start", marginTop: 8, height: 34, paddingHorizontal: 12, borderRadius: 10, backgroundColor: colors.navy, justifyContent: "center" },
  cardClose: { position: "absolute", right: 6, top: 6, width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  cardArt: { width: 96, height: 76, borderRadius: 12, backgroundColor: colors.sky, alignItems: "center", justifyContent: "center" },
  tray: { position: "absolute", left: 0, right: 0, flexGrow: 0 },
  slot: { width: 66, height: 62, borderRadius: 12, alignItems: "center", justifyContent: "center", gap: 3 },
  slotOn: { backgroundColor: "rgba(255,255,255,0.16)", borderWidth: 1, borderColor: "rgba(169,210,255,0.35)" },
  slotOff: { backgroundColor: "rgba(8,24,58,0.5)", borderWidth: 1.5, borderStyle: "dashed", borderColor: "rgba(169,210,255,0.35)" },
  switcher: { position: "absolute", left: 0, right: 0, flexGrow: 0 },
  switcherChip: { minWidth: 112, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 12, alignItems: "center" },
  switcherOn: { backgroundColor: "rgba(255,255,255,0.92)" },
  switcherOff: { backgroundColor: "rgba(8,24,58,0.5)", borderWidth: 1, borderColor: "rgba(169,210,255,0.25)" },
});
