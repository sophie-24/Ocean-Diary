import { memo } from "react";
import Svg, { Defs, Ellipse, G, LinearGradient, Path, RadialGradient, Rect, Stop } from "react-native-svg";

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
      <G opacity={rays}>
      <Path d="M70 0 L130 0 L260 700 L180 700 Z" fill="#FFFFFF" opacity=".06"/>
      <Path d="M230 0 L262 0 L360 640 L310 640 Z" fill="#FFFFFF" opacity=".05"/>
      <Path d="M0 0 L26 0 L80 520 L40 520 Z" fill="#FFFFFF" opacity=".04"/>
      </G>
      <Ellipse cx="80" cy="620" rx="140" ry="50" fill="#0F347A" opacity=".7"/>
      <Ellipse cx="320" cy="640" rx="120" ry="40" fill="#0F347A" opacity=".7"/>
      <Path d="M0 700 Q90 680 190 694 Q300 708 390 688 V844 H0 Z" fill="url(#oceanFloor)"/>
      <Rect x="0" y="660" width="390" height="184" opacity=".18"/>
      <Path d="M-10 720 Q20 668 70 676 Q110 690 104 726 Z" fill="url(#oceanStone)"/>
      <Path d="M300 716 Q320 672 362 676 Q396 686 398 724 Z" fill="url(#oceanStone)"/>
      </Svg>
  );
}

export const OceanScene = memo(OceanSceneBase);
