import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { CatalogSpeciesArtwork } from "../../components/ObservationImages";
import type { Species } from "../../types/species";

type CatalogCollectionSectionProps = {
  species: Species[];
  query: string;
  discoveryCounts: Record<string, number>;
  offline: boolean;
  onQueryChange: (query: string) => void;
  onRetry: () => void;
  onSelectSpecies: (species: Species) => void;
};

export function CatalogCollectionSection({
  species,
  query,
  discoveryCounts,
  offline,
  onQueryChange,
  onRetry,
  onSelectSpecies,
}: CatalogCollectionSectionProps) {
  return (
    <>
      <View style={styles.sectionHeading}>
        <View>
          <Text accessibilityRole="header" style={styles.sectionTitle}>우리 바다 도감</Text>
          <Text style={styles.sectionCaption}>국내 연안에서 만나는 생물</Text>
        </View>
        <Text style={styles.count}>{species.length}종</Text>
      </View>

      <TextInput
        accessibilityLabel="생물 이름 검색"
        placeholder="이름 또는 학명으로 찾아보기"
        placeholderTextColor="#929993"
        value={query}
        onChangeText={onQueryChange}
        style={styles.search}
        returnKeyType="search"
      />

      {offline && (
        <View style={styles.offlineBanner}>
          <Text accessibilityLiveRegion="polite" style={styles.offlineText}>서버에 연결할 수 없어 기본 도감을 보여드려요.</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="도감 서버 연결 다시 시도"
            onPress={onRetry}
          >
            <Text style={styles.retryText}>다시 시도</Text>
          </Pressable>
        </View>
      )}

      {species.length === 0 ? (
        <View style={styles.emptySearch}>
          <Text style={styles.emptyTitle}>찾는 생물이 아직 없어요</Text>
          <Text style={styles.emptyText}>다른 이름으로 검색해 보세요.</Text>
        </View>
      ) : (
        <View style={styles.grid}>
          {species.map((item) => (
            <Pressable
              key={item.id}
              accessibilityRole="button"
              accessibilityLabel={`${item.common_name_ko}, ${item.scientific_name}, ${discoveryCounts[item.id] ? `${discoveryCounts[item.id]}번 만났어요` : "아직 발견 기록이 없어요"}, 상세 보기`}
              onPress={() => onSelectSpecies(item)}
              style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
            >
              <CatalogSpeciesArtwork species={item} placement="thumbnail" />
              <Text style={styles.speciesName}>{item.common_name_ko}</Text>
              <Text style={styles.latinName}>{item.scientific_name}</Text>
              <Text style={styles.discoveryCount}>
                {discoveryCounts[item.id] ? `${discoveryCounts[item.id]}번 만났어요` : "아직 발견 기록이 없어요"}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  sectionHeading: { marginTop: 26, marginBottom: 13, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  sectionTitle: { color: "#203D45", fontSize: 20, fontWeight: "800" },
  sectionCaption: { marginTop: 4, color: "#87918C", fontSize: 11 },
  count: { color: "#548A84", fontSize: 13, fontWeight: "800" },
  search: { height: 46, marginBottom: 14, paddingHorizontal: 14, borderRadius: 14, borderWidth: 1, borderColor: "#EEE9DE", backgroundColor: "#FFFFFF", color: "#203D45", fontSize: 13 },
  offlineBanner: { marginTop: -5, marginBottom: 12, paddingHorizontal: 12, paddingVertical: 9, borderRadius: 12, backgroundColor: "#F2EBDD", flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  offlineText: { flex: 1, color: "#6F7063", fontSize: 11, lineHeight: 16 },
  retryText: { marginTop: 6, color: "#366F70", fontSize: 12, fontWeight: "800", textAlign: "right" },
  emptySearch: { paddingVertical: 34, alignItems: "center" },
  emptyTitle: { color: "#315B5B", fontSize: 15, fontWeight: "800" },
  emptyText: { marginTop: 6, color: "#87918C", fontSize: 12 },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  card: { width: "48%", marginBottom: 13, padding: 9, borderRadius: 17, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#EEE9DE" },
  cardPressed: { opacity: 0.82, transform: [{ scale: 0.985 }] },
  speciesName: { marginTop: 9, color: "#203D45", fontSize: 15, fontWeight: "800" },
  latinName: { marginTop: 3, color: "#87918C", fontSize: 10, fontStyle: "italic" },
  discoveryCount: { marginTop: 7, color: "#548A84", fontSize: 10, fontWeight: "700" },
});
