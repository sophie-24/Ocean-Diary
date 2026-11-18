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

/* ────────────────────────────────────────────────────────────
 * Generic silhouettes — "something's always happening in the tank".
 * These are painterly, no-brand shapes (fish, turtle) made from basic
 * SVG primitives. Never a Critter — Critter is reserved for the diver's
 * own collected species. Keep opacity low so they feel like distant,
 * out-of-focus life, not the main attraction.
 * ──────────────────────────────────────────────────────────── */

import { Path } from "react-native-svg";
const AnimatedPath = Animated.createAnimatedComponent(Path);

type DriftProps = {
  /** Y position on the 844-tall stage. */
  y: number;
  /** Seconds for one left-to-right (or right-to-left) sweep. */
  duration: number;
  /** Seconds to offset start so multiple silhouettes don't stack. */
  delay?: number;
  /** Negative = drift right-to-left. */
  dx?: number;
  /** Starting x; default is just off-screen on the leading side. */
  startX?: number;
  /** Silhouette tone. Default suits blue reef/ocean water. */
  color?: string;
  opacity?: number;
  /** Rendered width in px (height follows the shape's aspect ratio). */
  size?: number;
};

function useDriftTransform({
  duration,
  delay = 0,
  dx = 430,
  startX,
  y,
}: Required<Pick<DriftProps, "duration" | "y">> & Pick<DriftProps, "delay" | "dx" | "startX">) {
  const progress = useSharedValue(0);
  useEffect(() => {
    if (Platform.OS === "web") return;
    progress.value = withDelay(
      delay ?? 0,
      withRepeat(withTiming(1, { duration, easing: Easing.inOut(Easing.sin) }), -1, false),
    );
  }, [duration, delay, progress]);

  return useAnimatedProps(() => {
    const p = progress.value;
    const span = dx ?? 430;
    const from = startX ?? (span > 0 ? -60 : 450);
    const x = from + p * span;
    // Soft bob so it reads as swimming, not sliding.
    const bob = Math.sin(p * Math.PI * 4) * 6;
    // Fade in/out at the edges so the silhouette doesn't pop.
    const edge = Math.min(p, 1 - p);
    const fade = edge < 0.08 ? edge / 0.08 : 1;
    return {
      transform: [{ translateX: x }, { translateY: y + bob }, { scaleX: span < 0 ? -1 : 1 }],
      opacity: fade,
    };
  });
}

/** Small side-on fish silhouette: elongated body + triangular tail. */
function FishSilhouetteBase({
  y,
  duration,
  delay,
  dx,
  startX,
  color = "#A8C8EA",
  opacity = 0.35,
  size = 28,
}: DriftProps) {
  const style = useDriftTransform({ y, duration, delay, dx, startX });
  const half = size / 2;
  // Body ~ellipse size × size/3; tail hooks off the trailing edge.
  const body = `M ${-half} 0 Q ${-half} ${-size / 3} 0 ${-size / 3} Q ${half} ${-size / 3} ${half} 0 Q ${half} ${size / 3} 0 ${size / 3} Q ${-half} ${size / 3} ${-half} 0 Z`;
  const tail = `M ${half - 2} 0 L ${half + size / 2} ${-size / 2.4} L ${half + size / 2} ${size / 2.4} Z`;
  return (
    <AnimatedPath
      // One combined path, drawn in a group so translate/scale applies evenly.
      d={`${body} ${tail}`}
      fill={color}
      fillOpacity={opacity}
      animatedProps={style}
    />
  );
}
export const FishSilhouette = memo(FishSilhouetteBase);

/** Chubby turtle silhouette — oval shell + four stubby flipper lumps + tiny head. */
function TurtleSilhouetteBase({
  y,
  duration,
  delay,
  dx,
  startX,
  color = "#7FB5A8",
  opacity = 0.4,
  size = 42,
}: DriftProps) {
  const style = useDriftTransform({ y, duration, delay, dx, startX });
  const rx = size / 2;
  const ry = size / 3;
  // Shell + four flipper bumps + small head sticking out the front.
  const d = [
    `M 0 0`,
    `m ${-rx} 0`,
    `a ${rx} ${ry} 0 1 0 ${rx * 2} 0`,
    `a ${rx} ${ry} 0 1 0 ${-rx * 2} 0 Z`,
    // Flippers (top-front, top-back, bottom-front, bottom-back)
    `M ${rx * 0.7} ${-ry * 0.7} q 6 -4 10 0 q -6 3 -10 3 Z`,
    `M ${-rx * 0.7} ${-ry * 0.7} q -6 -4 -10 0 q 6 3 10 3 Z`,
    `M ${rx * 0.7} ${ry * 0.7} q 6 4 10 0 q -6 -3 -10 -3 Z`,
    `M ${-rx * 0.7} ${ry * 0.7} q -6 4 -10 0 q 6 -3 10 -3 Z`,
    // Head
    `M ${rx} 0 q 6 -3 10 -0.5 q -4 1 -4 3 q 4 2 0 2 q -4 0 -6 -2 Z`,
  ].join(" ");
  return (
    <AnimatedPath d={d} fill={color} fillOpacity={opacity} animatedProps={style} />
  );
}
export const TurtleSilhouette = memo(TurtleSilhouetteBase);

/** A sensible default swarm for any tank — call inside the <Svg> stage. */
export function AmbientSilhouettes({
  scheme = "reef",
}: {
  /** reef = bright teal/aqua, ocean = deep blue, macro = tiny close-up swarm. */
  scheme?: "reef" | "ocean" | "macro";
}) {
  if (Platform.OS === "web") return null;
  if (scheme === "ocean") {
    return (
      <>
        <FishSilhouette y={240} duration={38000} delay={0} size={22} color="#A9C7E8" opacity={0.3} />
        <FishSilhouette y={290} duration={46000} delay={6000} size={18} color="#A9C7E8" opacity={0.25} />
        <FishSilhouette y={460} duration={52000} delay={3500} size={30} color="#9CBBDC" opacity={0.3} dx={-430} startX={430} />
        <TurtleSilhouette y={390} duration={60000} delay={12000} size={44} color="#7FA69A" opacity={0.35} />
      </>
    );
  }
  if (scheme === "macro") {
    return (
      <>
        <FishSilhouette y={180} duration={20000} delay={0} size={14} color="#B9D2EA" opacity={0.3} />
        <FishSilhouette y={240} duration={24000} delay={1500} size={12} color="#B9D2EA" opacity={0.3} />
        <FishSilhouette y={310} duration={28000} delay={5000} size={16} color="#A6C4E0" opacity={0.3} dx={-430} startX={430} />
      </>
    );
  }
  // reef default
  return (
    <>
      <FishSilhouette y={210} duration={28000} delay={0} size={22} color="#A8D5E8" opacity={0.35} />
      <FishSilhouette y={260} duration={34000} delay={4000} size={18} color="#A8D5E8" opacity={0.3} />
      <FishSilhouette y={420} duration={40000} delay={2000} size={26} color="#9ECCDE" opacity={0.3} dx={-430} startX={430} />
      <TurtleSilhouette y={340} duration={55000} delay={10000} size={40} color="#80B7A6" opacity={0.4} />
    </>
  );
}
