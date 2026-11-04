import { useEffect } from "react";
import { Pressable } from "react-native";
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { Critter } from "../../components/Critter";
import type { CritterKind } from "../../data/illustrations";

type Props = {
  kind: CritterKind;
  w: number;
  h: number;
  left: number;
  top: number;
  /** Horizontal travel in px (negative = starts heading left). 0 = hover in place. */
  dx: number;
  /** Seconds for one full lap. */
  duration: number;
  /** Seconds to offset the start so fish are out of phase. */
  phase?: number;
  far?: boolean;
  dim?: boolean;
  label: string;
  onPress?: () => void;
};

/*
 * A lap is an ellipse seen from the side: the outbound leg is the far side (smaller, higher, dimmer),
 * then the fish turns with a 3D rotateY (edge-on at 90°) and banks, and the return leg passes close
 * to the glass (bigger, lower, brighter). Mirrors the odCruise keyframes in the design canvas.
 */
const T = [0, 0.4, 0.46, 0.52, 0.89, 0.95, 1];
const X = [0, 0.94, 1.06, 1, 0.06, -0.06, 0];
const Y = [-6, -8, 0, 8, 8, 0, -6];
const S = [0.88, 0.88, 0.97, 1.06, 1.06, 0.97, 0.88];
const R = [180, 180, 90, 0, 0, -90, -180];
const BANK = [0, 0, -7, 0, 0, 7, 0];
const O = [0.82, 0.82, 0.7, 1, 1, 0.7, 0.82];

export function SwimmingFish({ kind, w, h, left, top, dx, duration, phase = 0, far, dim, label, onPress }: Props) {
  const reduced = useReducedMotion();
  const p = useSharedValue(0);
  const offset = (((phase % duration) + duration) % duration) / duration;
  const bob = useSharedValue(0);

  useEffect(() => {
    if (reduced) return;
    p.value = withRepeat(withTiming(1, { duration: duration * 1000, easing: Easing.linear }), -1, false);
    bob.value = withDelay((phase * 97) % 900, withRepeat(withTiming(1, { duration: 1600, easing: Easing.inOut(Easing.sin) }), -1, true));
  }, [reduced, p, bob, duration, phase]);

  const outer = useAnimatedStyle(() => {
    if (dx === 0) return { transform: [] };
    const v = (p.value + offset) % 1;
    return {
      opacity: interpolate(v, T, O) * (far ? 0.85 : 1) * (dim ? 0.75 : 1),
      transform: [
        { perspective: 800 },
        { translateX: interpolate(v, T, X) * dx },
        { translateY: interpolate(v, T, Y) },
        { rotateZ: `${interpolate(v, T, BANK)}deg` },
        { scale: interpolate(v, T, S) },
        { rotateY: `${interpolate(v, T, R)}deg` },
      ],
    };
  });

  // Body twist + tail beat while swimming.
  const inner = useAnimatedStyle(() => {
    const b = bob.value;
    return {
      transform: [
        { perspective: 500 },
        { translateY: -7 * b },
        { rotateZ: `${-1.5 + 3 * b}deg` },
        { rotateY: `${-14 + 28 * b}deg` },
        { skewY: `${-1.5 + 3 * b}deg` },
      ],
    };
  });

  return (
    <Animated.View style={[{ position: "absolute", left, top }, outer]} pointerEvents="box-none">
      <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} hitSlop={6}>
        <Animated.View style={inner}>
          <Critter kind={kind} width={w} height={h} style={far ? { opacity: 0.8 } : undefined} />
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}
