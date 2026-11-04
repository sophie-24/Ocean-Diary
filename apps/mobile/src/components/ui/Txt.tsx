import { Text, type TextProps, type TextStyle } from "react-native";
import { colors, fonts, type FontWeightKey } from "../../theme/tokens";

type Props = TextProps & {
  size?: number;
  weight?: FontWeightKey;
  color?: string;
  /** letter-spacing in em, like the design canvas (e.g. -0.02) */
  tracking?: number;
  align?: TextStyle["textAlign"];
};

/** Noto Sans KR text with the canvas' size/weight vocabulary. */
export function Txt({ size = 14, weight = "regular", color = colors.navy, tracking, align, style, ...rest }: Props) {
  return (
    <Text
      {...rest}
      style={[
        {
          fontFamily: fonts[weight],
          fontSize: size,
          lineHeight: Math.round(size * 1.45),
          color,
          letterSpacing: tracking ? tracking * size : undefined,
          textAlign: align,
          includeFontPadding: false,
        },
        style,
      ]}
    />
  );
}
