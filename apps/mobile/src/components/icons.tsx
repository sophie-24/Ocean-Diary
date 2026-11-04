import Svg, { Circle, Path, Rect } from "react-native-svg";
import { colors } from "../theme/tokens";

type P = { size?: number; color?: string; strokeWidth?: number };

const base = (color: string, strokeWidth: number) => ({
  fill: "none",
  stroke: color,
  strokeWidth,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
});

export const BellIcon = ({ size = 20, color = colors.navy, strokeWidth = 1.9 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M6 16 V11 A6 6 0 0 1 18 11 V16 L19.5 18 H4.5 Z" {...base(color, strokeWidth)} />
    <Path d="M10 20.5 A2 2 0 0 0 14 20.5" {...base(color, strokeWidth)} />
  </Svg>
);

export const SunIcon = ({ size = 14, color = colors.white, strokeWidth = 2.2 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Circle cx={12} cy={12} r={4} {...base(color, strokeWidth)} />
    <Path d="M12 2.5 V5 M12 19 V21.5 M2.5 12 H5 M19 12 H21.5 M5.3 5.3 L7 7 M17 17 L18.7 18.7 M5.3 18.7 L7 17 M17 7 L18.7 5.3" {...base(color, strokeWidth)} />
  </Svg>
);

export const ChevronRight = ({ size = 16, color = colors.navy, strokeWidth = 2.4 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M9 5 L16 12 L9 19" {...base(color, strokeWidth)} />
  </Svg>
);

export const ChevronLeft = ({ size = 20, color = colors.navy, strokeWidth = 2.4 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M15 5 L8 12 L15 19" {...base(color, strokeWidth)} />
  </Svg>
);

export const BookmarkIcon = ({ size = 20, color = colors.navy, strokeWidth = 2 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M6 3.5 H18 V21 L12 16.5 L6 21 Z" {...base(color, strokeWidth)} />
  </Svg>
);

export const GlobeIcon = ({ size = 24, color = colors.navy, strokeWidth = 1.8 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Circle cx={12} cy={12} r={9} {...base(color, strokeWidth)} />
    <Path d="M3 12 H21 M12 3 C9 6 9 18 12 21 M12 3 C15 6 15 18 12 21" {...base(color, strokeWidth)} />
  </Svg>
);

export const ShareIcon = ({ size = 20, color = colors.navy, strokeWidth = 2 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M12 15 V3.5 M7.5 8 L12 3.5 L16.5 8" {...base(color, strokeWidth)} />
    <Path d="M5 12 V19 A1.5 1.5 0 0 0 6.5 20.5 H17.5 A1.5 1.5 0 0 0 19 19 V12" {...base(color, strokeWidth)} />
  </Svg>
);

export const SearchIcon = ({ size = 20, color = colors.navy, strokeWidth = 2 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Circle cx={11} cy={11} r={6.5} {...base(color, strokeWidth)} />
    <Path d="M16 16 L20.5 20.5" {...base(color, strokeWidth)} />
  </Svg>
);

export const InfoIcon = ({ size = 18, color = colors.oceanBlue, strokeWidth = 2 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Circle cx={12} cy={12} r={9} {...base(color, strokeWidth)} />
    <Path d="M12 11 V16.5 M12 7.6 V7.5" {...base(color, strokeWidth)} />
  </Svg>
);

export const CloseIcon = ({ size = 22, color = colors.navy, strokeWidth = 2.4 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M6 6 L18 18 M18 6 L6 18" {...base(color, strokeWidth)} />
  </Svg>
);

export const ChevronDown = ({ size = 16, color = colors.navy, strokeWidth = 2.4 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M6 9 L12 15 L18 9" {...base(color, strokeWidth)} />
  </Svg>
);

export const SparkleIcon = ({ size = 20, color = colors.white, strokeWidth = 2 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M12 3 L13.8 9.2 L20 11 L13.8 12.8 L12 19 L10.2 12.8 L4 11 L10.2 9.2 Z" {...base(color, strokeWidth)} />
    <Path d="M19 3 V6 M17.5 4.5 H20.5" {...base(color, strokeWidth)} />
  </Svg>
);

export const PlayIcon = ({ size = 10, color = colors.white }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M7 4 L20 12 L7 20 Z" fill={color} />
  </Svg>
);

export const CheckIcon = ({ size = 14, color = colors.white, strokeWidth = 3 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M5 12.5 L10 17 L19 7" {...base(color, strokeWidth)} />
  </Svg>
);

export const PinIcon = ({ size = 14, color = colors.ink2, strokeWidth = 2 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M12 21 C7 15.5 5 12.5 5 9.5 A7 7 0 0 1 19 9.5 C19 12.5 17 15.5 12 21 Z" {...base(color, strokeWidth)} />
    <Circle cx={12} cy={9.5} r={2.4} {...base(color, strokeWidth)} />
  </Svg>
);

export const SoundOffIcon = ({ size = 20, color = colors.white, strokeWidth = 2 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M4 9.5 H8 L13 5 V19 L8 14.5 H4 Z" {...base(color, strokeWidth)} />
    <Path d="M17 9.5 L21 13.5 M21 9.5 L17 13.5" {...base(color, strokeWidth)} />
  </Svg>
);

export const FishIcon = ({ size = 18, color = colors.navy, strokeWidth = 2 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M2 12 C6 6 14 5 19 10 L22 7 V17 L19 14 C14 19 6 18 2 12 Z" {...base(color, strokeWidth)} />
  </Svg>
);

export const ScubaIcon = ({ size = 16, color = colors.navy, strokeWidth = 2 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Rect x={8} y={3} width={8} height={18} rx={4} {...base(color, strokeWidth)} />
    <Path d="M10 3 V1.5 H14 V3" {...base(color, strokeWidth)} />
  </Svg>
);

export const FreeIcon = ({ size = 16, color = colors.navy, strokeWidth = 2 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Circle cx={12} cy={5} r={2.5} {...base(color, strokeWidth)} />
    <Path d="M12 8 V15 M8 21 L12 15 L16 21 M7 11 H17" {...base(color, strokeWidth)} />
  </Svg>
);

export const SnorkelIcon = ({ size = 16, color = colors.navy, strokeWidth = 2 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M3 9 H14 Q15 9 15 10 V13 Q15 15 13 15 H11 L9 13 L7 15 H5 Q3 15 3 13 Z" {...base(color, strokeWidth)} />
    <Path d="M19 3 V15 Q19 19 15 19 H12" {...base(color, strokeWidth)} />
  </Svg>
);

export const PlusIcon = ({ size = 20, color = colors.white, strokeWidth = 2.6 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M12 5 V19 M5 12 H19" {...base(color, strokeWidth)} />
  </Svg>
);

export const StampBookIcon = ({ size = 20, color = colors.navy, strokeWidth = 1.9 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Rect x={4} y={4} width={7} height={7} rx={1.5} {...base(color, strokeWidth)} />
    <Rect x={13} y={4} width={7} height={7} rx={1.5} {...base(color, strokeWidth)} />
    <Rect x={4} y={13} width={7} height={7} rx={1.5} {...base(color, strokeWidth)} />
    <Rect x={13} y={13} width={7} height={7} rx={1.5} {...base(color, strokeWidth)} />
  </Svg>
);

export const CameraIcon = ({ size = 20, color = colors.white, strokeWidth = 2 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Rect x={3} y={7} width={18} height={13} rx={3} {...base(color, strokeWidth)} />
    <Path d="M8 7 L9.5 4.5 H14.5 L16 7" {...base(color, strokeWidth)} />
    <Circle cx={12} cy={13.5} r={3.4} {...base(color, strokeWidth)} />
  </Svg>
);
