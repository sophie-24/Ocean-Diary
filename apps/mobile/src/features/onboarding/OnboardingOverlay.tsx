import { useEffect, useRef, useState, type ComponentType } from "react";
import { Modal, Platform, Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeIn, FadeOut, SlideInRight, SlideOutLeft } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { Txt } from "../../components/ui/Txt";
import {
  CheckIcon,
  FishIcon,
  GlobeIcon,
  SparkleIcon,
  StampBookIcon,
  type IconProps,
} from "../../components/icons";
import { colors } from "../../theme/tokens";
import { useAuth } from "../../api/auth";
import { onboardingStore, useOnboarding } from "./onboardingStore";

/**
 * 첫 회원가입(혹은 첫 로그인) 시 자동으로 한 번, 그리고 프로필의
 * '앱 소개 다시 보기'에서 수동으로 여는 How-to-use 팝업. 실제 각 탭 위에
 * 떠있는 모달이라 라우팅 상태를 건드리지 않는다.
 *
 * Steps are kept short on purpose — if the walkthrough itself feels like
 * homework, the diver skips it and loses the 1:1 mapping between what's on
 * screen and what each tab does. One idea per step, Korean copy, nothing
 * that requires remembering numbers.
 */

type IconKind = "sparkle" | "fish" | "stampbook" | "globe" | "check";
type Step = {
  key: string;
  icon: IconKind;
  accent: string;
  title: string;
  body: string;
};

const STEPS: Step[] = [
  {
    key: "welcome",
    icon: "sparkle",
    accent: colors.oceanBlue,
    title: "Mola에 오신 걸 환영해요",
    body: "다이빙 기록을 그림일기처럼 남기고,\n만난 바다 친구들을 도감으로 모아보세요.",
  },
  {
    key: "discover",
    icon: "fish",
    accent: colors.oceanBlue,
    title: "사진 한 장으로 생물 식별",
    body: "‘발견’ 탭에서 수중 사진을 올리면\nMola가 종(種)을 알아보고\n도감에 자동으로 기록해요.",
  },
  {
    key: "log",
    icon: "stampbook",
    accent: colors.sunny,
    title: "로그북 & 그림일기",
    body: "‘로그북’ 탭에서 그 날의 다이빙을\n짧은 기록과 그림일기로 남겨요.\n명소 스탬프도 함께 쌓여요.",
  },
  {
    key: "sea",
    icon: "globe",
    accent: colors.success,
    title: "나의 바다",
    body: "수집한 친구들이 수조 안을 헤엄쳐요.\n지도에서 어느 나라에서 만났는지도\n한눈에 볼 수 있어요.",
  },
  {
    key: "ready",
    icon: "check",
    accent: colors.success,
    title: "자, 이제 바다로 출발!",
    body: "언제든 ‘내 계정 › 앱 소개 다시 보기’에서\n이 안내를 다시 열 수 있어요.",
  },
];

const ICONS: Record<IconKind, ComponentType<IconProps>> = {
  sparkle: SparkleIcon,
  fish: FishIcon,
  stampbook: StampBookIcon,
  globe: GlobeIcon,
  check: CheckIcon,
};

/** Fire a light haptic when it's available; no-op on web / unsupported devices. */
function tapHaptic() {
  if (Platform.OS === "web") return;
  Haptics.selectionAsync().catch(() => undefined);
}

export function OnboardingOverlay() {
  const { signedIn, loading } = useAuth();
  const { open, loaded, seen } = useOnboarding();
  const [i, setI] = useState(0);
  // Snapshot the direction so step transitions animate right-to-left on "다음"
  // and left-to-right on "이전".
  const dir = useRef<1 | -1>(1);

  // Auto-open once per device, after the auth state has settled and the
  // AsyncStorage flag has been read. Repeated effect runs are harmless
  // because `autoOpenIfFirstTime` short-circuits when already seen.
  useEffect(() => {
    if (loading) return;
    if (!signedIn) return;
    if (!loaded) return;
    if (seen) return;
    onboardingStore.autoOpenIfFirstTime();
  }, [loading, signedIn, loaded, seen]);

  // Every time the overlay opens, start from step 0.
  useEffect(() => {
    if (open) {
      dir.current = 1;
      setI(0);
    }
  }, [open]);

  const last = i >= STEPS.length - 1;
  const step = STEPS[i];
  const Icon = ICONS[step.icon];

  const goNext = () => {
    tapHaptic();
    if (last) {
      onboardingStore.markSeen();
      return;
    }
    dir.current = 1;
    setI((n) => Math.min(n + 1, STEPS.length - 1));
  };

  const goPrev = () => {
    tapHaptic();
    dir.current = -1;
    setI((n) => Math.max(0, n - 1));
  };

  const skip = () => {
    tapHaptic();
    onboardingStore.markSeen();
  };

  return (
    <Modal
      visible={open}
      animationType="fade"
      transparent
      statusBarTranslucent
      onRequestClose={skip}
    >
      <View style={styles.backdrop}>
        <SafeAreaView style={styles.safe} edges={["top", "bottom", "left", "right"]}>
          <View style={styles.topRow}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="앱 소개 건너뛰기"
              onPress={skip}
              hitSlop={10}
              style={styles.skipBtn}
            >
              <Txt size={13} weight="extraBold" color={colors.white}>
                건너뛰기
              </Txt>
            </Pressable>
          </View>

          <Animated.View
            key={step.key}
            entering={dir.current === 1 ? SlideInRight.duration(220) : FadeIn.duration(180)}
            exiting={dir.current === 1 ? SlideOutLeft.duration(220) : FadeOut.duration(180)}
            style={styles.card}
          >
            <View
              style={[
                styles.iconBubble,
                { backgroundColor: step.accent + "1F", borderColor: step.accent },
              ]}
            >
              <Icon size={34} color={step.accent} strokeWidth={2} />
            </View>

            <Txt size={22} weight="black" color={colors.navy} style={styles.title}>
              {step.title}
            </Txt>
            <Txt size={15} color={colors.ink2} style={styles.body}>
              {step.body}
            </Txt>

            <View style={styles.dots}>
              {STEPS.map((s, idx) => (
                <View
                  key={s.key}
                  style={[styles.dot, idx === i ? styles.dotOn : styles.dotOff]}
                />
              ))}
            </View>

            <View style={styles.footer}>
              {i > 0 ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="이전 단계"
                  onPress={goPrev}
                  style={[styles.btn, styles.btnGhost]}
                >
                  <Txt size={15} weight="extraBold" color={colors.navy}>
                    이전
                  </Txt>
                </Pressable>
              ) : (
                // Spacer that preserves the primary button's width when there's
                // no "이전" button yet, so the primary CTA doesn't jump.
                <View style={[styles.btn, styles.btnSpacer]} pointerEvents="none" />
              )}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={last ? "앱 소개 닫고 시작하기" : "다음 단계"}
                onPress={goNext}
                style={[styles.btn, styles.btnPrimary]}
              >
                <Txt size={15} weight="black" color={colors.white}>
                  {last ? "시작하기" : "다음"}
                </Txt>
              </Pressable>
            </View>
          </Animated.View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(8,24,58,0.72)" },
  safe: { flex: 1, paddingHorizontal: 20, justifyContent: "space-between" },
  topRow: { flexDirection: "row", justifyContent: "flex-end", paddingTop: 8 },
  skipBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.14)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.28)",
  },
  card: {
    marginBottom: 24,
    padding: 24,
    borderRadius: 24,
    backgroundColor: colors.white,
    alignItems: "center",
    gap: 10,
  },
  iconBubble: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    marginBottom: 4,
  },
  title: { textAlign: "center" },
  body: { textAlign: "center", lineHeight: 22, marginTop: 2 },
  dots: { flexDirection: "row", gap: 6, marginTop: 14 },
  dot: { height: 8, borderRadius: 4 },
  dotOn: { width: 22, backgroundColor: colors.oceanBlue },
  dotOff: { width: 8, backgroundColor: colors.line },
  footer: { flexDirection: "row", gap: 10, marginTop: 20, alignSelf: "stretch" },
  btn: { flex: 1, paddingVertical: 14, borderRadius: 16, alignItems: "center" },
  btnPrimary: { backgroundColor: colors.oceanBlue },
  btnGhost: { backgroundColor: colors.mist, borderWidth: 1, borderColor: colors.line },
  btnSpacer: { backgroundColor: "transparent" },
});
