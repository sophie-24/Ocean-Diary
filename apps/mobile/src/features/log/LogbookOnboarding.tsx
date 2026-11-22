import { useRef, useState } from "react";
import { Dimensions, FlatList, Pressable, StyleSheet, View, type ViewToken } from "react-native";
import Svg, { Circle, Ellipse, Path, Rect } from "react-native-svg";
import { Txt } from "../../components/ui/Txt";
import { colors } from "../../theme/tokens";

const { width: SCREEN_W } = Dimensions.get("window");
const CARD_W = SCREEN_W - 64;

type Step = { title: string; desc: string; icon: React.ReactNode };

const STEPS: Step[] = [
  {
    title: "다이빙 정보를 입력하면",
    desc: "날짜, 장소, 수심만 넣으면\n기본 로그가 완성돼요.",
    icon: (
      <Svg width={120} height={100} viewBox="0 0 120 100">
        {/* clipboard */}
        <Rect x={30} y={10} width={60} height={80} rx={8} fill={colors.sky} stroke={colors.oceanBlue} strokeWidth={2} />
        <Rect x={45} y={4} width={30} height={12} rx={4} fill={colors.white} stroke={colors.oceanBlue} strokeWidth={1.5} />
        {/* lines */}
        <Rect x={40} y={30} width={40} height={4} rx={2} fill={colors.oceanBlue} opacity={0.5} />
        <Rect x={40} y={42} width={30} height={4} rx={2} fill={colors.oceanBlue} opacity={0.3} />
        <Rect x={40} y={54} width={35} height={4} rx={2} fill={colors.oceanBlue} opacity={0.3} />
        {/* check */}
        <Circle cx={85} cy={75} r={10} fill={colors.oceanBlue} />
        <Path d="M80 75 L83 78 L90 71" stroke={colors.white} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </Svg>
    ),
  },
  {
    title: "그림일기가 완성돼요",
    desc: "바다 배경 위에 스티커와\n기록이 예쁘게 담겨요.",
    icon: (
      <Svg width={120} height={100} viewBox="0 0 120 100">
        {/* diary page */}
        <Rect x={20} y={8} width={80} height={84} rx={8} fill="#E0F0FF" stroke={colors.oceanBlue} strokeWidth={1.5} />
        {/* waves at bottom */}
        <Path d="M20 72 Q40 64 60 72 Q80 80 100 72 L100 84 Q100 92 92 92 L28 92 Q20 92 20 84 Z" fill={colors.oceanBlue} opacity={0.2} />
        {/* fish */}
        <Ellipse cx={55} cy={50} rx={12} ry={8} fill="#FF9F43" />
        <Path d="M67 50 L75 42 L75 58 Z" fill="#FF9F43" />
        <Circle cx={48} cy={48} r={2} fill={colors.navy} />
        {/* bubbles */}
        <Circle cx={42} cy={38} r={3} fill={colors.oceanBlue} opacity={0.3} />
        <Circle cx={38} cy={30} r={2} fill={colors.oceanBlue} opacity={0.2} />
      </Svg>
    ),
  },
  {
    title: "스티커로 꾸미면",
    desc: "만났던 바다 생물 스티커를\n일기장에 자유롭게 붙여요.",
    icon: (
      <Svg width={120} height={100} viewBox="0 0 120 100">
        {/* page bg */}
        <Rect x={20} y={8} width={80} height={84} rx={8} fill={colors.sky} />
        {/* sticker 1 - turtle */}
        <Ellipse cx={50} cy={45} rx={14} ry={10} fill="#66BB6A" />
        <Circle cx={40} cy={42} r={4} fill="#66BB6A" />
        <Circle cx={38} cy={41} r={1.5} fill={colors.navy} />
        {/* sticker 2 - starfish */}
        <Path d="M80 60 L83 52 L86 60 L78 55 L88 55 Z" fill="#FF7043" />
        {/* sticker 3 - shell */}
        <Ellipse cx={45} cy={70} rx={8} ry={6} fill="#FFD54F" />
        {/* sparkles */}
        <Path d="M75 30 L77 26 L79 30 L83 28 L79 32 L77 36 L75 32 L71 28 Z" fill="#FFD54F" />
        <Path d="M35 22 L36 19 L37 22 L40 21 L37 24 L36 27 L35 24 L32 21 Z" fill="#FFD54F" opacity={0.6} />
      </Svg>
    ),
  },
  {
    title: "나만의 바다 일기 완성!",
    desc: "다이빙마다 쌓이는\n세상에 하나뿐인 기록이에요.",
    icon: (
      <Svg width={120} height={100} viewBox="0 0 120 100">
        {/* book */}
        <Path d="M20 20 Q60 12 60 50 Q60 88 20 80 Z" fill={colors.sky} stroke={colors.oceanBlue} strokeWidth={1.5} />
        <Path d="M100 20 Q60 12 60 50 Q60 88 100 80 Z" fill="#E8F4FD" stroke={colors.oceanBlue} strokeWidth={1.5} />
        {/* spine */}
        <Path d="M60 12 L60 88" stroke={colors.oceanBlue} strokeWidth={1.5} />
        {/* heart */}
        <Path d="M52 42 C52 38 47 36 47 40 C47 44 52 48 52 48 C52 48 57 44 57 40 C57 36 52 38 52 42 Z" fill="#FF6B6B" />
        {/* stars */}
        <Circle cx={75} cy={40} r={2} fill="#FFD54F" />
        <Circle cx={82} cy={50} r={1.5} fill="#FFD54F" />
        <Circle cx={70} cy={55} r={1.5} fill="#FFD54F" />
      </Svg>
    ),
  },
];

type Props = { onStart: () => void; onSkip: () => void };

export function LogbookOnboarding({ onStart, onSkip }: Props) {
  const [page, setPage] = useState(0);
  const listRef = useRef<FlatList>(null);
  const isLast = page === STEPS.length - 1;

  const onViewableChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0 && viewableItems[0].index != null) setPage(viewableItems[0].index);
  }).current;

  return (
    <View style={styles.root}>
      <FlatList
        ref={listRef}
        data={STEPS}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, i) => String(i)}
        snapToInterval={SCREEN_W}
        decelerationRate="fast"
        onViewableItemsChanged={onViewableChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 60 }}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width: SCREEN_W }]}>
            <View style={styles.iconWrap}>{item.icon}</View>
            <Txt size={20} weight="bold" color={colors.navy} align="center" style={{ lineHeight: 26 }}>
              {item.title}
            </Txt>
            <Txt size={14} color={colors.ink2} align="center" style={{ lineHeight: 20, marginTop: 8 }}>
              {item.desc}
            </Txt>
          </View>
        )}
      />

      {/* dots */}
      <View style={styles.dots}>
        {STEPS.map((_, i) => (
          <View key={i} style={[styles.dot, i === page && styles.dotActive]} />
        ))}
      </View>

      {/* CTA */}
      {isLast ? (
        <Pressable accessibilityRole="button" onPress={onStart} style={styles.cta}>
          <Txt size={16} weight="bold" color={colors.white}>
            첫 기록 쓰기
          </Txt>
        </Pressable>
      ) : (
        <View style={{ height: 48 }} />
      )}

      {/* skip */}
      <Pressable accessibilityRole="button" onPress={onSkip} style={styles.skip} hitSlop={8}>
        <Txt size={13} color={colors.ink3}>
          건너뛰기
        </Txt>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { alignItems: "center", paddingTop: 32, paddingBottom: 16 },
  slide: { alignItems: "center", justifyContent: "center", paddingHorizontal: 32 },
  iconWrap: {
    width: CARD_W,
    height: 160,
    borderRadius: 16,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  dots: { flexDirection: "row", gap: 8, marginTop: 20 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.line },
  dotActive: { backgroundColor: colors.oceanBlue, width: 20 },
  cta: {
    height: 48,
    paddingHorizontal: 32,
    borderRadius: 12,
    backgroundColor: colors.oceanBlue,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  skip: { marginTop: 12 },
});
