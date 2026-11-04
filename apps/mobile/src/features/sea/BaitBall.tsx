import { useEffect } from "react";
import { Pressable } from "react-native";
import Animated, { Easing, Extrapolation, interpolate, useAnimatedStyle, useReducedMotion, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";
import { Critter } from "../../components/Critter";

type Ring = { n: number; rx: number; ry: number; cy: number; w: number; dur: number };

const RINGS: Ring[] = [
  { n: 11, rx: 100, ry: 30, cy: 40, w: 42, dur: 14 },
  { n: 10, rx: 82, ry: 24, cy: 20, w: 36, dur: 12 },
  { n: 9, rx: 70, ry: 20, cy: 62, w: 34, dur: 11 },
];

/**
 * A fish on an elliptical orbit seen from the side. Back half: smaller and darker (behind);
 * front half: larger and brighter; it turns (rotateY) at the two ends of the ellipse.
 */
function OrbitFish({ ring, index, onPress }: { ring: Ring; index: number; onPress: () => void }) {
  const t = useSharedValue(0);
  const reduced = useReducedMotion();
  const offset = index / ring.n;
  useEffect(() => {
    if (!reduced) t.value = withRepeat(withTiming(1, { duration: ring.dur * 1000, easing: Easing.linear }), -1, false);
  }, [t, ring.dur, reduced]);

  const style = useAnimatedStyle(() => {
    const v = (t.value + offset) % 1;
    const a = v * Math.PI * 2;
    const x = 100 + ring.rx * Math.cos(a) - ring.w / 2;
    const y = ring.cy - ring.ry * Math.sin(a) - ring.w / 4;
    // sin(a) > 0 → top half of the ellipse = farther away.
    const depth = Math.sin(a);
    const scale = interpolate(depth, [-1, 1], [1.12, 0.6]);
    // Art faces left: far side swims left (0°), near side swims right (180°); the turn happens at the ends.
    const rotY = interpolate(depth, [-0.3, 0.3], [180, 0], Extrapolation.CLAMP);
    return {
      position: "absolute",
      left: x,
      top: y,
      zIndex: depth > 0 ? 1 : 3,
      opacity: interpolate(depth, [-1, 1], [1, 0.62]),
      transform: [{ perspective: 600 }, { scale }, { rotateY: `${rotY}deg` }],
    };
  });

  return (
    <Animated.View style={style}>
      <Pressable onPress={onPress} accessible={false}>
        <Critter kind="trevally" width={ring.w} height={ring.w / 2} />
      </Pressable>
    </Animated.View>
  );
}

export function BaitBall({ left, top, onPress }: { left: number; top: number; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="트레발리 무리가 소용돌이치며 헤엄치는 중 · 눌러서 명판 보기"
      style={{ position: "absolute", left, top, width: 200, height: 90 }}
    >
      {RINGS.flatMap((ring, ri) => Array.from({ length: ring.n }, (_, i) => <OrbitFish key={`${ri}-${i}`} ring={ring} index={i} onPress={onPress} />))}
    </Pressable>
  );
}
