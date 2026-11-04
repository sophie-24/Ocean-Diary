import { memo } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import { Critter } from "../../components/Critter";
import { Txt } from "../../components/ui/Txt";
import { colors, shadow } from "../../theme/tokens";
import type { SpeciesEntry } from "../../data/species";

type Props = { species: SpeciesEntry; collected: boolean; isNew?: boolean; onPress?: () => void };

const ART_W = 148;
const ART_H = 74;

function NoArt({ ghost }: { ghost: boolean }) {
  if (ghost) {
    return (
      <View style={styles.noArtGhost}>
        <Svg width={60} height={38} viewBox="0 0 34 22">
          <Path d="M2 11 C8 3 18 2 25 8 L32 3 V19 L25 14 C18 20 8 19 2 11 Z" fill={colors.ghostInk} />
        </Svg>
      </View>
    );
  }
  return (
    <View style={styles.noArt}>
      <Svg width={34} height={22} viewBox="0 0 34 22">
        <Path d="M2 11 C8 3 18 2 25 8 L32 3 V19 L25 14 C18 20 8 19 2 11 Z" fill="none" stroke={colors.ink3} strokeWidth={1.6} strokeLinejoin="round" />
        <Circle cx={9} cy={10} r={1.2} fill={colors.ink3} />
      </Svg>
      <Txt size={10} weight="bold" color={colors.ink3}>
        일러스트 준비 중
      </Txt>
    </View>
  );
}

function SpeciesCardBase({ species, collected, isNew, onPress }: Props) {
  if (!collected) {
    return (
      <View
        style={[styles.card, styles.ghostCard]}
        accessible
        accessibilityLabel={`아직 발견하지 못한 생물 No.${species.no}, ${species.group}`}
      >
        <Txt size={10} weight="extraBold" color={colors.ink3} style={styles.no}>
          No.{species.no}
        </Txt>
        {species.art ? <Critter kind={species.art} width={ART_W} height={ART_H} ghost /> : <NoArt ghost />}
        <View style={[styles.nameTag, styles.ghostTag]}>
          <Txt size={13} weight="extraBold" color={colors.ink3}>
            ???
          </Txt>
          <Txt size={10} color={colors.ink3}>
            {species.group}
          </Txt>
        </View>
      </View>
    );
  }
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`No.${species.no} ${species.nameKo}${isNew ? ", 새로 발견" : ""}`}
      style={({ pressed }) => [styles.card, styles.gotCard, shadow.card, pressed && { transform: [{ scale: 0.98 }] }]}
    >
      <Txt size={10} weight="extraBold" color={colors.ink3} style={styles.no}>
        No.{species.no}
      </Txt>
      {isNew ? (
        <View style={styles.newBadge}>
          <Txt size={10} weight="black" color={colors.white}>
            NEW
          </Txt>
        </View>
      ) : null}
      {species.art ? <Critter kind={species.art} width={ART_W} height={ART_H} /> : <NoArt ghost={false} />}
      <View style={styles.nameTag}>
        <Txt size={13} weight="extraBold" numberOfLines={1}>
          {species.nameKo}
        </Txt>
        <Txt size={10} color={colors.inkSoft} numberOfLines={1}>
          {species.nameEn}
        </Txt>
      </View>
    </Pressable>
  );
}

export const SpeciesCard = memo(SpeciesCardBase);

const styles = StyleSheet.create({
  card: { flex: 1, alignItems: "center", gap: 8, paddingTop: 26, paddingBottom: 12, paddingHorizontal: 8, borderRadius: 22 },
  gotCard: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line },
  ghostCard: { backgroundColor: colors.ghostBg, borderWidth: 1.5, borderColor: colors.ghostLine, borderStyle: "dashed" },
  no: { position: "absolute", left: 12, top: 10 },
  newBadge: { position: "absolute", right: 10, top: 8, paddingHorizontal: 7, paddingVertical: 1, borderRadius: 999, backgroundColor: colors.coral },
  nameTag: {
    alignItems: "center",
    maxWidth: "100%",
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: colors.pillLine,
  },
  ghostTag: { borderStyle: "dashed", borderColor: colors.ghostLine, backgroundColor: colors.white, paddingHorizontal: 14 },
  noArt: { width: ART_W, height: ART_H, borderRadius: 14, backgroundColor: colors.mist, alignItems: "center", justifyContent: "center", gap: 4 },
  noArtGhost: { width: ART_W, height: ART_H, alignItems: "center", justifyContent: "center" },
});
