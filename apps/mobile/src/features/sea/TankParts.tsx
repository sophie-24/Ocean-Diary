import { useEffect } from "react";
import { Pressable, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withRepeat, withSequence, withTiming } from "react-native-reanimated";
import { Critter } from "../../components/Critter";

export function Particle({ x, y, size, dur, delay }: { x: number; y: number; size: number; dur: number; delay: number }) {
  const t = useSharedValue(0);
  const reduced = useReducedMotion();
  useEffect(() => {
    if (reduced) return;
    t.value = withRepeat(withSequence(withTiming(0, { duration: delay }), withTiming(1, { duration: dur, easing: Easing.linear })), -1);
  }, [t, dur, delay, reduced]);
  const st = useAnimatedStyle(() => ({ opacity: t.value < 0.1 ? t.value * 8 : 0.8 * (1 - t.value), transform: [{ translateX: -30 * t.value }, { translateY: 260 * t.value }] }));
  return <Animated.View pointerEvents="none" style={[{ position: "absolute", left: x, top: y, width: size, height: size, borderRadius: size, backgroundColor: "rgba(255,255,255,0.75)" }, st]} />;
}

export function Peek({ onPress, left = 96, top = 636 }: { onPress: () => void; left?: number; top?: number }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withRepeat(withSequence(withTiming(0, { duration: 2100 }), withTiming(1, { duration: 1000 }), withTiming(1, { duration: 2800 }), withTiming(0, { duration: 1100 })), -1);
  }, [t]);
  const st = useAnimatedStyle(() => ({ transform: [{ translateX: 26 * (1 - t.value) }] }));
  return (
    <View style={{ position: "absolute", left, top, width: 52, height: 30, overflow: "hidden", borderBottomLeftRadius: 12, borderBottomRightRadius: 12 }}>
      <Animated.View style={st}>
        <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel="곰치 · 눌러서 명판 보기">
          <Critter kind="moray" width={120} height={52} />
        </Pressable>
      </Animated.View>
    </View>
  );
}

export function Dance({ onPress, left = 176, top = 636 }: { onPress: () => void; left?: number; top?: number }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withRepeat(withTiming(1, { duration: 2100, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, [t]);
  const st = useAnimatedStyle(() => ({ transform: [{ perspective: 500 }, { translateY: -34 * t.value }, { rotateZ: `${-6 + 10 * t.value}deg` }, { rotateY: `${-20 + 40 * t.value}deg` }] }));
  return (
    <Animated.View style={[{ position: "absolute", left, top }, st]}>
      <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel="만다린피쉬 한 쌍 · 짝짓기 춤 추는 중" style={{ flexDirection: "row", alignItems: "flex-end", gap: 2 }}>
        <Critter kind="mandarin" width={46} height={29} />
        <View style={{ transform: [{ scaleX: -1 }] }}>
          <Critter kind="mandarin" width={40} height={25} />
        </View>
      </Pressable>
    </Animated.View>
  );
}

