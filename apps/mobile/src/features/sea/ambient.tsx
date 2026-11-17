/**
 * Subtle motion for the tank SVGs: slow-rising bubbles and shimmering light shafts.
 * Each piece is a drop-in replacement for an SVG child, so a Scene keeps its own art
 * and just adds `<AmbientBubbles …/>` and wraps its light rays in `<CausticG …>`.
 *
 * Reanimated drives the shared values on the UI thread, so React never re-renders.
 */
import { memo, useEffect, type ReactNode } from "react";
import { Platform } from "react-native";
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { Circle, G } from "react-native-svg";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedG = Animated.createAnimatedComponent(G);

const STAGE_HEIGHT = 844;

/** A single bubble climbing from the sand to the surface on a loop. */
function BubbleBase({
  x,
  size,
  duration,
  delay,
  color = "#D6ECFF",
  peakOpacity = 0.6,
  travel = STAGE_HEIGHT - 40,
  startY = STAGE_HEIGHT - 20,
}: {
  x: number;
  size: number;
  duration: number;
  delay: number;
  color?: string;
  peakOpacity?: number;
  /** How far the bubble climbs before it resets. */
  travel?: number;
  /** Start y of the loop; usually just above the sand. */
  startY?: number;
}) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      delay,
      withRepeat(withTiming(1, { duration, easing: Easing.linear }), -1, false),
    );
  }, [delay, duration, progress]);

  const animatedProps = useAnimatedProps(() => {
    const p = progress.value;
    const cy = startY - p * travel;
    const fadeIn = Math.min(1, p / 0.1);
    const fadeOut = p > 0.88 ? Math.max(0, (1 - p) / 0.12) : 1;
    return { cy, opacity: Math.min(fadeIn, fadeOut) * peakOpacity };
  });

  // Starts just below the top edge so it fades out cleanly on the first loop.
  return <AnimatedCircle cx={x} r={size} fill={color} animatedProps={animatedProps} />;
}
export const Bubble = memo(BubbleBase);

export type BubbleSpec = {
  x: number;
  size: number;
  duration: number;
  delay: number;
  color?: string;
  peakOpacity?: number;
  travel?: number;
  startY?: number;
};

/** Convenience wrapper for a fixed set of bubbles. */
function AmbientBubblesBase({ bubbles }: { bubbles: BubbleSpec[] }) {
  // Web: react-native-svg's web build does not re-paint animated cy values reliably in
  // every browser, so drop the motion there and keep the static scene underneath.
  if (Platform.OS === "web") return null;
  return (
    <>
      {bubbles.map((b, i) => (
        <Bubble key={i} {...b} />
      ))}
    </>
  );
}
export const AmbientBubbles = memo(AmbientBubblesBase);

/**
 * Wraps light shafts so their group opacity breathes between ~0.78 × base and base.
 * On web the shafts hold their static opacity (no animation).
 */
function CausticGBase({
  base = 1,
  period = 4200,
  children,
}: {
  base?: number;
  period?: number;
  children: ReactNode;
}) {
  const t = useSharedValue(0);

  useEffect(() => {
    if (Platform.OS === "web") return;
    t.value = withRepeat(
      withTiming(1, { duration: period, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, [period, t]);

  const animatedProps = useAnimatedProps(() => {
    const flicker = Platform.OS === "web" ? 1 : 0.78 + 0.22 * t.value;
    return { opacity: base * flicker };
  });

  return <AnimatedG animatedProps={animatedProps}>{children}</AnimatedG>;
}
export const CausticG = memo(CausticGBase);

/**
 * Small drifting dust/plankton particles for macro and deep-water scenes.
 * Each mote jitters within a small radius around (x, y) on a long loop.
 */
function DustMoteBase({
  x,
  y,
  r = 1,
  amplitude = 6,
  duration = 6000,
  delay = 0,
  color = "#CFE0F5",
  opacity = 0.4,
}: {
  x: number;
  y: number;
  r?: number;
  amplitude?: number;
  duration?: number;
  delay?: number;
  color?: string;
  opacity?: number;
}) {
  const phase = useSharedValue(0);

  useEffect(() => {
    if (Platform.OS === "web") return;
    phase.value = withDelay(
      delay,
      withRepeat(withTiming(1, { duration, easing: Easing.inOut(Easing.sin) }), -1, true),
    );
  }, [delay, duration, phase]);

  const animatedProps = useAnimatedProps(() => {
    const p = phase.value;
    return {
      cx: x + Math.sin(p * Math.PI * 2) * amplitude,
      cy: y + Math.cos(p * Math.PI * 2) * amplitude * 0.5,
      opacity,
    };
  });

  return <AnimatedCircle r={r} fill={color} animatedProps={animatedProps} />;
}
export const DustMote = memo(DustMoteBase);
