import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Critter } from "../Critter";
import type { CritterKind } from "../../data/illustrations";
import { ScreenHeader } from "./ScreenHeader";
import { Txt } from "./Txt";
import { colors, shadow } from "../../theme/tokens";

type Props = {
  eyebrow: string;
  title: string;
  critter: CritterKind;
  summary: string;
  /** Screens from the design canvas that this tab will host. */
  screens: string[];
  tone?: "light" | "dark";
};

/**
 * Temporary tab body used while each tab is rebuilt from the design canvas (phase 3).
 * It keeps navigation, fonts and illustration loading testable on device.
 */
export function PlannedScreen({ eyebrow, title, critter, summary, screens, tone = "light" }: Props) {
  const dark = tone === "dark";
  return (
    <SafeAreaView edges={["top"]} style={[styles.root, dark && { backgroundColor: colors.deepSea }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenHeader eyebrow={eyebrow} title={title} tone={tone} />
        <View style={[styles.card, shadow.card, dark && styles.cardDark]}>
          <Critter kind={critter} width={220} height={110} style={{ alignSelf: "center" }} />
          <Txt size={15} weight="extraBold" color={dark ? colors.white : colors.navy} align="center">
            {summary}
          </Txt>
          <View style={{ gap: 6, marginTop: 6 }}>
            {screens.map((s) => (
              <View key={s} style={styles.row}>
                <View style={[styles.dot, dark && { backgroundColor: "#8EC5FF" }]} />
                <Txt size={13} color={dark ? colors.darkInkSoft : colors.ink2} style={{ flex: 1 }}>
                  {s}
                </Txt>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.mist },
  content: { paddingTop: 8, paddingBottom: 32 },
  card: { margin: 20, padding: 20, gap: 10, borderRadius: 22, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line },
  cardDark: { backgroundColor: "rgba(255,255,255,0.06)", borderColor: colors.glassLine },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.oceanBlue },
});
