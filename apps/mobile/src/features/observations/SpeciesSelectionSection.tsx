import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { CatalogSpeciesArtwork } from "../../components/ObservationImages";
import type { IdentificationCandidate, SelectionSource } from "../../types/identification";
import type { Species } from "../../types/species";

type SpeciesSelectionSectionProps = {
  candidates: IdentificationCandidate[];
  selectedSpecies: Species | null;
  selectionSource: SelectionSource | null;
  searchQuery: string;
  visibleSpecies: Species[];
  searching: boolean;
  selectionLocked: boolean;
  onSearchQueryChange: (query: string) => void;
  onChooseCandidate: (species: Species) => void;
  onChooseSpecies: (species: Species) => void;
  onChooseUnidentified: () => void;
};

const confidenceLabel = (band: IdentificationCandidate["confidence_band"]) => (
  band === "high" ? "가능성이 높아요" : band === "medium" ? "가능성이 있어요" : "후보 중 하나예요"
);

export function SpeciesSelectionSection({
  candidates,
  selectedSpecies,
  selectionSource,
  searchQuery,
  visibleSpecies,
  searching,
  selectionLocked,
  onSearchQueryChange,
  onChooseCandidate,
  onChooseSpecies,
  onChooseUnidentified,
}: SpeciesSelectionSectionProps) {
  return (
    <>
      {candidates.length > 0 && (
        <>
          <Text accessibilityRole="header" style={styles.subheading}>AI가 찾은 후보</Text>
          <Text style={styles.hint}>후보와 가능성 표시는 참고용이며 정답 확률이 아니에요. 사진 속 특징을 살펴보고 직접 확인해 주세요.</Text>
          {candidates.map((candidate) => {
            const isSelected = selectionSource === "ai_confirmed" && selectedSpecies?.id === candidate.species.id;
            return (
            <Pressable
              key={candidate.rank}
              accessibilityRole="button"
              accessibilityLabel={`${candidate.species.common_name_ko}, ${candidate.species.scientific_name}, ${confidenceLabel(candidate.confidence_band)}, 후보 선택`}
              accessibilityState={{ selected: isSelected, disabled: selectionLocked }}
              style={[styles.candidateCard, isSelected && styles.selected]}
              disabled={selectionLocked}
              onPress={() => onChooseCandidate(candidate.species)}
            >
              <CatalogSpeciesArtwork species={candidate.species} placement="candidate" />
              <View style={styles.candidateCopy}>
                <Text style={styles.speciesName}>{candidate.species.common_name_ko}</Text>
                <Text style={styles.scientificName}>{candidate.species.scientific_name}</Text>
                <Text style={styles.confidence}>{confidenceLabel(candidate.confidence_band)}</Text>
              </View>
            </Pressable>
            );
          })}
        </>
      )}

      <Text accessibilityRole="header" style={styles.subheading}>직접 생물 찾기</Text>
      <TextInput
        accessibilityLabel="기록할 생물 검색"
        placeholder="국명 또는 학명으로 검색"
        placeholderTextColor="#929993"
        value={searchQuery}
        onChangeText={onSearchQueryChange}
        style={styles.search}
        returnKeyType="search"
      />
      <View style={styles.manualSpeciesList}>
        {searching && <Text accessibilityLiveRegion="polite" style={styles.hint}>생물을 찾고 있어요</Text>}
        {!searching && visibleSpecies.slice(0, 5).map((species) => {
          const isSelected = selectedSpecies?.id === species.id && selectionSource === "user_selected";
          return (
            <Pressable
              key={species.id}
              accessibilityRole="button"
              accessibilityLabel={`${species.common_name_ko}, ${species.scientific_name}`}
              accessibilityState={{ selected: isSelected, disabled: selectionLocked }}
              style={[styles.manualSpeciesOption, isSelected && styles.selected]}
              disabled={selectionLocked}
              onPress={() => onChooseSpecies(species)}
            >
              <Text style={styles.speciesName}>{species.common_name_ko}</Text>
              <Text style={styles.scientificName}>{species.scientific_name}</Text>
            </Pressable>
          );
        })}
        {!searching && visibleSpecies.length === 0 && <Text style={styles.hint}>검색 결과가 없어요. 미확인으로 기록할 수 있어요.</Text>}
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="종을 확인하지 않고 미확인으로 기록"
        accessibilityState={{ selected: selectionSource === "unidentified", disabled: selectionLocked }}
        style={[styles.unidentifiedButton, selectionSource === "unidentified" && styles.selected]}
        disabled={selectionLocked}
        onPress={onChooseUnidentified}
      >
        <Text style={styles.speciesName}>종을 정하지 않고 미확인으로 기록</Text>
      </Pressable>
    </>
  );
}

const styles = StyleSheet.create({
  subheading: { marginTop: 18, marginBottom: 9, color: "#315B5B", fontSize: 14, fontWeight: "800" },
  hint: { marginTop: 9, color: "#71807A", fontSize: 12, lineHeight: 18 },
  candidateCard: { marginBottom: 8, padding: 12, borderRadius: 13, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E7E2D8", flexDirection: "row", alignItems: "center", gap: 12 },
  selected: { borderColor: "#548A84", backgroundColor: "#EAF2EC" },
  candidateCopy: { flex: 1 },
  speciesName: { color: "#203D45", fontSize: 14, fontWeight: "800" },
  scientificName: { marginTop: 3, color: "#87918C", fontSize: 11, fontStyle: "italic" },
  confidence: { marginTop: 6, color: "#548A84", fontSize: 11, fontWeight: "700" },
  search: { height: 46, marginBottom: 14, paddingHorizontal: 14, borderRadius: 14, borderWidth: 1, borderColor: "#EEE9DE", backgroundColor: "#FFFFFF", color: "#203D45", fontSize: 13 },
  manualSpeciesList: { marginBottom: 8 },
  manualSpeciesOption: { marginBottom: 6, padding: 10, borderRadius: 12, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#EEE9DE" },
  unidentifiedButton: { marginTop: 9, padding: 12, borderRadius: 13, backgroundColor: "#EAE6DD", borderWidth: 1, borderColor: "transparent" },
});
