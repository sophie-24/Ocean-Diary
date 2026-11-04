import { Image } from "expo-image";
import { View, type StyleProp, type ViewStyle } from "react-native";
import { SPECIES_ART, type CritterKind } from "../data/illustrations";

type Props = {
  kind: CritterKind;
  width: number;
  height: number;
  /** Uncollected species render as a pale sky-blue silhouette of the same artwork. */
  ghost?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
};

const GHOST_TINT = "#BFD6F2";

export function Critter({ kind, width, height, ghost = false, style, accessibilityLabel }: Props) {
  return (
    <View
      style={[{ width, height, opacity: ghost ? 0.75 : 1 }, style]}
      accessible={!!accessibilityLabel}
      accessibilityRole={accessibilityLabel ? "image" : undefined}
      accessibilityLabel={accessibilityLabel}
    >
      <Image
        source={SPECIES_ART[kind]}
        style={{ width: "100%", height: "100%" }}
        contentFit="contain"
        tintColor={ghost ? GHOST_TINT : undefined}
        transition={120}
        accessible={false}
      />
    </View>
  );
}
