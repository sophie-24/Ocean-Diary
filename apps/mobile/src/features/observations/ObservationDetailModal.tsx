import { ActivityIndicator, Image, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import type { ObservationCard } from "../../types/observation";
import type { Species } from "../../types/species";

type ObservationDetailModalProps = {
  observation: ObservationCard | null;
  photoUnavailable: boolean;
  refreshingPhoto: boolean;
  editDate: string;
  editRegion: string;
  speciesQuery: string;
  searchingSpecies: boolean;
  speciesResults: Species[];
  editedSpecies: Species | null;
  hasSpeciesEdit: boolean;
  error: string | null;
  saving: boolean;
  deleting: boolean;
  onClose: () => void;
  onRetryPhoto: () => void;
  onPhotoError: (observation: ObservationCard) => void;
  onDateChange: (value: string) => void;
  onRegionChange: (value: string) => void;
  onSpeciesQueryChange: (value: string) => void;
  onSelectSpecies: (species: Species) => void;
  onSelectUnidentified: () => void;
  onResetSpecies: () => void;
  onDelete: () => void;
  onSave: () => void;
};

export function ObservationDetailModal({
  observation,
  photoUnavailable,
  refreshingPhoto,
  editDate,
  editRegion,
  speciesQuery,
  searchingSpecies,
  speciesResults,
  editedSpecies,
  hasSpeciesEdit,
  error,
  saving,
  deleting,
  onClose,
  onRetryPhoto,
  onPhotoError,
  onDateChange,
  onRegionChange,
  onSpeciesQueryChange,
  onSelectSpecies,
  onSelectUnidentified,
  onResetSpecies,
  onDelete,
  onSave,
}: ObservationDetailModalProps) {
  return (
    <Modal visible={observation !== null} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable accessible={false} style={styles.backdrop} onPress={onClose}>
        <Pressable accessible={false} accessibilityViewIsModal importantForAccessibility="yes" style={styles.sheet} onPress={(event) => event.stopPropagation()}>
          {observation && (
            <ScrollView keyboardShouldPersistTaps="handled">
              <View style={styles.header}>
                <View>
                  <Text style={styles.eyebrow}>발견 기록</Text>
                  <Text accessibilityRole="header" style={styles.title}>{observation.species?.common_name_ko ?? "미확인 생물"}</Text>
                </View>
                <Pressable accessibilityRole="button" accessibilityLabel="발견 기록 상세 닫기" onPress={onClose}>
                  <Text style={styles.closeText}>닫기</Text>
                </Pressable>
              </View>
              {photoUnavailable && (
                <View accessibilityLiveRegion="assertive" style={[styles.photo, styles.photoUnavailable]}>
                  <Text style={styles.photoUnavailableText}>사진을 불러오지 못했어요.</Text>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="발견 기록 사진 다시 불러오기"
                    accessibilityState={{ disabled: refreshingPhoto }}
                    disabled={refreshingPhoto}
                    onPress={onRetryPhoto}
                  >
                    {refreshingPhoto
                      ? <ActivityIndicator color="#366F70" />
                      : <Text style={styles.retryText}>사진 다시 불러오기</Text>}
                  </Pressable>
                </View>
              )}
              {!photoUnavailable && (
                <Image
                  key={observation.photo_url}
                  source={{ uri: observation.photo_url }}
                  style={styles.photo}
                  resizeMode="cover"
                  accessible
                  accessibilityLabel={`발견 기록 사진, ${observation.species?.common_name_ko ?? "미확인 생물"}`}
                  onError={() => onPhotoError(observation)}
                />
              )}
              {observation.species && <Text style={styles.scientific}>{observation.species.scientific_name}</Text>}
              <Text accessibilityRole="header" style={styles.subheading}>관찰 날짜</Text>
              <TextInput
                accessibilityLabel="관찰 날짜 수정, YYYY-MM-DD"
                value={editDate}
                onChangeText={onDateChange}
                placeholder="YYYY-MM-DD"
                keyboardType="numbers-and-punctuation"
                maxLength={10}
                style={styles.input}
              />
              <Text accessibilityRole="header" style={styles.subheading}>관찰 지역</Text>
              <Text style={styles.hint}>GPS 좌표는 기록하지 않아요. 넓은 지역명만 직접 입력할 수 있어요.</Text>
              <TextInput accessibilityLabel="관찰 지역 수정" accessibilityHint="GPS 좌표는 기록하지 않습니다. 넓은 지역명만 직접 입력하세요." value={editRegion} onChangeText={onRegionChange} placeholder="예: 제주도 (선택)" maxLength={100} style={styles.input} />
              <Text accessibilityRole="header" style={styles.subheading}>생물 이름 수정</Text>
              <TextInput accessibilityLabel="수정할 생물 검색" value={speciesQuery} onChangeText={onSpeciesQueryChange} placeholder="새 생물 이름 검색" style={styles.input} />
              {searchingSpecies && <Text accessibilityLiveRegion="polite" style={styles.hint}>생물을 찾고 있어요</Text>}
              {!searchingSpecies && speciesResults.slice(0, 4).map((item) => (
                <Pressable
                  key={item.id}
                  accessibilityRole="button"
                  accessibilityLabel={`${item.common_name_ko}, ${item.scientific_name}`}
                  accessibilityState={{ selected: hasSpeciesEdit && editedSpecies?.id === item.id }}
                  style={[styles.speciesOption, hasSpeciesEdit && editedSpecies?.id === item.id && styles.speciesOptionSelected]}
                  onPress={() => onSelectSpecies(item)}
                >
                  <Text style={styles.speciesName}>{item.common_name_ko}</Text>
                  <Text style={styles.scientific}>{item.scientific_name}</Text>
                </Pressable>
              ))}
              {!searchingSpecies && speciesQuery.trim() && speciesResults.length === 0 && (
                <Text style={styles.hint}>검색 결과가 없어요. 기존 종을 유지하거나 미확인으로 바꿀 수 있어요.</Text>
              )}
              {hasSpeciesEdit && (
                <Text style={styles.selectionSummary}>변경할 생물: {editedSpecies?.common_name_ko ?? "미확인 생물"}</Text>
              )}
              {editedSpecies && (
                <Pressable accessibilityRole="button" accessibilityLabel="기록한 생물을 미확인으로 변경" accessibilityState={{ selected: hasSpeciesEdit && editedSpecies === null }} style={styles.unidentifiedButton} onPress={onSelectUnidentified}>
                  <Text style={styles.speciesName}>미확인 생물로 바꾸기</Text>
                </Pressable>
              )}
              {hasSpeciesEdit && (
                <Pressable accessibilityRole="button" accessibilityLabel="종 변경 취소" style={styles.resetButton} onPress={onResetSpecies}>
                  <Text style={styles.cancelText}>종 변경 취소</Text>
                </Pressable>
              )}
              {error && <Text accessibilityLiveRegion="assertive" style={styles.error}>{error}</Text>}
              {saving && <Text accessibilityLiveRegion="polite" style={styles.hint}>발견 기록을 수정하고 있어요.</Text>}
              {deleting && <Text accessibilityLiveRegion="polite" style={styles.hint}>발견 기록을 삭제하고 있어요.</Text>}
              <View style={styles.actions}>
                <Pressable accessibilityRole="button" accessibilityLabel="발견 기록 삭제" style={styles.deleteButton} disabled={deleting || saving} onPress={onDelete}>
                  {deleting ? <ActivityIndicator color="#A44238" /> : <Text style={styles.deleteText}>기록 삭제</Text>}
                </Pressable>
                <Pressable accessibilityRole="button" accessibilityLabel="발견 기록 수정 저장" style={styles.saveButton} disabled={deleting || saving} onPress={onSave}>
                  {saving ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.saveText}>수정 저장</Text>}
                </Pressable>
              </View>
            </ScrollView>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(24, 43, 44, 0.38)" },
  sheet: { maxHeight: "92%", paddingHorizontal: 22, paddingTop: 22, paddingBottom: 25, borderTopLeftRadius: 26, borderTopRightRadius: 26, backgroundColor: "#FBF8F1" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  eyebrow: { color: "#548A84", fontSize: 12, fontWeight: "700" },
  title: { marginTop: 5, marginBottom: 15, color: "#203D45", fontSize: 22, fontWeight: "800" },
  closeText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" },
  photo: { width: "100%", height: 190, borderRadius: 16, backgroundColor: "#EAF2EC" },
  photoUnavailable: { alignItems: "center", justifyContent: "center", padding: 22 },
  photoUnavailableText: { color: "#536B67", fontSize: 13, lineHeight: 20, textAlign: "center" },
  retryText: { marginTop: 6, color: "#366F70", fontSize: 12, fontWeight: "800", textAlign: "right" },
  scientific: { marginTop: 3, color: "#87918C", fontSize: 11, fontStyle: "italic" },
  subheading: { marginTop: 18, marginBottom: 9, color: "#315B5B", fontSize: 14, fontWeight: "800" },
  input: { height: 46, marginBottom: 14, paddingHorizontal: 14, borderRadius: 14, borderWidth: 1, borderColor: "#EEE9DE", backgroundColor: "#FFFFFF", color: "#203D45", fontSize: 13 },
  hint: { marginTop: 9, color: "#71807A", fontSize: 12, lineHeight: 18 },
  speciesOption: { marginBottom: 6, padding: 10, borderRadius: 12, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#EEE9DE" },
  speciesOptionSelected: { borderColor: "#548A84", backgroundColor: "#EAF2EC" },
  speciesName: { color: "#203D45", fontSize: 13, fontWeight: "700" },
  selectionSummary: { marginTop: 12, color: "#315B5B", fontSize: 13, fontWeight: "800" },
  unidentifiedButton: { marginTop: 9, padding: 12, borderRadius: 13, backgroundColor: "#EAE6DD", borderWidth: 1, borderColor: "transparent" },
  resetButton: { height: 42, marginTop: 8, borderRadius: 13, backgroundColor: "#EAE6DD", alignItems: "center", justifyContent: "center" },
  cancelText: { color: "#536B67", fontSize: 14, fontWeight: "800" },
  error: { marginTop: 10, color: "#A44238", fontSize: 12, lineHeight: 18 },
  actions: { marginTop: 18, flexDirection: "row", gap: 10 },
  deleteButton: { flex: 1, height: 50, borderRadius: 15, backgroundColor: "#EAE6DD", alignItems: "center", justifyContent: "center" },
  deleteText: { color: "#A44238", fontSize: 14, fontWeight: "800" },
  saveButton: { flex: 1, height: 50, borderRadius: 15, backgroundColor: "#366F70", alignItems: "center", justifyContent: "center" },
  saveText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" },
});
