import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { ObservationPhotoImage } from "../../components/ObservationImages";
import type { ObservationCard, ObservationSummary } from "../../types/observation";

type ObservationSavedModalProps = {
  observation: ObservationCard | null;
  speciesSummary: ObservationSummary | null;
  onOpenCollection: () => void;
  onAddAnother: () => void;
};

export function ObservationSavedModal({
  observation,
  speciesSummary,
  onOpenCollection,
  onAddAnother,
}: ObservationSavedModalProps) {
  const close = onOpenCollection;

  return (
    <Modal visible={observation !== null} transparent animationType="fade" onRequestClose={close}>
      <View style={styles.backdrop}>
        <View accessibilityViewIsModal importantForAccessibility="yes" style={styles.sheet}>
          {observation && (
            <>
              <Text style={styles.eyebrow}>OCEAN DIARY · 오늘의 발견</Text>
              <View style={styles.storybookCard}>
                <ObservationPhotoImage
                  uri={observation.photo_url}
                  style={styles.photo}
                  accessible
                  accessibilityLabel={`저장된 발견 사진, ${observation.species?.common_name_ko ?? "미확인 생물"}`}
                />
                <View style={styles.storybookCopy}>
                  <Text style={styles.cardLabel}>나의 바닷속 기록</Text>
                  <Text style={styles.speciesName}>{observation.species?.common_name_ko ?? "미확인 생물"}</Text>
                  {observation.species && <Text style={styles.scientificName}>{observation.species.scientific_name}</Text>}
                  {observation.species && <Text style={styles.description}>{observation.species.description_ko}</Text>}
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {speciesSummary?.is_new_species_for_user
                        ? "도감에 새로 담긴 종이에요"
                        : speciesSummary
                          ? `${speciesSummary.discovery_count}번째 만남이에요`
                          : "미확인 발견을 기록했어요"}
                    </Text>
                  </View>
                  <Text style={styles.date}>{new Date(observation.observed_at).toLocaleDateString("ko-KR")}{observation.region_label ? ` · ${observation.region_label}` : ""}</Text>
                </View>
              </View>
              <Text accessibilityRole="header" style={styles.title}>도감에 담았어요</Text>
              <Text style={styles.descriptionText}>오늘 만난 바다의 한 장면이 나만의 도감에 남았어요.</Text>
              <View style={styles.actions}>
                <Pressable accessibilityRole="button" accessibilityLabel="도감 보기" style={styles.secondaryButton} onPress={onOpenCollection}>
                  <Text style={styles.secondaryText}>도감 보기</Text>
                </Pressable>
                <Pressable accessibilityRole="button" accessibilityLabel="발견 기록을 하나 더 추가" style={styles.primaryButton} onPress={onAddAnother}>
                  <Text style={styles.primaryText}>한 번 더 기록</Text>
                </Pressable>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: "center", paddingHorizontal: 22, backgroundColor: "rgba(24, 43, 44, 0.52)" },
  sheet: { padding: 18, borderRadius: 25, backgroundColor: "#FBF8F1" },
  eyebrow: { marginBottom: 12, color: "#548A84", fontSize: 11, fontWeight: "800", letterSpacing: 0.4, textAlign: "center" },
  storybookCard: { overflow: "hidden", borderRadius: 19, backgroundColor: "#F0E6D3", borderWidth: 1, borderColor: "#E2D5BE" },
  photo: { width: "100%", height: 190, backgroundColor: "#D8E7E3" },
  storybookCopy: { padding: 16 },
  cardLabel: { color: "#64827A", fontSize: 10, fontWeight: "800", letterSpacing: 0.5 },
  speciesName: { marginTop: 5, color: "#263F43", fontSize: 24, fontWeight: "800" },
  scientificName: { marginTop: 3, color: "#7D8980", fontSize: 11, fontStyle: "italic" },
  description: { marginTop: 9, color: "#526B64", fontSize: 12, lineHeight: 18 },
  badge: { alignSelf: "flex-start", marginTop: 12, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 12, backgroundColor: "#DCE9DD" },
  badgeText: { color: "#315B5B", fontSize: 11, fontWeight: "800" },
  date: { marginTop: 10, color: "#87918C", fontSize: 10 },
  title: { marginTop: 16, color: "#203D45", fontSize: 19, fontWeight: "800", textAlign: "center" },
  descriptionText: { marginTop: 8, marginBottom: 4, color: "#536B67", fontSize: 13, lineHeight: 19, textAlign: "center" },
  actions: { marginTop: 18, flexDirection: "row", gap: 10 },
  secondaryButton: { flex: 1, height: 50, borderRadius: 15, backgroundColor: "#EAE6DD", alignItems: "center", justifyContent: "center" },
  secondaryText: { color: "#536B67", fontSize: 14, fontWeight: "800" },
  primaryButton: { flex: 1, height: 50, borderRadius: 15, backgroundColor: "#366F70", alignItems: "center", justifyContent: "center" },
  primaryText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" },
});
