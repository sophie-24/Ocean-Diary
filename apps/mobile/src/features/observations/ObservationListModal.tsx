import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { ObservationPhotoImage } from "../../components/ObservationImages";
import type { ObservationCard, ObservationFilter } from "../../types/observation";

type ObservationListModalProps = {
  visible: boolean;
  filter: ObservationFilter;
  unidentifiedCount: number;
  observations: ObservationCard[];
  loading: boolean;
  error: string | null;
  cursor: string | null;
  onClose: () => void;
  onFilterChange: (filter: ObservationFilter) => void;
  onOpenObservation: (observation: ObservationCard) => void;
  onRetry: () => void;
  onLoadMore: (cursor: string) => void;
};

export function ObservationListModal({
  visible,
  filter,
  unidentifiedCount,
  observations,
  loading,
  error,
  cursor,
  onClose,
  onFilterChange,
  onOpenObservation,
  onRetry,
  onLoadMore,
}: ObservationListModalProps) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable accessible={false} style={styles.backdrop} onPress={onClose}>
        <Pressable accessible={false} accessibilityViewIsModal importantForAccessibility="yes" style={styles.sheet} onPress={(event) => event.stopPropagation()}>
          <View style={styles.header}>
            <View>
              <Text style={styles.eyebrow}>나의 바다 기록</Text>
              <Text accessibilityRole="header" style={styles.title}>내 발견</Text>
            </View>
            <Pressable accessibilityRole="button" accessibilityLabel="목록 닫기" onPress={onClose}>
              <Text style={styles.closeText}>닫기</Text>
            </Pressable>
          </View>
          <View style={styles.filters}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="전체 발견 보기"
              accessibilityState={{ selected: filter === "all" }}
              style={[styles.filterChip, filter === "all" && styles.filterChipSelected]}
              onPress={() => onFilterChange("all")}
            >
              <Text style={[styles.filterText, filter === "all" && styles.filterTextSelected]}>전체</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`미확인 발견 ${unidentifiedCount}건 보기`}
              accessibilityState={{ selected: filter === "unidentified" }}
              style={[styles.filterChip, filter === "unidentified" && styles.filterChipSelected]}
              onPress={() => onFilterChange("unidentified")}
            >
              <Text style={[styles.filterText, filter === "unidentified" && styles.filterTextSelected]}>
                미확인 {unidentifiedCount}
              </Text>
            </Pressable>
          </View>
          <ScrollView keyboardShouldPersistTaps="handled">
            {observations.map((observation) => (
              <Pressable
                key={observation.id}
                accessibilityRole="button"
                accessibilityLabel={`${observation.species?.common_name_ko ?? "미확인 생물"} 발견, ${new Date(observation.observed_at).toLocaleDateString("ko-KR")}${observation.region_label ? `, ${observation.region_label}` : ""}, 상세 보기`}
                onPress={() => onOpenObservation(observation)}
                style={styles.row}
              >
                <ObservationPhotoImage
                  uri={observation.photo_url}
                  style={styles.rowPhoto}
                  accessibilityLabel={`발견 목록 사진, ${observation.species?.common_name_ko ?? "미확인 생물"}`}
                />
                <View style={styles.rowCopy}>
                  <Text style={styles.speciesName}>{observation.species?.common_name_ko ?? "미확인 생물"}</Text>
                  <Text style={styles.observedDate}>{new Date(observation.observed_at).toLocaleDateString("ko-KR")}{observation.region_label ? ` · ${observation.region_label}` : ""}</Text>
                </View>
                <Text style={styles.chevron}>›</Text>
              </Pressable>
            ))}
            {loading && (
              <View style={styles.loading}>
                <ActivityIndicator color="#548A84" />
                <Text accessibilityLiveRegion="polite" style={styles.loadingText}>발견 기록을 불러오고 있어요.</Text>
              </View>
            )}
            {error && (
              <View style={styles.errorBanner}>
                <Text accessibilityLiveRegion="assertive" style={styles.errorText}>{error}</Text>
                <Pressable accessibilityRole="button" accessibilityLabel="발견 목록 다시 불러오기" disabled={loading} onPress={onRetry}>
                  <Text style={styles.retryText}>{loading ? "불러오는 중" : "다시 시도"}</Text>
                </Pressable>
              </View>
            )}
            {!loading && observations.length === 0 && !error && (
              <Text style={styles.emptyText}>
                {filter === "unidentified" ? "미확인으로 저장한 발견이 없어요." : "아직 저장한 발견이 없어요."}
              </Text>
            )}
            {cursor && (
              <Pressable accessibilityRole="button" accessibilityLabel="발견 기록 더 불러오기" style={styles.loadMoreButton} disabled={loading} onPress={() => onLoadMore(cursor)}>
                <Text style={styles.loadMoreText}>더 불러오기</Text>
              </Pressable>
            )}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(24, 43, 44, 0.38)" },
  sheet: { maxHeight: "82%", paddingHorizontal: 22, paddingTop: 20, paddingBottom: 25, borderTopLeftRadius: 26, borderTopRightRadius: 26, backgroundColor: "#FBF8F1" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  eyebrow: { color: "#548A84", fontSize: 12, fontWeight: "700" },
  title: { marginTop: 5, marginBottom: 15, color: "#203D45", fontSize: 22, fontWeight: "800" },
  closeText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" },
  filters: { flexDirection: "row", gap: 8, marginTop: 14, marginBottom: 10 },
  filterChip: { minHeight: 36, paddingHorizontal: 13, borderRadius: 18, backgroundColor: "#F1EBDD", alignItems: "center", justifyContent: "center" },
  filterChipSelected: { backgroundColor: "#DCE9DD" },
  filterText: { color: "#68716A", fontSize: 12, fontWeight: "700" },
  filterTextSelected: { color: "#315B5B", fontWeight: "800" },
  row: { minHeight: 76, marginBottom: 9, padding: 9, flexDirection: "row", alignItems: "center", borderRadius: 15, backgroundColor: "#FFFFFF" },
  rowPhoto: { width: 58, height: 58, borderRadius: 11, backgroundColor: "#EAF2EC" },
  rowCopy: { flex: 1, marginLeft: 12 },
  speciesName: { marginTop: 8, color: "#203D45", fontSize: 13, fontWeight: "800" },
  observedDate: { marginTop: 4, color: "#87918C", fontSize: 10 },
  chevron: { paddingHorizontal: 8, color: "#548A84", fontSize: 24 },
  loading: { marginVertical: 18, alignItems: "center", gap: 6 },
  loadingText: { marginTop: 9, color: "#71807A", fontSize: 12, lineHeight: 18 },
  errorBanner: { marginBottom: 10, paddingHorizontal: 12, paddingVertical: 9, borderRadius: 12, backgroundColor: "#F2EBDD", flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  errorText: { flex: 1, color: "#6F7063", fontSize: 11, lineHeight: 16 },
  retryText: { marginTop: 6, color: "#366F70", fontSize: 12, fontWeight: "800", textAlign: "right" },
  emptyText: { marginTop: 9, color: "#71807A", fontSize: 12, lineHeight: 18 },
  loadMoreButton: { height: 44, marginVertical: 12, borderRadius: 13, backgroundColor: "#EAE6DD", alignItems: "center", justifyContent: "center" },
  loadMoreText: { color: "#536B67", fontSize: 14, fontWeight: "800" },
});
