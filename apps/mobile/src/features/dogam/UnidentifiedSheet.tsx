import { useMemo, useState } from "react";
import { FlatList, Image, Pressable, StyleSheet, TextInput, View } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import { Critter } from "../../components/Critter";
import { Txt } from "../../components/ui/Txt";
import { SPECIES, type SpeciesEntry } from "../../data/species";
import { colors, shadow } from "../../theme/tokens";

type Props = {
  /** URI of the user's photo that couldn't be identified */
  photoUri: string;
  /** Called when the user picks a species manually */
  onSelect: (species: SpeciesEntry) => void;
  /** Called when the user skips identification */
  onSkip: () => void;
};

/**
 * Sheet shown when AI cannot identify a species from the user's photo.
 * Lets the user search the catalog and pick a species manually, or skip.
 */
export function UnidentifiedSheet({ photoUri, onSelect, onSkip }: Props) {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    if (query.length < 1) return [];
    const q = query.toLowerCase();
    return SPECIES.filter(
      (s) =>
        s.nameKo.toLowerCase().includes(q) ||
        s.nameEn.toLowerCase().includes(q) ||
        s.sciName.toLowerCase().includes(q),
    ).slice(0, 20);
  }, [query]);

  return (
    <View style={styles.root}>
      {/* Photo preview */}
      <View style={styles.photoWrap}>
        <Image source={{ uri: photoUri }} style={styles.photo} resizeMode="cover" />
      </View>

      {/* Message */}
      <View style={styles.msgBox}>
        <Svg width={28} height={28} viewBox="0 0 28 28">
          <Circle cx={14} cy={14} r={12} fill={colors.sky} />
          <Path d="M14 9 V15" stroke={colors.oceanBlue} strokeWidth={2.5} strokeLinecap="round" />
          <Circle cx={14} cy={19} r={1.5} fill={colors.oceanBlue} />
        </Svg>
        <Txt size={15} weight="bold" color={colors.navy} style={{ flex: 1, lineHeight: 21 }}>
          이 친구는 아직 알아보지 못했어요
        </Txt>
      </View>
      <Txt size={13} color={colors.ink2} style={styles.sub}>
        직접 종을 검색해서 선택하거나, 넘어갈 수 있어요.
      </Txt>

      {/* Search */}
      <View style={styles.searchRow}>
        <Svg width={18} height={18} viewBox="0 0 24 24" style={{ marginLeft: 12 }}>
          <Circle cx={11} cy={11} r={6.5} fill="none" stroke={colors.ink3} strokeWidth={2} />
          <Path d="M16 16 L20.5 20.5" stroke={colors.ink3} strokeWidth={2} strokeLinecap="round" />
        </Svg>
        <TextInput
          style={styles.search}
          placeholder="종 이름 검색 (한글, 영어, 학명)"
          placeholderTextColor={colors.ink3}
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
        />
      </View>

      {/* Results */}
      {results.length > 0 ? (
        <FlatList
          data={results}
          keyExtractor={(s) => s.no}
          style={styles.list}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <Pressable
              onPress={() => onSelect(item)}
              accessibilityRole="button"
              accessibilityLabel={`${item.nameKo} 선택`}
              style={({ pressed }) => [styles.resultRow, pressed && { backgroundColor: colors.sky }]}
            >
              {item.art ? (
                <Critter kind={item.art} width={40} height={26} />
              ) : (
                <View style={styles.noArtSmall}>
                  <Txt size={8} color={colors.ink3}>?</Txt>
                </View>
              )}
              <View style={{ flex: 1, gap: 1 }}>
                <Txt size={14} weight="bold" numberOfLines={1}>
                  {item.nameKo}
                </Txt>
                <Txt size={11} color={colors.ink2} numberOfLines={1}>
                  {item.nameEn} · {item.sciName}
                </Txt>
              </View>
            </Pressable>
          )}
        />
      ) : query.length >= 1 ? (
        <View style={styles.empty}>
          <Txt size={13} color={colors.ink3} align="center">
            검색 결과가 없어요.{"\n"}다른 이름으로 검색해 보세요.
          </Txt>
        </View>
      ) : null}

      {/* Skip button */}
      <Pressable accessibilityRole="button" onPress={onSkip} style={styles.skipBtn}>
        <Txt size={14} weight="bold" color={colors.ink2}>
          넘어가기
        </Txt>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { paddingHorizontal: 20, paddingBottom: 24 },
  photoWrap: { alignItems: "center", marginBottom: 16 },
  photo: { width: 120, height: 120, borderRadius: 16, backgroundColor: colors.mist },
  msgBox: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 4 },
  sub: { marginLeft: 38, marginBottom: 16, lineHeight: 18 },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    height: 44,
    borderRadius: 10,
    backgroundColor: colors.ghostBg,
    marginBottom: 8,
  },
  search: {
    flex: 1,
    height: 44,
    paddingHorizontal: 10,
    fontSize: 14,
    color: colors.navy,
  },
  list: { maxHeight: 240 },
  resultRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  noArtSmall: {
    width: 40,
    height: 26,
    borderRadius: 6,
    backgroundColor: colors.mist,
    alignItems: "center",
    justifyContent: "center",
  },
  empty: { paddingVertical: 24 },
  skipBtn: {
    alignSelf: "center",
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginTop: 8,
  },
});
