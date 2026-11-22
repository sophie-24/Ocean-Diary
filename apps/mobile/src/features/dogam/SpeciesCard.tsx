import { memo } from "react";
import { Image, Pressable, StyleSheet, View } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import { Critter } from "../../components/Critter";
import { Txt } from "../../components/ui/Txt";
import { colors, shadow } from "../../theme/tokens";
import type { SpeciesEntry } from "../../data/species";

type Props = {
  species: SpeciesEntry;
  collected: boolean;
  collectedDate?: string | null;
  isNew?: boolean;
  /** True when the species was identified by AI but has no catalog illustration yet */
  temp?: boolean;
  /** User photo for temp cards (species without illustrations) */
  photoUri?: string | null;
  onPress?: () => void;
};

const ART_W = 148;
const ART_H = 74;

function NoArt({ photoUri }: { photoUri?: string | null }) {
  if (photoUri) {
    return (
      <Image source={{ uri: photoUri }} style={styles.tempPhoto} resizeMode="cover" />
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

/** Format date string "2026-05-12" → "2026.05.12" */
function fmtDate(d: string) {
  return d.replace(/-/g, ".");
}

function SpeciesCardBase({ species, collected, collectedDate, isNew, temp, photoUri, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`No.${species.no} ${species.nameKo}${collected ? ", 수집 완료" : ""}${isNew ? ", 새로 발견" : ""}`}
      style={({ pressed }) => [styles.card, shadow.card, pressed && { transform: [{ scale: 0.98 }] }]}
    >
      <Txt size={10} weight="extraBold" color={colors.ink3} style={styles.no}>
        No.{species.no}
      </Txt>

      {/* 수집 완료 뱃지 */}
      {collected && collectedDate ? (
        <View style={styles.dateBadge}>
          <Txt size={9} weight="bold" color={colors.oceanBlue}>
            {fmtDate(collectedDate)}
          </Txt>
        </View>
      ) : null}

      {/* NEW 뱃지 */}
      {isNew ? (
        <View style={styles.newBadge}>
          <Txt size={10} weight="black" color={colors.white}>
            NEW
          </Txt>
        </View>
      ) : null}

      {/* 임시카드 뱃지 */}
      {temp ? (
        <View style={styles.tempBadge}>
          <Txt size={9} weight="bold" color="#8A5A00">
            임시
          </Txt>
        </View>
      ) : null}

      {/* 일러스트 — 모든 종 풀 컬러 표시 */}
      {species.art ? <Critter kind={species.art} width={ART_W} height={ART_H} /> : <NoArt photoUri={temp ? photoUri : null} />}

      {/* 종 이름 — 수집 여부 관계없이 실제 이름 표시 */}
      <View style={[styles.nameTag, collected && styles.nameTagCollected]}>
        <Txt size={13} weight="extraBold" numberOfLines={1}>
          {species.nameKo}
        </Txt>
        <Txt size={10} color={colors.inkSoft} numberOfLines={1}>
          {species.nameEn}
        </Txt>
      </View>

      {/* 미수집 오버레이 — 수집하지 않은 종은 살짝 연하게 */}
      {!collected && <View style={styles.uncollectedOverlay} />}
    </Pressable>
  );
}

export const SpeciesCard = memo(SpeciesCardBase);

const styles = StyleSheet.create({
  card: {
    flex: 1,
    alignItems: "center",
    gap: 8,
    paddingTop: 26,
    paddingBottom: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: colors.white,
    overflow: "hidden",
  },
  no: { position: "absolute", left: 12, top: 10, zIndex: 1 },
  newBadge: {
    position: "absolute",
    right: 10,
    top: 8,
    paddingHorizontal: 7,
    paddingVertical: 1,
    borderRadius: 999,
    backgroundColor: colors.coral,
    zIndex: 1,
  },
  dateBadge: {
    position: "absolute",
    right: 10,
    top: 8,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: colors.sky,
    zIndex: 1,
  },
  tempBadge: {
    position: "absolute",
    left: 10,
    top: 24,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    backgroundColor: "#FFF7DC",
    zIndex: 1,
  },
  nameTag: {
    alignItems: "center",
    maxWidth: "100%",
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: colors.pillLine,
  },
  nameTagCollected: {
    borderColor: colors.oceanBlue,
    backgroundColor: colors.sky,
  },
  noArt: {
    width: ART_W,
    height: ART_H,
    borderRadius: 10,
    backgroundColor: colors.mist,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  tempPhoto: {
    width: ART_W,
    height: ART_H,
    borderRadius: 10,
  },
  uncollectedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.35)",
    borderRadius: 12,
  },
});
