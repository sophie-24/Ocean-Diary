import { Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Svg, { Circle, Path } from "react-native-svg";
import { Txt } from "../../src/components/ui/Txt";
import { colors } from "../../src/theme/tokens";

/**
 * 나의 바다 탭 — 수족관을 리뉴얼하는 동안 "준비 중" placeholder.
 * 수족관 코드(/sea/tank/*)는 유지돼있고, 리뉴얼 끝나면 다시 landing으로 돌려요.
 * 지도는 도감 탭으로 이동해서 그 탭의 default view가 됐어요.
 */
export default function SeaTab() {
  const router = useRouter();
  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.safe}>
      <View style={styles.wrap}>
        <View style={styles.iconBg}>
          <Svg width={56} height={56} viewBox="0 0 24 24">
            <Path d="M3 12 Q6 9 9 12 Q12 15 15 12 Q18 9 21 12" stroke={colors.oceanBlue} strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M4 7 Q6 6 8 7 M16 17 Q18 16 20 17" stroke={colors.oceanBlue} strokeWidth={2} fill="none" strokeLinecap="round" />
            <Circle cx={7} cy={10} r={0.8} fill={colors.oceanBlue} />
            <Circle cx={17} cy={14} r={0.8} fill={colors.oceanBlue} />
          </Svg>
        </View>
        <Txt size={11} weight="extraBold" color={colors.oceanBlue} tracking={0.14}>MY OCEAN · 준비 중</Txt>
        <Txt size={24} weight="black" color={colors.navy} tracking={-0.02} style={styles.title}>
          수조를 다듬고 있어요
        </Txt>
        <Txt size={14} color={colors.ink2} style={styles.lead}>
          대양 · 산호초 · 마크로 수조를 더 깊이 들어가게 손보는 중이에요.
          이번 업데이트에는 지도가 도감 탭으로 이사 갔어요.
        </Txt>
        <Pressable onPress={() => router.navigate("/(tabs)/dogam")} style={styles.cta} accessibilityRole="button">
          <Txt size={14} weight="extraBold" color={colors.white}>
            도감으로 가기 →
          </Txt>
        </Pressable>
        <Pressable onPress={() => router.navigate("/sea/tank/ocean")} accessibilityRole="button" style={styles.peek}>
          <Txt size={12} weight="bold" color={colors.ink2}>
            작업 중인 수조 몰래 보기
          </Txt>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.mist },
  wrap: { flex: 1, padding: 24, alignItems: "center", justifyContent: "center", gap: 10 },
  iconBg: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.sky,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  title: { textAlign: "center", marginTop: 6 },
  lead: { textAlign: "center", lineHeight: 22, maxWidth: 320, marginTop: 6, marginBottom: 20 },
  cta: {
    height: 52,
    paddingHorizontal: 28,
    borderRadius: 12,
    backgroundColor: colors.oceanBlue,
    alignItems: "center",
    justifyContent: "center",
  },
  peek: { padding: 10, marginTop: 8 },
});
