import { memo } from "react";
import Svg, { Defs, Ellipse, G, Path, RadialGradient, Stop } from "react-native-svg";

/** Foreground rocks and coral for the Malapascua tank (drawn above the moray burrow). */
function PlaceForegroundBase() {
  return (
    <Svg width="390" height="844" viewBox="0 0 390 844" style={{ position: "absolute", left: 0, top: 0 }} pointerEvents="none">
    <Defs><RadialGradient id="odStoneFg" cx=".35" cy=".25" r=".9"><Stop offset="0" stopColor="#3E6AA6"/><Stop offset="1" stopColor="#0D2350"/></RadialGradient></Defs>
    <Path d="M-10 720 Q10 600 70 590 Q120 580 140 640 Q150 690 130 724 Z" fill="url(#odStoneFg)"/>
    <Ellipse cx="96" cy="652" rx="20" ry="13" fill="#06173A"/>
    <G stroke="#F49AB8" strokeWidth="8" strokeLinecap="round" fill="none"><Path d="M60 596 L60 556 M60 574 L44 548 M60 566 L78 540"/></G>
    <Path d="M300 724 Q296 660 330 640 Q372 626 396 660 V724 Z" fill="url(#odStoneFg)"/>
    <Ellipse cx="338" cy="642" rx="40" ry="9" fill="#6FD6C6" opacity=".9"/>
    <G stroke="#FFC77D" strokeWidth="5" strokeLinecap="round" fill="none"><Path d="M200 716 L200 690 M200 700 L188 682 M200 696 L214 678"/></G>
    </Svg>
  );
}

export const PlaceForeground = memo(PlaceForegroundBase);
