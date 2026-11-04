import { memo } from "react";
import Svg, { Circle, Defs, Ellipse, G, LinearGradient, Path, RadialGradient, Rect, Stop } from "react-native-svg";

/** Static reef backdrop ported from the design canvas (산호초 수조). `rays` fades light shafts by time of day. */
function ReefSceneBase({ rays = 1 }: { rays?: number }) {
  return (
      <Svg width="100%" height="100%" viewBox="0 0 390 844" preserveAspectRatio="xMidYMid slice">
      <Defs>
      <LinearGradient id="odWater" x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor="#3B82D6"/><Stop offset=".38" stopColor="#1E59B0"/><Stop offset=".72" stopColor="#123F88"/><Stop offset="1" stopColor="#0A2A62"/></LinearGradient>
      <RadialGradient id="odGlow" cx=".5" cy="0" r=".75"><Stop offset="0" stopColor="#A9D2FF" stopOpacity=".5"/><Stop offset="1" stopColor="#A9D2FF" stopOpacity="0"/></RadialGradient>
      <LinearGradient id="odSand" x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor="#86B2BE"/><Stop offset="1" stopColor="#3F6E86"/></LinearGradient>
      <RadialGradient id="odRock" cx=".35" cy=".25" r=".9"><Stop offset="0" stopColor="#4672B0"/><Stop offset=".55" stopColor="#1D3F7B"/><Stop offset="1" stopColor="#0E2552"/></RadialGradient>
      <LinearGradient id="odPink" x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor="#FFB3C6"/><Stop offset="1" stopColor="#D45079"/></LinearGradient>
      <LinearGradient id="odOrange" x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor="#FFC77D"/><Stop offset="1" stopColor="#DA6A33"/></LinearGradient>
      <LinearGradient id="odPurple" x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor="#C7AEFF"/><Stop offset="1" stopColor="#6A47C0"/></LinearGradient>
      <LinearGradient id="odTeal" x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor="#8CF0DD"/><Stop offset="1" stopColor="#2A9998"/></LinearGradient>
      <LinearGradient id="odYellow" x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor="#FFE38A"/><Stop offset="1" stopColor="#C99A1E"/></LinearGradient>
      
      
      
      
      </Defs>
      <Rect width="390" height="844" fill="url(#odWater)"/>
      <Rect width="390" height="520" fill="url(#odGlow)"/>
      <G opacity={rays}>
      <Path d="M40 0 L110 0 L232 650 L150 650 Z" fill="#FFFFFF" opacity=".07"/>
      <Path d="M190 0 L236 0 L330 610 L272 610 Z" fill="#FFFFFF" opacity=".06"/>
      <Path d="M300 0 L330 0 L390 430 L360 430 Z" fill="#FFFFFF" opacity=".05"/>
      </G>
      <Path d="M0 560 Q40 470 92 500 Q132 432 182 480 Q232 452 262 498 Q320 440 390 488 V700 H0 Z" fill="#163F80" opacity=".85"/>
      <Path d="M0 640 Q80 615 160 632 Q250 650 320 628 Q360 618 390 624 V844 H0 Z" fill="url(#odSand)"/>
      
      <Path d="M20 700 Q60 690 100 700 M200 760 Q240 750 280 760 M290 704 Q320 698 350 704 M60 790 Q110 780 160 790" stroke="#A6C8D1" strokeWidth="2" fill="none" strokeLinecap="round" opacity=".45"/>
      
      <Path d="M-10 712 Q0 592 60 562 Q110 522 150 572 Q176 604 170 652 Q160 702 120 714 Z" fill="url(#odRock)"/>
      <Ellipse cx="118" cy="652" rx="22" ry="15" fill="#06173A"/>
      <Path d="M248 714 Q240 642 290 612 Q340 586 382 620 Q402 652 396 714 Z" fill="url(#odRock)"/>
      <Ellipse cx="320" cy="700" rx="70" ry="8" fill="#08214B" opacity=".5"/>
      
      <G stroke="url(#odPink)" strokeWidth="9" strokeLinecap="round" fill="none">
      <Path d="M72 568 L72 522 M72 544 L52 512 M72 534 L94 502 M52 512 L46 492 M94 502 L102 484 M72 522 L68 500"/>
      </G>
      <G stroke="url(#odOrange)" strokeWidth="6" strokeLinecap="round" fill="none">
      <Path d="M28 600 L28 572 M28 584 L16 566 M28 578 L40 560"/>
      </G>
      <Rect x="316" y="600" width="8" height="18" rx="3" fill="#2A8A8A"/>
      <Ellipse cx="320" cy="600" rx="50" ry="11" fill="url(#odTeal)"/>
      <Ellipse cx="320" cy="596" rx="44" ry="6" fill="#B4F7EA" opacity=".55"/>
      <G>
      <Path d="M352 616 Q328 548 360 500 Q398 546 372 616 Z" fill="url(#odPurple)" opacity=".92"/>
      <Path d="M362 612 L360 512 M362 590 L344 560 M362 580 L380 548 M362 556 L350 530 M362 548 L374 522" stroke="#E2D4FF" strokeWidth="1.2" fill="none" opacity=".7"/>
      </G>
      <Circle cx="212" cy="694" r="26" fill="url(#odOrange)"/>
      <Path d="M194 684 Q204 676 214 686 T232 690 M192 698 Q204 690 214 700 T234 702 M200 712 Q212 706 224 712" stroke="#9C4520" strokeWidth="2.2" fill="none" strokeLinecap="round" opacity=".7"/>
      <G fill="url(#odYellow)"><Circle cx="268" cy="716" r="9"/><Circle cx="280" cy="712" r="8"/><Circle cx="274" cy="702" r="8"/><Circle cx="286" cy="701" r="6"/></G>
      <G>
      <G stroke="#F7A9CE" strokeWidth="5" strokeLinecap="round" fill="none">
      <Path d="M150 716 Q142 690 132 680 M156 714 Q152 688 148 672 M162 714 Q166 688 170 674 M168 716 Q178 694 188 686 M146 718 Q132 706 122 702"/>
      </G>
      <Ellipse cx="158" cy="720" rx="26" ry="8" fill="#C9578C"/>
      </G>
      <G opacity=".9">
      <Path d="M8 844 Q0 780 14 720 Q22 690 12 660 M24 844 Q30 790 22 740 Q18 712 30 682 M40 844 Q44 800 36 770" stroke="#1E6E5A" strokeWidth="8" strokeLinecap="round" fill="none"/>
      </G>
      <G opacity=".9">
      <Path d="M372 844 Q380 790 366 744 Q358 716 370 690 M386 844 Q388 800 380 772" stroke="#1E6E5A" strokeWidth="8" strokeLinecap="round" fill="none"/>
      </G>
      </Svg>
  );
}

export const ReefScene = memo(ReefSceneBase);
