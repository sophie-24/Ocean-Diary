import { memo } from "react";
import { StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import { Txt } from "../../components/ui/Txt";
import { SITE_ART } from "../../data/illustrations";
import type { SiteEntry } from "../../data/sites";
import { colors, shadow } from "../../theme/tokens";

const STAMP = 92;

function SiteStampCardBase({ site }: { site: SiteEntry }) {
  const got = !!site.collectedOn;
  return (
    <View
      accessible
      accessibilityLabel={`${site.nameKo}, ${site.country} ${site.region}, ${got ? `${site.collectedOn} 스탬프 획득` : "아직 찍지 않은 스탬프"}`}
      style={[styles.card, got ? [styles.got, shadow.card] : styles.ghost]}
    >
      <View style={styles.stampWrap}>
        <View style={[styles.stamp, got && styles.tilt]}>
          <Image
            source={SITE_ART[site.art]}
            style={[styles.img, !got && { opacity: 0.32 }]}
            contentFit="cover"
          />
          {/* Uncollected stamps read as a faded, washed-out print. */}
          {!got ? <View style={styles.wash} /> : null}
        </View>
        <View style={[styles.ring, got ? [styles.ringGot, styles.tilt] : styles.ringGhost]} pointerEvents="none" />
        {got ? (
          <View style={styles.date}>
            <Txt size={9} weight="black" color={colors.white}>
              {site.collectedOn?.slice(2).replace(/-/g, ".")}
            </Txt>
          </View>
        ) : null}
      </View>
      <Txt size={14} weight="black" align="center" style={{ marginTop: 10 }}>
        {site.nameKo}
      </Txt>
      <Txt size={11} color={colors.ink2} align="center">
        {site.country} · {site.region}
      </Txt>
      <Txt size={11} color={colors.ink3} align="center" style={{ marginTop: 4 }}>
        {site.note}
      </Txt>
    </View>
  );
}

export const SiteStampCard = memo(SiteStampCardBase);

const styles = StyleSheet.create({
  card: { flex: 1, paddingVertical: 14, paddingHorizontal: 10, borderRadius: 22 },
  got: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line },
  ghost: { backgroundColor: colors.ghostBg, borderWidth: 1.5, borderStyle: "dashed", borderColor: colors.ghostLine },
  stampWrap: { width: STAMP, height: STAMP, alignSelf: "center", marginTop: 2 },
  stamp: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, borderRadius: STAMP / 2, overflow: "hidden" },
  img: { width: "100%", height: "100%" },
  wash: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(226,234,244,0.45)" },
  tilt: { transform: [{ rotate: "-6deg" }] },
  ring: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, borderRadius: STAMP / 2 },
  ringGot: { borderWidth: 3, borderColor: colors.navy },
  ringGhost: { borderWidth: 2, borderStyle: "dashed", borderColor: colors.ghostInk },
  date: {
    position: "absolute",
    right: -10,
    bottom: 2,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: colors.coral,
    transform: [{ rotate: "-8deg" }],
  },
});
