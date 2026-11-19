import { useEffect, useRef } from "react";
import { Animated, Easing, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Svg, { Circle, Path } from "react-native-svg";
import { Txt } from "../../components/ui/Txt";
import { colors } from "../../theme/tokens";

/**
 * 02 발견 · 자동 생성 — AI가 "우리 도감에 없는 종"이라고 판정했을 때 뜨는
 * 플로우. Discover-Result에서 '도감에 없는 친구' 결과가 나오면 여기로 넘어와요.
 *
 * 설계서 아트보드 `Discover-Autogen.dc.html` 과 1:1 구조:
 *   Hero (사진 썸네일 + AI 식별 결과)
 *   → "Mola 화풍 일러스트 그리는 중" (shimmer)
 *   → 4단계 자동 등록 플로우 (스펙·화풍·일러스트·검증)
 *   → 관리자 검증 안내 (일주일 안에)
 *   → "임시 카드로 추가" / "알림 받기"
 */
export function DiscoverAutogenScreen() {
  const router = useRouter();
  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.safe}>
      <Header onBack={() => (router.canGoBack() ? router.back() : router.replace("/(tabs)/discover"))} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Hero />
        <IllustrationLoader />
        <FlowSteps />
        <AdminNotice />
        <View style={styles.ctaRow}>
          <Pressable
            style={[styles.cta, styles.ctaGhost]}
            onPress={() => router.replace("/(tabs)/dogam")}
            accessibilityRole="button"
            accessibilityLabel="일러스트 완성되면 알림 받기"
          >
            <Txt size={13} weight="extraBold" color={colors.navy}>알림 받기</Txt>
          </Pressable>
          <Pressable
            style={[styles.cta, styles.ctaPrimary]}
            onPress={() => router.replace("/discover/collected")}
            accessibilityRole="button"
            accessibilityLabel="임시 카드로 도감에 추가하기"
          >
            <Txt size={14} weight="black" color={colors.white}>임시 카드로 추가 ›</Txt>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Header({ onBack }: { onBack: () => void }) {
  return (
    <View style={styles.header}>
      <Pressable onPress={onBack} accessibilityRole="button" accessibilityLabel="돌아가기" style={styles.back} hitSlop={6}>
        <Svg width={18} height={18} viewBox="0 0 24 24">
          <Path d="M15 6 L9 12 L15 18" stroke={colors.navy} strokeWidth={2.2} strokeLinecap="round" fill="none" />
        </Svg>
      </Pressable>
      <View style={{ flex: 1 }}>
        <Txt size={11} weight="extraBold" color={colors.oceanBlue} tracking={0.14}>02 발견 · 자동 생성</Txt>
        <Txt size={18} weight="black" color={colors.navy} tracking={-0.02}>도감에 없는 새 종이에요!</Txt>
      </View>
    </View>
  );
}

function Hero() {
  return (
    <View style={styles.hero}>
      <View style={styles.heroRow}>
        <View style={styles.userPhoto}>
          <Svg width={34} height={34} viewBox="0 0 24 24">
            <Path d="M3 5 H21 V20 H3 Z" stroke="#8EC5FF" strokeWidth={1.6} fill="none" strokeLinejoin="round" />
            <Circle cx={12} cy={12.5} r={3.5} stroke="#8EC5FF" strokeWidth={1.6} fill="none" />
            <Path d="M8 5 L9.5 2.5 H14.5 L16 5" stroke="#8EC5FF" strokeWidth={1.6} fill="none" strokeLinejoin="round" />
          </Svg>
          <Txt size={9} weight="bold" color="#B9DCFF" style={{ marginTop: 4 }}>사용자 업로드</Txt>
        </View>
        <View style={{ flex: 1 }}>
          <Txt size={10} weight="extraBold" color={colors.ink3} tracking={0.08}>AI 식별 결과</Txt>
          <Txt size={16} weight="black" color={colors.navy} tracking={-0.01} style={{ marginTop: 2 }}>리본각시우럭</Txt>
          <Txt size={12} color={colors.ink2} style={{ fontStyle: "italic", marginTop: 1 }}>
            Pseudanthias squamipinnis
          </Txt>
          <View style={styles.confidence}>
            <Txt size={11} weight="black" color={colors.navy}>신뢰도 82%</Txt>
          </View>
        </View>
      </View>
      <View style={styles.heroNote}>
        <Txt size={12} color="#1F4FA8" style={{ lineHeight: 18 }}>
          우리 도감에 아직 없는 친구예요. Mola가 <Txt weight="black" color={colors.navy}>수채화 화풍</Txt>으로 일러스트를 그리고 있어요.
        </Txt>
      </View>
    </View>
  );
}

function IllustrationLoader() {
  // Pulse the fish silhouette while the "generation" is in progress.
  const pulse = useRef(new Animated.Value(0.85)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.05, duration: 1100, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.85, duration: 1100, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  return (
    <View style={styles.card}>
      <View style={styles.cardTitle}>
        <Svg width={16} height={16} viewBox="0 0 24 24">
          <Path d="M3 21 L7 17 L14 10 L18 14 L11 21 Z" stroke={colors.oceanBlue} strokeWidth={2} fill="none" strokeLinejoin="round" />
          <Path d="M14 10 L17 7 L20 10 L17 13" stroke={colors.oceanBlue} strokeWidth={2} fill="none" strokeLinejoin="round" />
        </Svg>
        <Txt size={12} weight="extraBold" color={colors.navy}>Mola 화풍 일러스트 그리는 중</Txt>
        <Txt size={12} color={colors.ink3}> · 약 1–2분</Txt>
      </View>
      <View style={styles.shimmerBox}>
        <Animated.View style={{ transform: [{ scale: pulse }], opacity: 0.6 }}>
          <Svg width={80} height={52} viewBox="0 0 60 40">
            <Path
              d="M4 20 C14 8 32 7 46 14 L56 7 V33 L46 26 C32 33 14 32 4 20 Z"
              stroke={colors.ghostInk}
              strokeWidth={1.8}
              fill="none"
              strokeLinejoin="round"
            />
            <Circle cx={15} cy={18} r={1.5} fill={colors.ghostInk} />
          </Svg>
        </Animated.View>
      </View>
      <View style={styles.cardFooter}>
        <Txt size={11} color={colors.ink2}>투명 배경 · 네이비 외곽선 · 실사형 채색</Txt>
        <Txt size={11} weight="extraBold" color={colors.oceanBlue}>62%</Txt>
      </View>
    </View>
  );
}

function FlowSteps() {
  type Step = { n: string; title: string; sub: string; done?: boolean; active?: boolean; pending?: boolean };
  const steps: Step[] = [
    { n: "✓", title: "스펙 수집", sub: "학명·크기·서식지·수심 · 공공 데이터베이스 연동", done: true },
    { n: "✓", title: "우리 화풍 분석", sub: "기존 32종 일러스트의 색·선 두께·채색 톤 학습", done: true },
    { n: "3", title: "일러스트 생성", sub: "3가지 안을 만들고 그중 가장 화풍이 맞는 걸 자동 선택", active: true },
    { n: "4", title: "관리자 검증", sub: "일주일에 한 번 관리자가 데이터·일러스트 정확도 확인", pending: true },
  ];
  return (
    <View style={styles.card}>
      <Txt size={12} weight="extraBold" color={colors.navy} style={{ marginBottom: 12 }}>
        자동 등록 플로우
      </Txt>
      {steps.map((s, i) => (
        <View key={i} style={styles.step}>
          <View
            style={[
              styles.stepNo,
              s.done && { backgroundColor: colors.success },
              s.active && { backgroundColor: colors.oceanBlue },
              s.pending && styles.stepPending,
            ]}
          >
            <Txt size={s.done ? 11 : 10} weight="black" color={s.pending ? colors.ink3 : colors.white}>
              {s.n}
            </Txt>
          </View>
          <View style={{ flex: 1 }}>
            <Txt
              size={13}
              weight="extraBold"
              color={s.active ? colors.oceanBlue : s.pending ? colors.ink3 : colors.navy}
            >
              {s.title}
              {s.active ? <Txt color={colors.ink2} weight="medium"> · 진행 중</Txt> : null}
            </Txt>
            <Txt size={11} color={s.pending ? colors.ghostInk : colors.ink3} style={{ marginTop: 1 }}>
              {s.sub}
            </Txt>
          </View>
        </View>
      ))}
    </View>
  );
}

function AdminNotice() {
  return (
    <View style={styles.notice}>
      <View style={styles.noticeBadge}>
        <Txt size={12} weight="black" color={colors.navy}>!</Txt>
      </View>
      <View style={{ flex: 1 }}>
        <Txt size={11.5} color="#5D4B0E" style={{ lineHeight: 17 }}>
          <Txt weight="black" color={colors.navy}>일주일 안에 공식 등록</Txt>이 돼요.
          그 전까지는 "검증 대기" 뱃지가 붙은 임시 카드예요. 관리자가 확인 후 데이터·일러스트가 수정될 수 있어요.
        </Txt>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.mist },
  scroll: { paddingBottom: 48, gap: 14 },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16, flexDirection: "row", alignItems: "center", gap: 12 },
  back: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: "center",
    justifyContent: "center",
  },
  hero: {
    marginHorizontal: 20,
    padding: 18,
    borderRadius: 22,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.lineStrong,
  },
  heroRow: { flexDirection: "row", gap: 14, alignItems: "flex-start" },
  userPhoto: {
    width: 76,
    height: 76,
    borderRadius: 14,
    backgroundColor: colors.navy,
    alignItems: "center",
    justifyContent: "center",
  },
  confidence: {
    alignSelf: "flex-start",
    marginTop: 8,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: colors.sunny,
  },
  heroNote: {
    marginTop: 14,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "rgba(47,111,219,0.08)",
  },
  card: {
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 22,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
  },
  cardTitle: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 10, flexWrap: "wrap" },
  shimmerBox: {
    height: 160,
    borderRadius: 14,
    backgroundColor: colors.ghostBg,
    alignItems: "center",
    justifyContent: "center",
  },
  cardFooter: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  step: { flexDirection: "row", gap: 10, marginBottom: 14, alignItems: "flex-start" },
  stepNo: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.track,
    alignItems: "center",
    justifyContent: "center",
  },
  stepPending: {
    backgroundColor: colors.track,
    borderWidth: 1.5,
    borderColor: colors.ghostLine,
    borderStyle: "dashed",
  },
  notice: {
    marginHorizontal: 20,
    padding: 12,
    borderRadius: 14,
    backgroundColor: "#FFF8E0",
    borderWidth: 1,
    borderColor: "#F3DE95",
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
  },
  noticeBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.sunny,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaRow: { flexDirection: "row", gap: 10, marginHorizontal: 20, marginTop: 4 },
  cta: { height: 50, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  ctaGhost: { flex: 0.4, backgroundColor: colors.white, borderWidth: 1.5, borderColor: colors.lineStrong },
  ctaPrimary: { flex: 0.6, backgroundColor: colors.oceanBlue },
});
