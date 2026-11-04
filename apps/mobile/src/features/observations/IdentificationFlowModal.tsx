import { ActivityIndicator, Image, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SpeciesSelectionSection } from "./SpeciesSelectionSection";
import type { IdentificationCandidate, IdentificationStatus, SelectionSource } from "../../types/identification";
import type { PhotoSelection } from "../../types/photo";
import type { Species } from "../../types/species";

type IdentificationFlowModalProps = {
  visible: boolean;
  photo: PhotoSelection | null;
  photoUnavailable: boolean;
  identificationStatus: IdentificationStatus;
  identificationCandidates: IdentificationCandidate[];
  identificationError: string | null;
  identificationRetryWait: number;
  identificationDailyLimitReached: boolean;
  selectedSpecies: Species | null;
  selectionSource: SelectionSource | null;
  manualSpeciesQuery: string;
  visibleManualSpecies: Species[];
  searchingManualSpecies: boolean;
  observedDate: string;
  observedTime: string;
  observedDateError: string | null;
  regionLabel: string;
  saving: boolean;
  saveError: string | null;
  saveNeedsReupload: boolean;
  saveRetryWait: number;
  saveRequestStarted: boolean;
  onClose: () => void;
  onPhotoError: () => void;
  onSearchQueryChange: (query: string) => void;
  onChooseCandidate: (species: Species) => void;
  onChooseSpecies: (species: Species) => void;
  onChooseUnidentified: () => void;
  onObservedDateTimeChange: (date: string, time: string) => void;
  onRegionLabelChange: (region: string) => void;
  onReupload: () => void;
  onRetryIdentification: () => void;
  onSave: () => void;
  onCancel: () => void;
};

export function IdentificationFlowModal({
  visible,
  photo,
  photoUnavailable,
  identificationStatus,
  identificationCandidates,
  identificationError,
  identificationRetryWait,
  identificationDailyLimitReached,
  selectedSpecies,
  selectionSource,
  manualSpeciesQuery,
  visibleManualSpecies,
  searchingManualSpecies,
  observedDate,
  observedTime,
  observedDateError,
  regionLabel,
  saving,
  saveError,
  saveNeedsReupload,
  saveRetryWait,
  saveRequestStarted,
  onClose,
  onPhotoError,
  onSearchQueryChange,
  onChooseCandidate,
  onChooseSpecies,
  onChooseUnidentified,
  onObservedDateTimeChange,
  onRegionLabelChange,
  onReupload,
  onRetryIdentification,
  onSave,
  onCancel,
}: IdentificationFlowModalProps) {
  const selectionLocked = saving || Boolean(saveError);
  const saveDisabled = !selectionSource || saving || Boolean(observedDateError) || saveRetryWait > 0;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable accessible={false} style={styles.backdrop} onPress={onClose}>
        <Pressable accessible={false} accessibilityViewIsModal importantForAccessibility="yes" style={styles.sheet} onPress={(event) => event.stopPropagation()}>
          <ScrollView keyboardShouldPersistTaps="handled">
            <View style={styles.header}>
              <View>
                <Text style={styles.eyebrow}>오늘의 발견</Text>
                <Text style={styles.title}>사진 속 생물을 확인해요</Text>
              </View>
              <Pressable accessibilityRole="button" accessibilityLabel="식별 화면 닫기" onPress={onClose}>
                <Text style={styles.closeText}>닫기</Text>
              </Pressable>
            </View>
            {photo && (photoUnavailable ? (
              <View accessibilityLiveRegion="polite" style={[styles.photo, styles.photoUnavailable]}>
                <Text style={styles.photoUnavailableText}>기기 임시 사진을 표시할 수 없어요. 이미 업로드된 사진으로 기록을 이어갈 수 있어요.</Text>
              </View>
            ) : (
              <Image
                source={{ uri: photo.uri }}
                style={styles.photo}
                resizeMode="cover"
                accessible
                accessibilityLabel="생물 식별을 요청한 사진"
                onError={onPhotoError}
              />
            ))}

            {(identificationStatus === "queued" || identificationStatus === "running") && (
              <View style={styles.status}>
                <ActivityIndicator color="#548A84" />
                <Text accessibilityLiveRegion="polite" style={styles.statusText}>사진에서 생물 후보를 살펴보고 있어요</Text>
              </View>
            )}
            {identificationError && <Text accessibilityLiveRegion="assertive" style={styles.error}>{identificationError}{identificationRetryWait > 0 ? ` (${identificationRetryWait}초 뒤 다시 시도할 수 있어요)` : ""}</Text>}
            {identificationStatus === "succeeded" && identificationCandidates.length === 0 && (
              <Text accessibilityLiveRegion="polite" style={styles.hint}>아직 맞는 후보를 찾지 못했어요. 이름을 검색하거나 미확인으로 기록할 수 있어요.</Text>
            )}
            <SpeciesSelectionSection
              candidates={identificationCandidates}
              selectedSpecies={selectedSpecies}
              selectionSource={selectionSource}
              searchQuery={manualSpeciesQuery}
              visibleSpecies={visibleManualSpecies}
              searching={searchingManualSpecies}
              selectionLocked={selectionLocked}
              onSearchQueryChange={onSearchQueryChange}
              onChooseCandidate={onChooseCandidate}
              onChooseSpecies={onChooseSpecies}
              onChooseUnidentified={onChooseUnidentified}
            />

            <Text style={styles.subheading}>관찰 날짜와 시간</Text>
            <View style={styles.dateTimeRow}>
              <TextInput
                accessibilityLabel="관찰 날짜, YYYY-MM-DD"
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#929993"
                value={observedDate}
                onChangeText={(value) => onObservedDateTimeChange(value, observedTime)}
                editable={!selectionLocked}
                keyboardType="numbers-and-punctuation"
                maxLength={10}
                style={[styles.input, styles.dateInput]}
              />
              <TextInput
                accessibilityLabel="관찰 시간, 24시간 HH:MM"
                placeholder="HH:MM"
                placeholderTextColor="#929993"
                value={observedTime}
                onChangeText={(value) => onObservedDateTimeChange(observedDate, value)}
                editable={!selectionLocked}
                keyboardType="numbers-and-punctuation"
                maxLength={5}
                style={[styles.input, styles.timeInput]}
              />
            </View>
            {observedDateError && <Text accessibilityLiveRegion="polite" style={styles.error}>{observedDateError}</Text>}

            <Text style={styles.subheading}>관찰 지역 (선택)</Text>
            <Text style={styles.locationHint}>GPS 좌표는 기록하지 않아요. 지역을 남기려면 넓은 지역명만 직접 입력해요.</Text>
            <TextInput
              accessibilityLabel="관찰 지역 선택 입력"
              accessibilityHint="GPS 좌표는 기록하지 않습니다. 제주도처럼 넓은 지역명을 직접 입력할 수 있습니다."
              placeholder="예: 제주도"
              placeholderTextColor="#929993"
              value={regionLabel}
              onChangeText={onRegionLabelChange}
              editable={!selectionLocked}
              style={styles.input}
              maxLength={100}
            />
            {selectedSpecies && <Text style={styles.selectionSummary}>선택한 생물: {selectedSpecies.common_name_ko}</Text>}
            {saving && <Text accessibilityLiveRegion="polite" style={styles.hint}>발견 기록을 도감에 저장하고 있어요.</Text>}
            {saveError && <Text accessibilityLiveRegion="assertive" style={styles.error}>{saveError}</Text>}
            {saveNeedsReupload && (
              <Pressable accessibilityRole="button" accessibilityLabel="보관된 사진을 다시 업로드" style={styles.primaryButton} onPress={onReupload}>
                <Text style={styles.primaryText}>사진 다시 올리기</Text>
              </Pressable>
            )}

            <View style={styles.actions}>
              {(identificationStatus === "failed" || identificationStatus === "timed_out") && !identificationDailyLimitReached && (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="다시 식별"
                  accessibilityState={{ disabled: saving || Boolean(saveError) || identificationRetryWait > 0 }}
                  style={styles.secondaryButton}
                  disabled={saving || Boolean(saveError) || identificationRetryWait > 0}
                  onPress={onRetryIdentification}
                >
                  <Text style={styles.secondaryText}>{identificationRetryWait > 0 ? `${identificationRetryWait}초 후 다시 식별` : "다시 식별"}</Text>
                </Pressable>
              )}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={saveRequestStarted ? "같은 내용으로 저장 재시도" : "발견 기록 저장"}
                accessibilityState={{ disabled: saveDisabled }}
                style={[styles.primaryButton, saveDisabled && styles.actionDisabled]}
                disabled={saveDisabled}
                onPress={onSave}
              >
                {saving ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryText}>{saveRetryWait > 0 ? `${saveRetryWait}초 후 저장 재시도` : saveRequestStarted ? "같은 내용으로 저장 재시도" : "도감에 저장"}</Text>}
              </Pressable>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="이 발견 기록 취소"
              accessibilityState={{ disabled: saving || saveRequestStarted }}
              disabled={saving || saveRequestStarted}
              style={styles.cancelAction}
              onPress={onCancel}
            >
              <Text style={styles.secondaryText}>이 기록 취소하기</Text>
            </Pressable>
          </ScrollView>
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
  closeText: { color: "#366F70", fontSize: 14, fontWeight: "800" },
  photo: { width: "100%", height: 160, borderRadius: 16, backgroundColor: "#EAF2EC" },
  photoUnavailable: { alignItems: "center", justifyContent: "center", padding: 22 },
  photoUnavailableText: { color: "#536B67", fontSize: 13, lineHeight: 20, textAlign: "center" },
  status: { marginTop: 14, flexDirection: "row", alignItems: "center", gap: 9 },
  statusText: { color: "#315B5B", fontSize: 13, fontWeight: "700" },
  hint: { marginTop: 9, color: "#71807A", fontSize: 12, lineHeight: 18 },
  subheading: { marginTop: 18, marginBottom: 9, color: "#315B5B", fontSize: 14, fontWeight: "800" },
  dateTimeRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  input: { height: 46, marginBottom: 14, paddingHorizontal: 14, borderRadius: 14, borderWidth: 1, borderColor: "#EEE9DE", backgroundColor: "#FFFFFF", color: "#203D45", fontSize: 13 },
  dateInput: { flex: 1 },
  timeInput: { width: 108 },
  error: { marginTop: 10, color: "#A44238", fontSize: 12, lineHeight: 18 },
  locationHint: { marginTop: -4, marginBottom: 9, color: "#71807A", fontSize: 11, lineHeight: 16 },
  selectionSummary: { marginTop: 12, color: "#315B5B", fontSize: 13, fontWeight: "800" },
  actions: { marginTop: 18, flexDirection: "row", gap: 10 },
  secondaryButton: { flex: 1, height: 50, borderRadius: 15, backgroundColor: "#EAE6DD", alignItems: "center", justifyContent: "center" },
  secondaryText: { color: "#536B67", fontSize: 14, fontWeight: "800" },
  primaryButton: { flex: 1, height: 50, borderRadius: 15, backgroundColor: "#366F70", alignItems: "center", justifyContent: "center" },
  primaryText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" },
  actionDisabled: { opacity: 0.72 },
  cancelAction: { alignSelf: "center", paddingHorizontal: 16, paddingVertical: 10, marginTop: 4 },
});
