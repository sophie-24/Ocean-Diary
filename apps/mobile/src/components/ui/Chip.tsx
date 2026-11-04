import { Pressable, StyleSheet } from "react-native";
import { Txt } from "./Txt";
import { colors } from "../../theme/tokens";

type Props = { label: string; count?: string; selected: boolean; onPress: () => void };

/** Filter chip: navy when selected, white outlined otherwise. */
export function Chip({ label, count, selected, onPress }: Props) {
  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected }}
      accessibilityLabel={count ? `${label} ${count}` : label}
      onPress={onPress}
      style={[styles.chip, selected ? styles.on : styles.off]}
    >
      <Txt size={14} weight="extraBold" color={selected ? colors.white : colors.navy}>
        {label}
        {count ? (
          <Txt size={14} weight="medium" color={selected ? colors.white : colors.navy} style={{ opacity: 0.85 }}>
            {" "}
            {count}
          </Txt>
        ) : null}
      </Txt>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: { height: 40, paddingHorizontal: 15, borderRadius: 999, borderWidth: 1, justifyContent: "center" },
  on: { backgroundColor: colors.navy, borderColor: colors.navy },
  off: { backgroundColor: colors.white, borderColor: colors.lineStrong },
});
