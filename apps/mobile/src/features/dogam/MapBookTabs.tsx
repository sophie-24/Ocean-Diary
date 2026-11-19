import { Pressable, StyleSheet, View } from "react-native";
import { Txt } from "../../components/ui/Txt";
import { colors, shadow } from "../../theme/tokens";

/**
 * "지도 / 도감" 공통 서브탭 — 도감 탭 안에서 세계 지도 뷰(SeaMapScreen)와
 * 생물 도감 뷰(DogamScreen)를 전환하는 pill-shaped segmented control.
 *
 * SeaMapScreen·DogamScreen 각각 상단에 하나씩 심어두고, 두 스크린이 공유하는
 * wrapper(`app/(tabs)/dogam.tsx`)가 state를 들고 있다가 콜백으로 전환해요.
 */
export type MapBookTab = "map" | "book";

type Props = {
  active: MapBookTab;
  onChange: (tab: MapBookTab) => void;
};

export function MapBookTabs({ active, onChange }: Props) {
  return (
    <View style={styles.wrap} accessibilityRole="tablist">
      {(["map", "book"] as const).map((k) => {
        const on = active === k;
        return (
          <Pressable
            key={k}
            onPress={() => !on && onChange(k)}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            accessibilityLabel={k === "map" ? "지도 보기" : "도감 보기"}
            style={[styles.pill, on && styles.pillOn]}
          >
            <Txt
              size={13}
              weight={on ? "extraBold" : "bold"}
              color={on ? colors.navy : colors.ink2}
            >
              {k === "map" ? "지도" : "도감"}
            </Txt>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    padding: 3,
    borderRadius: 12,
    backgroundColor: colors.track,
    alignSelf: "flex-start",
  },
  pill: {
    height: 34,
    paddingHorizontal: 14,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  pillOn: {
    backgroundColor: colors.white,
    ...shadow.raised,
  },
});
