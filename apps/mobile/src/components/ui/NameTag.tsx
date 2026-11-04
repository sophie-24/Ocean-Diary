import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { Txt } from "./Txt";
import { colors, shadow } from "../../theme/tokens";

type Props = {
  ko: string;
  en?: string;
  size?: "sm" | "md" | "lg";
  /** White fill (used when overlapping artwork) vs transparent. */
  filled?: boolean;
  heading?: boolean;
  style?: StyleProp<ViewStyle>;
};

const SIZES = {
  sm: { ko: 13, en: 10, px: 12, py: 3 },
  md: { ko: 16, en: 11, px: 18, py: 4 },
  lg: { ko: 22, en: 12, px: 22, py: 5 },
} as const;

/** The sky-outlined pill label that sits under every illustration (Korean name + English name). */
export function NameTag({ ko, en, size = "sm", filled = false, heading = false, style }: Props) {
  const s = SIZES[size];
  return (
    <View
      style={[
        styles.tag,
        { paddingHorizontal: s.px, paddingVertical: s.py },
        filled && styles.filled,
        size === "lg" && shadow.card,
        style,
      ]}
    >
      <Txt size={s.ko} weight={size === "sm" ? "extraBold" : "black"} numberOfLines={1} accessibilityRole={heading ? "header" : undefined}>
        {ko}
      </Txt>
      {en ? (
        <Txt size={s.en} weight="medium" color={colors.inkSoft} numberOfLines={1}>
          {en}
        </Txt>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  tag: { alignItems: "center", alignSelf: "center", maxWidth: "100%", borderRadius: 999, borderWidth: 2, borderColor: colors.pillLine },
  filled: { backgroundColor: colors.white },
});
