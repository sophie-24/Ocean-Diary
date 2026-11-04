import { Pressable, StyleSheet, View } from "react-native";
import Svg, { Circle, Path, Rect } from "react-native-svg";
import type { BottomTabBarProps } from "expo-router/tabs";
import * as Haptics from "expo-haptics";
import { Txt } from "./ui/Txt";
import { colors, shadow } from "../theme/tokens";

export type TabKey = "index" | "dogam" | "discover" | "log" | "sea";

const TABS: Record<TabKey, { label: string; a11y: string }> = {
  index: { label: "홈", a11y: "홈" },
  dogam: { label: "도감", a11y: "도감" },
  discover: { label: "발견", a11y: "발견 · 사진이나 영상 올리기" },
  log: { label: "로그북", a11y: "로그북" },
  sea: { label: "나의 바다", a11y: "나의 바다" },
};

function TabIcon({ tab, color }: { tab: TabKey; color: string }) {
  const common = { fill: "none", stroke: color, strokeWidth: 1.9, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
  switch (tab) {
    case "index":
      return (
        <Svg width={22} height={22} viewBox="0 0 24 24">
          <Path d="M4 11 L12 4 L20 11 V20 H14 V14 H10 V20 H4 Z" {...common} />
        </Svg>
      );
    case "dogam":
      return (
        <Svg width={22} height={22} viewBox="0 0 24 24">
          <Path d="M4 5 Q8 3.5 12 6 Q16 3.5 20 5 V19 Q16 17.5 12 20 Q8 17.5 4 19 Z" {...common} />
          <Path d="M12 6 V20" {...common} />
        </Svg>
      );
    case "discover":
      return (
        <Svg width={26} height={26} viewBox="0 0 24 24">
          <Rect x={3} y={7} width={18} height={13} rx={3} {...common} stroke={colors.white} strokeWidth={2} />
          <Path d="M8 7 L9.5 4.5 H14.5 L16 7" {...common} stroke={colors.white} strokeWidth={2} />
          <Circle cx={12} cy={13.5} r={3.6} {...common} stroke={colors.white} strokeWidth={2} />
        </Svg>
      );
    case "log":
      return (
        <Svg width={22} height={22} viewBox="0 0 24 24">
          <Rect x={5} y={3.5} width={14} height={17} rx={2} {...common} />
          <Path d="M9 3.5 V20.5" {...common} />
          <Path d="M12 8.5 H16 M12 12 H16" {...common} />
        </Svg>
      );
    case "sea":
      return (
        <Svg width={22} height={22} viewBox="0 0 24 24">
          <Path d="M12 3 C8.7 3 6.5 5.4 6.5 8.4 C6.5 12.3 12 16.5 12 16.5 C12 16.5 17.5 12.3 17.5 8.4 C17.5 5.4 15.3 3 12 3 Z" {...common} />
          <Circle cx={12} cy={8.5} r={2} {...common} />
          <Path d="M3 20.5 Q6 18.5 9 20.5 T15 20.5 T21 20.5" {...common} />
        </Svg>
      );
  }
}

/** Five-tab bar from the design canvas: 홈 · 도감 · (발견) · 로그북 · 나의 바다. Dark on the aquarium tab. */
export function TabBar({ state, navigateToTab, insets }: BottomTabBarProps) {
  const activeName = state.routes[state.index]?.name;
  const dark = activeName === "sea";
  const bar = dark
    ? { bg: "rgba(8,24,58,0.92)", line: "rgba(142,197,255,0.18)", ring: "#0B2150" }
    : { bg: colors.white, line: colors.line, ring: colors.white };

  return (
    // The backdrop fills the rounded corners with the current screen's background.
    <View style={{ backgroundColor: dark ? colors.deepSea : colors.mist }}>
    <View
      accessibilityRole="tablist"
      style={[
        styles.bar,
        shadow.raised,
        { backgroundColor: bar.bg, borderTopColor: bar.line, paddingBottom: Math.max(insets.bottom, 10) },
      ]}
    >
      {state.routes.map((route, i) => {
        const tab = route.name as TabKey;
        const meta = TABS[tab];
        if (!meta) return null;
        const focused = i === state.index;
        const fg = focused ? (dark ? colors.white : colors.navy) : dark ? colors.darkTabInactive : colors.ink3;
        const pillBg = focused ? (dark ? "rgba(142,197,255,0.22)" : colors.sky) : "transparent";
        const onPress = () => {
          if (!focused) {
            void Haptics.selectionAsync().catch(() => undefined);
            navigateToTab(route.key);
          }
        };

        if (tab === "discover") {
          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={meta.a11y}
              style={styles.item}
            >
              <View style={[styles.fab, { borderColor: bar.ring }]}>
                <TabIcon tab="discover" color={colors.white} />
              </View>
              <Txt size={11} weight={focused ? "extraBold" : "medium"} color={fg}>
                {meta.label}
              </Txt>
            </Pressable>
          );
        }

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            accessibilityRole="tab"
            accessibilityState={{ selected: focused }}
            accessibilityLabel={meta.a11y}
            style={styles.item}
          >
            <View style={[styles.pill, { backgroundColor: pillBg }]}>
              <TabIcon tab={tab} color={fg} />
            </View>
            <Txt size={11} weight={focused ? "extraBold" : "medium"} color={fg}>
              {meta.label}
            </Txt>
          </Pressable>
        );
      })}
    </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingTop: 6,
    paddingHorizontal: 6,
  },
  item: { flex: 1, alignItems: "center", justifyContent: "flex-end", gap: 2, minHeight: 48 },
  pill: { width: 44, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center" },
  fab: {
    width: 58,
    height: 58,
    marginTop: -30,
    borderRadius: 29,
    borderWidth: 4,
    backgroundColor: colors.oceanBlue,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.oceanBlue,
    shadowOpacity: 0.35,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
});
