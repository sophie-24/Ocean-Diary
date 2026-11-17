import { memo } from "react";
import Svg, { Defs, Ellipse, G, LinearGradient, Path, RadialGradient, Rect, Stop } from "react-native-svg";
import { AmbientBubbles, CausticG, DustMote, type BubbleSpec } from "./ambient";

// Fewer, bigger bubbles for an open-water feel.
const OCEAN_BUBBLES: BubbleSpec[] = [
  { x: 80, size: 2.8, duration: 14000, delay: 0, peakOpacity: 0.45, startY: 700, travel: 720 },
  { x: 260, size: 3.4, duration: 16000, delay: 4500, peakOpacity: 0.5, startY: 695, travel: 720 },
  { x: 348, size: 2.2, duration: 12800, delay: 2200, peakOpacity: 0.4, startY: 710, travel: 720 },
];

// Drifting plankton flecks suspended in the water column.
const OCEAN_MOTES: Array<{ x: number; y: number; r: number; delay: number; amp: number }> = [
  { x: 100, y: 240, r: 1.2, delay: 0, amp: 10 },
  { x: 220, y: 180, r: 0.9, delay: 1500, amp: 8 },
  { x: 290, y: 310, r: 1.0, delay: 800, amp: 12 },
  { x: 160, y: 370, r: 0.8, delay: 3200, amp: 9 },
  { x: 60, y: 420, r: 1.1, delay: 2100, amp: 11 },
  { x: 340, y: 450, r: 0.9, delay: 4500, amp: 7 },
];

/** Open-water backdrop (대양 수조). Ported from the design canvas; `rays` fades light shafts by time of day. */
function OceanSceneBase({ rays = 1 }: { rays?: number }) {
  return (
      <Svg width={390} height={844} viewBox="0 0 390 844">
      <Defs>
      <LinearGradient id="oceanDeep" x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor="#2E6FC8"/><Stop offset=".4" stopColor="#174A9E"/><Stop offset=".78" stopColor="#0C2E70"/><Stop offset="1" stopColor="#061A45"/></LinearGradient>
      <RadialGradient id="oceanTop" cx=".55" cy="0" r=".7"><Stop offset="0" stopColor="#B9DCFF" stopOpacity=".45"/><Stop offset="1" stopColor="#B9DCFF" stopOpacity="0"/></RadialGradient>
      <LinearGradient id="oceanFloor" x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor="#5C8CA8"/><Stop offset="1" stopColor="#2A5470"/></LinearGradient>
      <RadialGradient id="oceanStone" cx=".35" cy=".25" r=".9"><Stop offset="0" stopColor="#3E6AA6"/><Stop offset="1" stopColor="#0D2350"/></RadialGradient>
      
      
      
      </Defs>
      <Rect width="390" height="844" fill="url(#oceanDeep)"/>
      <Rect width="390" height="460" fill="url(#oceanTop)"/>
      <Rect x="0" y="0" width="390" height="300" opacity=".08"/>
      <CausticG base={rays} period={5200}>
      <Path d="M70 0 L130 0 L260 700 L180 700 Z" fill="#FFFFFF" opacity={0.06}/>
      <Path d="M230 0 L262 0 L360 640 L310 640 Z" fill="#FFFFFF" opacity={0.05}/>
      <Path d="M0 0 L26 0 L80 520 L40 520 Z" fill="#FFFFFF" opacity={0.04}/>
      </CausticG>
      <Ellipse cx="80" cy="620" rx="140" ry="50" fill="#0F347A" opacity=".7"/>
      <Ellipse cx="320" cy="640" rx="120" ry="40" fill="#0F347A" opacity=".7"/>
      <Path d="M0 700 Q90 680 190 694 Q300 708 390 688 V844 H0 Z" fill="url(#oceanFloor)"/>
      <Rect x="0" y="660" width="390" height="184" opacity=".18"/>
      <Path d="M-10 720 Q20 668 70 676 Q110 690 104 726 Z" fill="url(#oceanStone)"/>
      <Path d="M300 716 Q320 672 362 676 Q396 686 398 724 Z" fill="url(#oceanStone)"/>
      {OCEAN_MOTES.map((m, i) => (
        <DustMote key={i} x={m.x} y={m.y} r={m.r} amplitude={m.amp} duration={7200 + i * 400} delay={m.delay} opacity={0.35} />
      ))}
      <AmbientBubbles bubbles={OCEAN_BUBBLES}/>
      </Svg>
  );
}

export const OceanScene = memo(OceanSceneBase);
