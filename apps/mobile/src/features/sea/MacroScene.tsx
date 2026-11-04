import { memo } from "react";
import Svg, { Circle, Defs, Ellipse, G, LinearGradient, Path, RadialGradient, Rect, Stop } from "react-native-svg";

/** Macro tank backdrop (sea fan, crinoid, sponge, rubble) on a 390×844 stage. `p` keeps gradient ids unique per copy. */
function MacroSceneBase({ p = "mc" }: { p?: string }) {
  return (
    <Svg width={390} height={844} viewBox="0 0 390 844">
    <Defs>
    <LinearGradient id={`${p}Water`} x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor="#174A72"/><Stop offset=".55" stopColor="#0E3256"/><Stop offset="1" stopColor="#071A33"/></LinearGradient>
    <RadialGradient id={`${p}Torch`} cx=".5" cy=".55" r=".55"><Stop offset="0" stopColor="#FFF1CF" stopOpacity=".22"/><Stop offset="1" stopColor="#FFF1CF" stopOpacity="0"/></RadialGradient>
    <LinearGradient id={`${p}Sand`} x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor="#9DAE9B"/><Stop offset="1" stopColor="#4E6B6E"/></LinearGradient>
    <RadialGradient id={`${p}Rock`} cx=".35" cy=".25" r=".9"><Stop offset="0" stopColor="#6E7F86"/><Stop offset=".6" stopColor="#3D4E5C"/><Stop offset="1" stopColor="#1F2C3D"/></RadialGradient>
    <LinearGradient id={`${p}Sponge`} x1="0" y1="0" x2="1" y2="0"><Stop offset="0" stopColor="#C9922A"/><Stop offset=".5" stopColor="#F2C557"/><Stop offset="1" stopColor="#B57E20"/></LinearGradient>
    </Defs>
    <Rect width="390" height="844" fill={`url(#${p}Water)`}/>
    <Rect width="390" height="844" fill={`url(#${p}Torch)`}/>
    <Path d="M0 575 Q90 560 190 572 Q290 584 390 566 V844 H0 Z" fill={`url(#${p}Sand)`}/>
    <Circle cx="126.3" cy="589.6" r="1.3" fill="#C9D7C6" opacity="0.28"/>
    <Circle cx="209.0" cy="617.5" r="0.7" fill="#C9D7C6" opacity="0.43"/>
    <Circle cx="14.6" cy="626.4" r="0.7" fill="#C9D7C6" opacity="0.28"/>
    <Circle cx="165.6" cy="677.5" r="0.7" fill="#C9D7C6" opacity="0.33"/>
    <Circle cx="244.7" cy="693.2" r="1.2" fill="#C9D7C6" opacity="0.39"/>
    <Circle cx="380.7" cy="576.1" r="1.5" fill="#C9D7C6" opacity="0.35"/>
    <Circle cx="56.3" cy="585.3" r="0.9" fill="#C9D7C6" opacity="0.54"/>
    <Circle cx="70.5" cy="645.6" r="1.2" fill="#C9D7C6" opacity="0.38"/>
    <Circle cx="213.6" cy="578.2" r="0.7" fill="#C9D7C6" opacity="0.32"/>
    <Circle cx="265.4" cy="625.6" r="0.9" fill="#C9D7C6" opacity="0.45"/>
    <Circle cx="176.7" cy="609.0" r="1.4" fill="#C9D7C6" opacity="0.49"/>
    <Circle cx="95.2" cy="644.7" r="1.1" fill="#C9D7C6" opacity="0.56"/>
    <Circle cx="284.5" cy="607.4" r="1.6" fill="#C9D7C6" opacity="0.29"/>
    <Circle cx="163.1" cy="668.4" r="0.8" fill="#C9D7C6" opacity="0.42"/>
    <Circle cx="15.3" cy="656.9" r="1.4" fill="#C9D7C6" opacity="0.45"/>
    <Circle cx="341.4" cy="610.8" r="1.3" fill="#C9D7C6" opacity="0.46"/>
    <Circle cx="226.2" cy="629.3" r="1.4" fill="#C9D7C6" opacity="0.58"/>
    <Circle cx="184.9" cy="656.3" r="0.7" fill="#C9D7C6" opacity="0.50"/>
    <Circle cx="252.4" cy="699.1" r="1.4" fill="#C9D7C6" opacity="0.35"/>
    <Circle cx="150.5" cy="656.9" r="0.6" fill="#C9D7C6" opacity="0.41"/>
    <Circle cx="65.5" cy="585.2" r="0.7" fill="#C9D7C6" opacity="0.52"/>
    <Circle cx="50.4" cy="602.2" r="1.0" fill="#C9D7C6" opacity="0.55"/>
    <Circle cx="31.4" cy="628.4" r="1.1" fill="#C9D7C6" opacity="0.56"/>
    <Circle cx="319.5" cy="682.3" r="0.9" fill="#C9D7C6" opacity="0.40"/>
    <Circle cx="139.9" cy="684.9" r="1.6" fill="#C9D7C6" opacity="0.30"/>
    <Circle cx="68.7" cy="600.2" r="0.8" fill="#C9D7C6" opacity="0.42"/>
    <Circle cx="229.8" cy="604.2" r="0.6" fill="#C9D7C6" opacity="0.40"/>
    <Circle cx="144.0" cy="643.6" r="1.6" fill="#C9D7C6" opacity="0.49"/>
    <Circle cx="201.0" cy="650.3" r="1.3" fill="#C9D7C6" opacity="0.27"/>
    <Circle cx="350.8" cy="671.4" r="1.5" fill="#C9D7C6" opacity="0.53"/>
    <Circle cx="153.0" cy="621.9" r="0.7" fill="#C9D7C6" opacity="0.47"/>
    <Circle cx="24.3" cy="578.8" r="0.8" fill="#C9D7C6" opacity="0.31"/>
    <Circle cx="132.6" cy="576.8" r="0.6" fill="#C9D7C6" opacity="0.30"/>
    <Circle cx="39.6" cy="617.3" r="0.6" fill="#C9D7C6" opacity="0.56"/>
    <Circle cx="239.5" cy="589.3" r="0.9" fill="#C9D7C6" opacity="0.37"/>
    <Circle cx="142.0" cy="586.0" r="1.4" fill="#C9D7C6" opacity="0.60"/>
    <Circle cx="181.7" cy="632.9" r="0.7" fill="#C9D7C6" opacity="0.29"/>
    <Circle cx="133.6" cy="604.4" r="1.4" fill="#C9D7C6" opacity="0.31"/>
    <Circle cx="9.0" cy="693.6" r="1.1" fill="#C9D7C6" opacity="0.30"/>
    <Circle cx="211.8" cy="573.5" r="1.1" fill="#C9D7C6" opacity="0.59"/>
    <Circle cx="336.7" cy="660.5" r="0.9" fill="#C9D7C6" opacity="0.38"/>
    <Circle cx="65.1" cy="670.4" r="1.1" fill="#C9D7C6" opacity="0.52"/>
    <Circle cx="128.6" cy="599.0" r="1.4" fill="#C9D7C6" opacity="0.59"/>
    <Circle cx="332.5" cy="674.8" r="1.4" fill="#C9D7C6" opacity="0.51"/>
    <Circle cx="88.4" cy="637.3" r="1.0" fill="#C9D7C6" opacity="0.26"/>
    <Circle cx="10.9" cy="606.3" r="0.9" fill="#C9D7C6" opacity="0.49"/>
    <Circle cx="373.0" cy="628.1" r="1.5" fill="#C9D7C6" opacity="0.60"/>
    <Circle cx="372.5" cy="617.4" r="0.8" fill="#C9D7C6" opacity="0.33"/>
    <Circle cx="76.7" cy="596.6" r="1.2" fill="#C9D7C6" opacity="0.57"/>
    <Circle cx="327.8" cy="632.3" r="1.3" fill="#C9D7C6" opacity="0.53"/>
    <Circle cx="33.1" cy="655.9" r="1.5" fill="#C9D7C6" opacity="0.52"/>
    <Circle cx="292.6" cy="632.1" r="0.8" fill="#C9D7C6" opacity="0.53"/>
    <Circle cx="129.7" cy="674.1" r="1.6" fill="#C9D7C6" opacity="0.39"/>
    <Circle cx="156.5" cy="693.1" r="1.3" fill="#C9D7C6" opacity="0.31"/>
    <Circle cx="49.5" cy="589.6" r="1.5" fill="#C9D7C6" opacity="0.53"/>
    <Circle cx="57.0" cy="677.4" r="1.6" fill="#C9D7C6" opacity="0.48"/>
    <Circle cx="136.7" cy="641.3" r="0.7" fill="#C9D7C6" opacity="0.25"/>
    <Circle cx="378.6" cy="654.5" r="1.1" fill="#C9D7C6" opacity="0.58"/>
    <Circle cx="169.2" cy="683.3" r="1.4" fill="#C9D7C6" opacity="0.32"/>
    <Circle cx="98.2" cy="608.1" r="0.8" fill="#C9D7C6" opacity="0.46"/>
    <Circle cx="101.2" cy="624.5" r="0.7" fill="#C9D7C6" opacity="0.57"/>
    <Circle cx="138.0" cy="629.6" r="1.2" fill="#C9D7C6" opacity="0.57"/>
    <Circle cx="164.0" cy="689.3" r="1.1" fill="#C9D7C6" opacity="0.44"/>
    <Circle cx="204.2" cy="572.4" r="1.0" fill="#C9D7C6" opacity="0.31"/>
    <Circle cx="1.5" cy="673.9" r="0.8" fill="#C9D7C6" opacity="0.42"/>
    <Circle cx="282.8" cy="642.3" r="0.9" fill="#C9D7C6" opacity="0.43"/>
    <Circle cx="216.6" cy="672.0" r="0.7" fill="#C9D7C6" opacity="0.45"/>
    <Circle cx="96.9" cy="606.0" r="1.4" fill="#C9D7C6" opacity="0.43"/>
    <Circle cx="219.1" cy="668.8" r="1.5" fill="#C9D7C6" opacity="0.41"/>
    <Circle cx="238.9" cy="635.7" r="1.1" fill="#C9D7C6" opacity="0.49"/>
    <Circle cx="176.4" cy="639.3" r="1.1" fill="#C9D7C6" opacity="0.58"/>
    <Circle cx="272.7" cy="683.9" r="1.5" fill="#C9D7C6" opacity="0.34"/>
    <Circle cx="218.2" cy="692.6" r="1.4" fill="#C9D7C6" opacity="0.30"/>
    <Circle cx="47.4" cy="627.5" r="0.7" fill="#C9D7C6" opacity="0.33"/>
    <Circle cx="28.5" cy="657.0" r="1.4" fill="#C9D7C6" opacity="0.56"/>
    <Circle cx="60.2" cy="663.1" r="1.3" fill="#C9D7C6" opacity="0.30"/>
    <Circle cx="344.3" cy="695.8" r="0.8" fill="#C9D7C6" opacity="0.58"/>
    <Circle cx="155.3" cy="633.3" r="1.6" fill="#C9D7C6" opacity="0.54"/>
    <Circle cx="63.0" cy="626.1" r="1.1" fill="#C9D7C6" opacity="0.37"/>
    <Circle cx="76.3" cy="611.4" r="1.3" fill="#C9D7C6" opacity="0.26"/>
    <Circle cx="216.1" cy="627.3" r="0.6" fill="#C9D7C6" opacity="0.37"/>
    <Circle cx="243.3" cy="636.6" r="0.7" fill="#C9D7C6" opacity="0.59"/>
    <Circle cx="307.5" cy="696.3" r="0.7" fill="#C9D7C6" opacity="0.34"/>
    <Circle cx="15.4" cy="671.3" r="0.9" fill="#C9D7C6" opacity="0.30"/>
    <Circle cx="164.7" cy="688.5" r="1.4" fill="#C9D7C6" opacity="0.34"/>
    <Circle cx="58.3" cy="689.5" r="1.2" fill="#C9D7C6" opacity="0.50"/>
    <Circle cx="34.9" cy="577.5" r="1.3" fill="#C9D7C6" opacity="0.40"/>
    <Circle cx="28.2" cy="692.0" r="1.2" fill="#C9D7C6" opacity="0.53"/>
    <Circle cx="32.7" cy="681.3" r="0.7" fill="#C9D7C6" opacity="0.55"/>
    <Circle cx="177.0" cy="614.1" r="1.2" fill="#C9D7C6" opacity="0.57"/>
    <Path d="M309 632 Q312 622 320 623 Q329 626 326 633 Z" fill="#8C8F84" stroke="#5E6359" strokeWidth="1"/>
    <Path d="M335 624 Q338 614 346 615 Q355 618 352 625 Z" fill="#8C8F84" stroke="#5E6359" strokeWidth="1"/>
    <Path d="M347 640 Q350 630 358 631 Q367 634 364 641 Z" fill="#8C8F84" stroke="#5E6359" strokeWidth="1"/>
    <Path d="M291 644 Q294 634 302 635 Q311 638 308 645 Z" fill="#8C8F84" stroke="#5E6359" strokeWidth="1"/>
    <Path d="M323 648 Q326 638 334 639 Q343 642 340 649 Z" fill="#8C8F84" stroke="#5E6359" strokeWidth="1"/>
    <Path d="M361 630 Q364 620 372 621 Q381 624 378 631 Z" fill="#8C8F84" stroke="#5E6359" strokeWidth="1"/>
    <Path d="M-10 590 Q-4 470 60 452 Q120 440 128 500 Q134 560 96 592 Z" fill={`url(#${p}Rock)`}/>
    <Path d="M20 520 Q40 500 70 510 Q96 520 108 548" stroke="#B85C4A" strokeWidth="7" fill="none" strokeLinecap="round" opacity=".7"/>
    <Circle cx="40" cy="540" r="7" fill="#7A5AB0" opacity=".8"/><Circle cx="86" cy="476" r="5" fill="#E07A4F" opacity=".8"/>
    <Path d="M118 520 Q130 452 186 446 Q236 444 246 496 Q252 540 220 560 L140 566 Z" fill={`url(#${p}Rock)`}/>
    <Path d="M136 470 Q160 458 182 466 M196 456 Q214 452 230 466" stroke="#5FA88E" strokeWidth="5" fill="none" strokeLinecap="round" opacity=".75"/>
    <Ellipse cx="226" cy="500" rx="20" ry="26" fill={`url(#${p}Sponge)`}/><Ellipse cx="226" cy="478" rx="13" ry="5" fill="#5E3E0E"/>
    <Path d="M262 590 Q262 540 300 530 Q352 520 378 548 Q394 570 390 596 Z" fill={`url(#${p}Rock)`}/>
    <Path d="M270 566 Q300 556 340 560" stroke="#1A2433" strokeWidth="10" fill="none" strokeLinecap="round" opacity=".8"/>
    <G opacity=".95"><Path d="M312.0 505.0 Q309.2 476.0 312.0 447.0" stroke="#C9578C" strokeWidth="5.5" fill="none" strokeLinecap="round"/>
    <Circle cx="312.0" cy="463.8" r="3.1" fill="#F08BB6"/>
    <Circle cx="312.0" cy="489.8" r="1.9" fill="#F08BB6"/>
    <Path d="M312.0 447.0 Q303.0 427.0 291.0 406.9" stroke="#C9578C" strokeWidth="4.4" fill="none" strokeLinecap="round"/>
    <Circle cx="296.0" cy="435.4" r="2.4" fill="#F08BB6"/>
    <Circle cx="308.3" cy="433.1" r="1.6" fill="#F08BB6"/>
    <Circle cx="306.7" cy="446.4" r="2.8" fill="#F08BB6"/>
    <Circle cx="300.4" cy="439.4" r="2.4" fill="#F08BB6"/>
    <Path d="M291.0 406.9 Q271.7 396.9 261.9 386.9" stroke="#C9578C" strokeWidth="3.3" fill="none" strokeLinecap="round"/>
    <Circle cx="278.4" cy="397.0" r="2.9" fill="#F08BB6"/>
    <Circle cx="279.6" cy="396.8" r="2.7" fill="#F08BB6"/>
    <Circle cx="262.5" cy="400.1" r="2.9" fill="#F08BB6"/>
    <Circle cx="270.5" cy="394.2" r="2.2" fill="#F08BB6"/>
    <Path d="M261.9 386.9 Q243.3 383.3 235.4 379.6" stroke="#C9578C" strokeWidth="2.2" fill="none" strokeLinecap="round"/>
    <Circle cx="261.6" cy="382.3" r="3.0" fill="#F08BB6"/>
    <Circle cx="250.5" cy="386.5" r="2.7" fill="#F08BB6"/>
    <Path d="M235.4 379.6 Q224.8 380.5 214.0 381.3" stroke="#C9578C" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
    <Circle cx="222.6" cy="380.8" r="1.7" fill="#F08BB6"/>
    <Circle cx="231.4" cy="380.1" r="1.6" fill="#F08BB6"/>
    <Circle cx="227.6" cy="380.2" r="3.2" fill="#F08BB6"/>
    <Path d="M235.4 379.6 Q224.1 372.4 219.5 365.2" stroke="#C9578C" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
    <Circle cx="235.4" cy="374.1" r="2.4" fill="#F08BB6"/>
    <Circle cx="227.4" cy="376.7" r="2.4" fill="#F08BB6"/>
    <Path d="M261.9 386.9 Q251.9 376.3 244.3 365.7" stroke="#C9578C" strokeWidth="2.2" fill="none" strokeLinecap="round"/>
    <Circle cx="255.0" cy="380.6" r="2.6" fill="#F08BB6"/>
    <Circle cx="260.5" cy="366.6" r="3.0" fill="#F08BB6"/>
    <Path d="M244.3 365.7 Q240.1 359.8 226.5 353.8" stroke="#C9578C" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
    <Circle cx="237.4" cy="361.9" r="3.2" fill="#F08BB6"/>
    <Circle cx="241.7" cy="357.1" r="2.6" fill="#F08BB6"/>
    <Circle cx="243.6" cy="355.8" r="3.0" fill="#F08BB6"/>
    <Circle cx="233.1" cy="357.0" r="2.9" fill="#F08BB6"/>
    <Path d="M244.3 365.7 Q245.0 355.5 237.6 345.3" stroke="#C9578C" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
    <Circle cx="238.8" cy="353.8" r="3.0" fill="#F08BB6"/>
    <Circle cx="239.7" cy="351.6" r="2.0" fill="#F08BB6"/>
    <Path d="M291.0 406.9 Q283.7 389.5 286.0 372.0" stroke="#C9578C" strokeWidth="3.3" fill="none" strokeLinecap="round"/>
    <Circle cx="288.2" cy="385.0" r="2.6" fill="#F08BB6"/>
    <Circle cx="287.6" cy="389.8" r="1.6" fill="#F08BB6"/>
    <Circle cx="287.0" cy="380.8" r="2.4" fill="#F08BB6"/>
    <Path d="M286.0 372.0 Q281.0 360.1 272.1 348.2" stroke="#C9578C" strokeWidth="2.2" fill="none" strokeLinecap="round"/>
    <Circle cx="275.6" cy="360.7" r="2.9" fill="#F08BB6"/>
    <Circle cx="274.3" cy="366.4" r="2.8" fill="#F08BB6"/>
    <Path d="M272.1 348.2 Q266.0 341.0 256.2 333.8" stroke="#C9578C" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
    <Circle cx="264.3" cy="342.7" r="2.4" fill="#F08BB6"/>
    <Circle cx="261.3" cy="337.2" r="2.6" fill="#F08BB6"/>
    <Circle cx="261.9" cy="347.1" r="1.8" fill="#F08BB6"/>
    <Path d="M272.1 348.2 Q270.8 337.7 267.8 327.2" stroke="#C9578C" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
    <Circle cx="270.1" cy="338.0" r="3.2" fill="#F08BB6"/>
    <Circle cx="271.7" cy="343.6" r="2.4" fill="#F08BB6"/>
    <Path d="M286.0 372.0 Q292.2 358.6 292.1 345.2" stroke="#C9578C" strokeWidth="2.2" fill="none" strokeLinecap="round"/>
    <Circle cx="287.2" cy="345.8" r="3.1" fill="#F08BB6"/>
    <Circle cx="286.1" cy="359.7" r="2.9" fill="#F08BB6"/>
    <Circle cx="291.9" cy="359.9" r="2.0" fill="#F08BB6"/>
    <Circle cx="287.2" cy="346.6" r="1.9" fill="#F08BB6"/>
    <Path d="M292.1 345.2 Q285.9 334.6 288.4 324.0" stroke="#C9578C" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
    <Circle cx="291.1" cy="337.6" r="2.6" fill="#F08BB6"/>
    <Circle cx="289.7" cy="339.3" r="1.8" fill="#F08BB6"/>
    <Circle cx="290.7" cy="334.6" r="3.0" fill="#F08BB6"/>
    <Circle cx="290.6" cy="341.8" r="3.1" fill="#F08BB6"/>
    <Path d="M292.1 345.2 Q297.6 336.7 305.1 328.1" stroke="#C9578C" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
    <Circle cx="296.2" cy="330.9" r="1.6" fill="#F08BB6"/>
    <Circle cx="301.9" cy="330.9" r="1.8" fill="#F08BB6"/>
    <Circle cx="304.2" cy="333.0" r="3.0" fill="#F08BB6"/>
    <Path d="M312.0 447.0 Q325.7 425.7 327.4 404.5" stroke="#C9578C" strokeWidth="4.4" fill="none" strokeLinecap="round"/>
    <Circle cx="313.2" cy="407.6" r="2.8" fill="#F08BB6"/>
    <Circle cx="325.2" cy="435.1" r="1.7" fill="#F08BB6"/>
    <Circle cx="322.2" cy="420.0" r="1.8" fill="#F08BB6"/>
    <Circle cx="327.0" cy="428.4" r="2.1" fill="#F08BB6"/>
    <Path d="M327.4 404.5 Q329.2 386.9 324.1 369.3" stroke="#C9578C" strokeWidth="3.3" fill="none" strokeLinecap="round"/>
    <Circle cx="324.5" cy="376.0" r="2.6" fill="#F08BB6"/>
    <Circle cx="324.4" cy="371.4" r="2.5" fill="#F08BB6"/>
    <Circle cx="325.0" cy="402.7" r="2.8" fill="#F08BB6"/>
    <Path d="M324.1 369.3 Q321.0 357.0 311.9 344.7" stroke="#C9578C" strokeWidth="2.2" fill="none" strokeLinecap="round"/>
    <Circle cx="313.5" cy="357.4" r="3.1" fill="#F08BB6"/>
    <Circle cx="317.4" cy="365.1" r="2.3" fill="#F08BB6"/>
    <Circle cx="320.7" cy="363.0" r="2.8" fill="#F08BB6"/>
    <Circle cx="316.1" cy="359.3" r="2.0" fill="#F08BB6"/>
    <Path d="M311.9 344.7 Q306.0 337.4 296.1 330.1" stroke="#C9578C" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
    <Circle cx="309.3" cy="342.3" r="1.9" fill="#F08BB6"/>
    <Circle cx="297.6" cy="337.4" r="2.0" fill="#F08BB6"/>
    <Path d="M311.9 344.7 Q306.6 334.0 309.9 323.3" stroke="#C9578C" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
    <Circle cx="311.4" cy="340.9" r="2.5" fill="#F08BB6"/>
    <Circle cx="311.3" cy="336.8" r="2.9" fill="#F08BB6"/>
    <Path d="M324.1 369.3 Q327.7 356.5 334.1 343.7" stroke="#C9578C" strokeWidth="2.2" fill="none" strokeLinecap="round"/>
    <Circle cx="329.3" cy="359.7" r="2.1" fill="#F08BB6"/>
    <Circle cx="324.7" cy="362.2" r="3.1" fill="#F08BB6"/>
    <Circle cx="325.3" cy="356.4" r="2.6" fill="#F08BB6"/>
    <Circle cx="332.7" cy="363.8" r="2.0" fill="#F08BB6"/>
    <Path d="M334.1 343.7 Q333.6 333.0 335.4 322.3" stroke="#C9578C" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
    <Circle cx="334.7" cy="337.0" r="2.9" fill="#F08BB6"/>
    <Circle cx="335.4" cy="341.0" r="2.3" fill="#F08BB6"/>
    <Circle cx="335.1" cy="326.5" r="3.1" fill="#F08BB6"/>
    <Path d="M334.1 343.7 Q347.3 336.7 350.3 329.6" stroke="#C9578C" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
    <Circle cx="348.0" cy="330.0" r="2.0" fill="#F08BB6"/>
    <Circle cx="335.9" cy="341.5" r="2.4" fill="#F08BB6"/>
    <Circle cx="345.2" cy="330.5" r="2.8" fill="#F08BB6"/>
    <Circle cx="344.6" cy="332.9" r="2.3" fill="#F08BB6"/>
    <Path d="M327.4 404.5 Q336.8 392.1 352.6 379.7" stroke="#C9578C" strokeWidth="3.3" fill="none" strokeLinecap="round"/>
    <Circle cx="343.7" cy="397.0" r="1.8" fill="#F08BB6"/>
    <Circle cx="333.8" cy="388.7" r="2.7" fill="#F08BB6"/>
    <Path d="M352.6 379.7 Q354.2 367.8 366.2 355.8" stroke="#C9578C" strokeWidth="2.2" fill="none" strokeLinecap="round"/>
    <Circle cx="365.4" cy="375.1" r="2.0" fill="#F08BB6"/>
    <Circle cx="363.3" cy="379.7" r="2.5" fill="#F08BB6"/>
    <Circle cx="366.1" cy="373.1" r="2.1" fill="#F08BB6"/>
    <Circle cx="364.0" cy="373.9" r="2.4" fill="#F08BB6"/>
    <Path d="M366.2 355.8 Q361.9 345.1 368.9 334.5" stroke="#C9578C" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
    <Circle cx="368.1" cy="349.2" r="1.6" fill="#F08BB6"/>
    <Circle cx="367.5" cy="341.4" r="2.3" fill="#F08BB6"/>
    <Circle cx="366.9" cy="341.6" r="3.1" fill="#F08BB6"/>
    <Path d="M366.2 355.8 Q373.3 348.7 382.3 341.6" stroke="#C9578C" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
    <Circle cx="372.6" cy="355.7" r="2.1" fill="#F08BB6"/>
    <Circle cx="379.8" cy="354.8" r="2.4" fill="#F08BB6"/>
    <Circle cx="369.4" cy="344.9" r="1.9" fill="#F08BB6"/>
    <Circle cx="373.7" cy="352.0" r="3.0" fill="#F08BB6"/>
    <Path d="M352.6 379.7 Q370.2 374.7 378.2 369.7" stroke="#C9578C" strokeWidth="2.2" fill="none" strokeLinecap="round"/>
    <Circle cx="363.3" cy="373.0" r="3.1" fill="#F08BB6"/>
    <Circle cx="356.3" cy="375.8" r="1.9" fill="#F08BB6"/>
    <Circle cx="377.6" cy="378.3" r="1.7" fill="#F08BB6"/>
    <Path d="M378.2 369.7 Q385.5 363.3 395.4 356.9" stroke="#C9578C" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
    <Circle cx="393.4" cy="360.3" r="3.2" fill="#F08BB6"/>
    <Circle cx="394.3" cy="365.4" r="1.9" fill="#F08BB6"/>
    <Circle cx="394.3" cy="360.1" r="1.7" fill="#F08BB6"/>
    <Circle cx="389.7" cy="364.8" r="2.2" fill="#F08BB6"/>
    <Path d="M378.2 369.7 Q386.2 368.3 399.5 367.0" stroke="#C9578C" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
    <Circle cx="387.2" cy="367.3" r="2.5" fill="#F08BB6"/>
    <Circle cx="394.4" cy="368.7" r="2.8" fill="#F08BB6"/>
    <Circle cx="384.8" cy="367.5" r="1.7" fill="#F08BB6"/></G>
    <Path d="M312 505 L312 532" stroke="#9C3F6B" strokeWidth="6" strokeLinecap="round"/>
    <Path d="M84 330 Q53.7 319.8 29.1 329.6" stroke="#E8C64A" strokeWidth="3.2" fill="none" strokeLinecap="round" strokeDasharray="3 2.2"/>
    <Path d="M84 330 Q53.7 319.8 29.1 329.6" stroke="#2B2A1E" strokeWidth="1" fill="none" strokeLinecap="round" opacity=".55"/>
    <Path d="M84 330 Q59.5 312.9 30.8 315.8" stroke="#E8C64A" strokeWidth="3.2" fill="none" strokeLinecap="round" strokeDasharray="3 2.2"/>
    <Path d="M84 330 Q59.5 312.9 30.8 315.8" stroke="#2B2A1E" strokeWidth="1" fill="none" strokeLinecap="round" opacity=".55"/>
    <Path d="M84 330 Q55.9 309.0 30.9 307.9" stroke="#E8C64A" strokeWidth="3.2" fill="none" strokeLinecap="round" strokeDasharray="3 2.2"/>
    <Path d="M84 330 Q55.9 309.0 30.9 307.9" stroke="#2B2A1E" strokeWidth="1" fill="none" strokeLinecap="round" opacity=".55"/>
    <Path d="M84 330 Q67.7 304.0 41.7 297.9" stroke="#E8C64A" strokeWidth="3.2" fill="none" strokeLinecap="round" strokeDasharray="3 2.2"/>
    <Path d="M84 330 Q67.7 304.0 41.7 297.9" stroke="#2B2A1E" strokeWidth="1" fill="none" strokeLinecap="round" opacity=".55"/>
    <Path d="M84 330 Q61.1 302.7 52.2 295.4" stroke="#E8C64A" strokeWidth="3.2" fill="none" strokeLinecap="round" strokeDasharray="3 2.2"/>
    <Path d="M84 330 Q61.1 302.7 52.2 295.4" stroke="#2B2A1E" strokeWidth="1" fill="none" strokeLinecap="round" opacity=".55"/>
    <Path d="M84 330 Q72.4 297.4 66.2 284.8" stroke="#E8C64A" strokeWidth="3.2" fill="none" strokeLinecap="round" strokeDasharray="3 2.2"/>
    <Path d="M84 330 Q72.4 297.4 66.2 284.8" stroke="#2B2A1E" strokeWidth="1" fill="none" strokeLinecap="round" opacity=".55"/>
    <Path d="M84 330 Q87.2 298.9 82.6 287.8" stroke="#E8C64A" strokeWidth="3.2" fill="none" strokeLinecap="round" strokeDasharray="3 2.2"/>
    <Path d="M84 330 Q87.2 298.9 82.6 287.8" stroke="#2B2A1E" strokeWidth="1" fill="none" strokeLinecap="round" opacity=".55"/>
    <Path d="M84 330 Q85.9 291.3 94.2 272.7" stroke="#E8C64A" strokeWidth="3.2" fill="none" strokeLinecap="round" strokeDasharray="3 2.2"/>
    <Path d="M84 330 Q85.9 291.3 94.2 272.7" stroke="#2B2A1E" strokeWidth="1" fill="none" strokeLinecap="round" opacity=".55"/>
    <Path d="M84 330 Q100.3 296.1 106.9 282.1" stroke="#E8C64A" strokeWidth="3.2" fill="none" strokeLinecap="round" strokeDasharray="3 2.2"/>
    <Path d="M84 330 Q100.3 296.1 106.9 282.1" stroke="#2B2A1E" strokeWidth="1" fill="none" strokeLinecap="round" opacity=".55"/>
    <Path d="M84 330 Q104.3 303.6 114.2 297.3" stroke="#E8C64A" strokeWidth="3.2" fill="none" strokeLinecap="round" strokeDasharray="3 2.2"/>
    <Path d="M84 330 Q104.3 303.6 114.2 297.3" stroke="#2B2A1E" strokeWidth="1" fill="none" strokeLinecap="round" opacity=".55"/>
    <Path d="M84 330 Q104.4 300.5 125.9 290.9" stroke="#E8C64A" strokeWidth="3.2" fill="none" strokeLinecap="round" strokeDasharray="3 2.2"/>
    <Path d="M84 330 Q104.4 300.5 125.9 290.9" stroke="#2B2A1E" strokeWidth="1" fill="none" strokeLinecap="round" opacity=".55"/>
    <Path d="M84 330 Q118.7 308.5 140.2 306.9" stroke="#E8C64A" strokeWidth="3.2" fill="none" strokeLinecap="round" strokeDasharray="3 2.2"/>
    <Path d="M84 330 Q118.7 308.5 140.2 306.9" stroke="#2B2A1E" strokeWidth="1" fill="none" strokeLinecap="round" opacity=".55"/>
    <Path d="M84 330 Q107.9 316.1 131.9 322.2" stroke="#E8C64A" strokeWidth="3.2" fill="none" strokeLinecap="round" strokeDasharray="3 2.2"/>
    <Path d="M84 330 Q107.9 316.1 131.9 322.2" stroke="#2B2A1E" strokeWidth="1" fill="none" strokeLinecap="round" opacity=".55"/>
    <Path d="M84 330 Q113.0 317.1 148.3 324.3" stroke="#E8C64A" strokeWidth="3.2" fill="none" strokeLinecap="round" strokeDasharray="3 2.2"/>
    <Path d="M84 330 Q113.0 317.1 148.3 324.3" stroke="#2B2A1E" strokeWidth="1" fill="none" strokeLinecap="round" opacity=".55"/>
    <Circle cx="84" cy="330" r="7" fill="#8A6F1F"/>
    <Path d="M84 336 Q80 380 70 452" stroke="#6B5A2A" strokeWidth="4" fill="none"/>
    <G stroke="#2F7D5E" strokeWidth="3" fill="none" strokeLinecap="round" opacity=".85">
    <Path d="M150 600 Q146 580 152 562 M158 602 Q160 584 156 566 M240 610 Q236 590 244 574 M248 612 Q252 592 248 578"/>
    </G>
    <Ellipse cx="174" cy="618" rx="14" ry="5" fill="#2A3A3A"/>
    </Svg>
  );
}

export const MacroScene = memo(MacroSceneBase);
