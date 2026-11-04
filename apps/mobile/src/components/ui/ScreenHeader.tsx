import type { ReactNode } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Txt } from "./Txt";
import { colors } from "../../theme/tokens";

type Props = { eyebrow: string; title: string; actions?: ReactNode; tone?: "light" | "dark" };

/** Eyebrow (blue caps) + large title, as used on 홈/도감/로그북 headers in the canvas. */
export function ScreenHeader({ eyebrow, title, actions, tone = "light" }: Props) {
  const dark = tone === "dark";
  return (
    <View style={styles.row}>
      <View style={{ flexShrink: 1 }}>
        <Txt size={12} weight="extraBold" tracking={0.14} color={dark ? "#8EC5FF" : colors.oceanBlue}>
          {eyebrow}
        </Txt>
        <Txt accessibilityRole="header" size={26} weight="black" tracking={-0.02} color={dark ? colors.white : colors.navy}>
          {title}
        </Txt>
      </View>
      {actions ? <View style={styles.actions}>{actions}</View> : null}
    </View>
  );
}

export function RoundIconButton({ label, onPress, children }: { label: string; onPress?: () => void; children: ReactNode }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={styles.round} hitSlop={4}>
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20 },
  actions: { flexDirection: "row", gap: 8 },
  round: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
});
