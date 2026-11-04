import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { CatalogSpeciesArtwork } from "../../components/ObservationImages";
import type { Species } from "../../types/species";

type DiscoveryDates = { first: string; latest: string };

type SpeciesDetailModalProps = {
  species: Species | null;
  discoveryCount: number;
  discoveryDates: DiscoveryDates | undefined;
  onClose: () => void;
};

export function SpeciesDetailModal({
  species,
  discoveryCount,
  discoveryDates,
  onClose,
}: SpeciesDetailModalProps) {
  return (
    <Modal visible={species !== null} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable accessible={false} style={styles.backdrop} onPress={onClose}>
        <Pressable accessible={false} accessibilityViewIsModal importantForAccessibility="yes" style={styles.sheet} onPress={(event) => event.stopPropagation()}>
          {species && (
            <>
              <CatalogSpeciesArtwork species={species} placement="detail" />
              <Text style={styles.eyebrow}>우리 바다의 생물</Text>
              <Text accessibilityRole="header" style={styles.title}>{species.common_name_ko}</Text>
              <Text style={styles.latin}>{species.scientific_name}</Text>
              <Text style={styles.description}>{species.description_ko}</Text>
              <View style={styles.recordStatus}>
                <Text style={styles.recordStatusText}>
                  {discoveryCount ? `${discoveryCount}번 만난 기록이 있어요` : "아직 만난 기록이 없어요"}
                </Text>
              </View>
              {discoveryDates && (
                <Text style={styles.discoveryDateSummary}>
                  첫 발견 {new Date(discoveryDates.first).toLocaleDateString("ko-KR")}
                  {"  ·  "}
                  최근 {new Date(discoveryDates.latest).toLocaleDateString("ko-KR")}
                </Text>
              )}
              <Pressable accessibilityRole="button" accessibilityLabel="생물 상세 닫기" style={styles.closeButton} onPress={onClose}>
                <Text style={styles.closeText}>닫기</Text>
              </Pressable>
            </>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(24, 43, 44, 0.38)" },
  sheet: { paddingHorizontal: 22, paddingTop: 18, paddingBottom: 30, borderTopLeftRadius: 26, borderTopRightRadius: 26, backgroundColor: "#FBF8F1" },
  eyebrow: { marginTop: 19, color: "#548A84", fontSize: 12, fontWeight: "700" },
  title: { marginTop: 5, color: "#203D45", fontSize: 25, fontWeight: "800" },
  latin: { marginTop: 3, color: "#87918C", fontSize: 12, fontStyle: "italic" },
  description: { marginTop: 13, color: "#536B67", fontSize: 14, lineHeight: 22 },
  recordStatus: { marginTop: 17, padding: 13, borderRadius: 14, backgroundColor: "#EAF2EC" },
  recordStatusText: { color: "#315B5B", fontSize: 12, fontWeight: "700" },
  discoveryDateSummary: { marginTop: 9, color: "#71817A", fontSize: 11 },
  closeButton: { marginTop: 17, height: 48, borderRadius: 14, backgroundColor: "#366F70", alignItems: "center", justifyContent: "center" },
  closeText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" },
});
