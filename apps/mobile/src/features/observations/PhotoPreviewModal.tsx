import { ActivityIndicator, Image, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import type { ClientConfig } from "../../types/clientConfig";
import type { PhotoSelection } from "../../types/photo";

type PhotoPreviewModalProps = {
  visible: boolean;
  photo: PhotoSelection | null;
  unavailable: boolean;
  uploadedMediaId: string | null;
  uploading: boolean;
  uploadError: string | null;
  clientConfig: ClientConfig | null;
  clientConfigOutdated: boolean;
  loadingClientConfig: boolean;
  uploadRetryWait: number;
  saveInProgress: boolean;
  saveRequestStarted: boolean;
  onDismiss: () => void;
  onReplacePhoto: () => void;
  onPhotoError: () => void;
  onRetryClientConfig: () => void;
  onUpload: () => void;
  onCancelDraft: () => void;
};

export function PhotoPreviewModal({
  visible,
  photo,
  unavailable,
  uploadedMediaId,
  uploading,
  uploadError,
  clientConfig,
  clientConfigOutdated,
  loadingClientConfig,
  uploadRetryWait,
  saveInProgress,
  saveRequestStarted,
  onDismiss,
  onReplacePhoto,
  onPhotoError,
  onRetryClientConfig,
  onUpload,
  onCancelDraft,
}: PhotoPreviewModalProps) {
  return (
    <Modal visible={visible && photo !== null} transparent animationType="slide" onRequestClose={onDismiss}>
      <Pressable accessible={false} style={styles.backdrop} onPress={onDismiss}>
        <Pressable accessible={false} accessibilityViewIsModal importantForAccessibility="yes" style={styles.sheet} onPress={(event) => event.stopPropagation()}>
          {photo && (
            <>
              <Text style={styles.eyebrow}>오늘의 발견</Text>
              <Text accessibilityRole="header" style={styles.title}>{uploadedMediaId ? "사진 업로드가 완료됐어요" : "이 사진으로 계속할까요?"}</Text>
              {unavailable ? (
                <View accessibilityLiveRegion="assertive" style={[styles.photo, styles.photoUnavailable]}>
                  <Text style={styles.photoUnavailableText}>
                    {uploadedMediaId
                      ? "기기 임시 사진을 읽을 수 없지만, 이미 업로드된 사진으로 기록을 이어갈 수 있어요."
                      : "기기 임시 공간에서 사진을 읽을 수 없어요. 다시 선택해 주세요."}
                  </Text>
                </View>
              ) : (
                <Image
                  source={{ uri: photo.uri }}
                  style={styles.photo}
                  resizeMode="contain"
                  accessible
                  accessibilityLabel="기록하려는 발견 사진"
                  onError={onPhotoError}
                />
              )}
              <Text style={styles.metadata}>
                {photo.width} × {photo.height}
                {photo.fileSize ? ` · ${(photo.fileSize / 1024 / 1024).toFixed(1)} MiB` : ""}
              </Text>
              <Text style={styles.formatHint}>JPEG 또는 PNG · 최대 15 MiB</Text>
              {uploading && <Text accessibilityLiveRegion="polite" style={styles.status}>사진을 안전하게 저장하고 있어요.</Text>}
              {uploadError && <Text accessibilityLiveRegion="assertive" style={styles.error}>{uploadError}</Text>}
              {!uploadedMediaId && (
                <>
                  <Text style={styles.privacyNote}>
                    {clientConfig?.external_ai_processing
                      ? `위치 정보를 제거한 뒤 생물 식별을 위해 ${clientConfig.external_ai_provider === "openai" ? "OpenAI" : "외부 AI 서비스"}에 사진을 보내 분석해요. 발견 기록은 비공개로 저장돼요.`
                      : clientConfig
                        ? "사진에서 위치 정보 등 불필요한 정보를 제거해 비공개로 저장하고, 외부 AI에는 보내지 않아요. 현재 설정에서는 AI 후보를 만들지 않으므로 직접 생물을 검색하거나 미확인으로 기록할 수 있어요."
                        : clientConfigOutdated
                          ? "사진 분석 안내가 업데이트됐어요. 새 안내가 포함된 앱 버전으로 업데이트한 뒤 사진을 올려 주세요."
                          : loadingClientConfig
                            ? "사진 분석 방식을 확인하고 있어요."
                            : "사진 분석 방식을 확인할 수 없어요. 확인한 뒤 업로드할 수 있어요."}
                  </Text>
                  {!clientConfig && !loadingClientConfig && !clientConfigOutdated && (
                    <Pressable accessibilityRole="button" accessibilityLabel="사진 분석 방식 다시 확인" onPress={onRetryClientConfig}>
                      <Text style={styles.retryText}>분석 방식 다시 확인</Text>
                    </Pressable>
                  )}
                </>
              )}
              <View style={styles.actions}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={uploadedMediaId ? "업로드 화면 닫기" : "사진 다시 선택"}
                  style={styles.cancelButton}
                  disabled={uploading}
                  onPress={uploadedMediaId ? onDismiss : onReplacePhoto}
                >
                  <Text style={styles.cancelText}>{uploadedMediaId ? "닫기" : "다시 선택"}</Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={unavailable
                    ? "기기에서 사진을 읽을 수 없어 사진을 다시 선택해야 함"
                    : clientConfig?.external_ai_processing
                      ? `${clientConfig.external_ai_provider === "openai" ? "OpenAI" : "외부 AI"} 분석에 동의하고 사진 업로드`
                      : "사진 업로드"}
                  style={[styles.confirmButton, (uploading || unavailable || !clientConfig || uploadRetryWait > 0) && styles.disabled]}
                  disabled={uploading || unavailable || Boolean(uploadedMediaId) || !clientConfig || uploadRetryWait > 0}
                  onPress={onUpload}
                >
                  {uploading
                    ? <ActivityIndicator color="#FFFFFF" />
                    : <Text style={styles.confirmText}>
                      {uploadedMediaId
                        ? "업로드 완료"
                        : unavailable
                          ? "다시 선택 필요"
                          : uploadRetryWait > 0
                            ? `${uploadRetryWait}초 후 업로드 재시도`
                            : clientConfig?.external_ai_processing
                              ? "안내에 동의하고 업로드"
                              : "사진 업로드"}
                    </Text>}
                </Pressable>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="이 발견 기록 취소"
                accessibilityState={{ disabled: uploading || saveInProgress || saveRequestStarted }}
                disabled={uploading || saveInProgress || saveRequestStarted}
                style={styles.discardAction}
                onPress={onCancelDraft}
              >
                <Text style={styles.cancelText}>이 기록 취소하기</Text>
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
  sheet: { paddingHorizontal: 22, paddingTop: 22, paddingBottom: 30, borderTopLeftRadius: 26, borderTopRightRadius: 26, backgroundColor: "#FBF8F1" },
  eyebrow: { color: "#548A84", fontSize: 12, fontWeight: "700" },
  title: { marginTop: 5, marginBottom: 15, color: "#203D45", fontSize: 22, fontWeight: "800" },
  photo: { width: "100%", height: 300, borderRadius: 18, backgroundColor: "#EAF2EC" },
  photoUnavailable: { alignItems: "center", justifyContent: "center", padding: 22 },
  photoUnavailableText: { color: "#536B67", fontSize: 13, lineHeight: 20, textAlign: "center" },
  metadata: { marginTop: 9, color: "#87918C", fontSize: 11, textAlign: "right" },
  formatHint: { marginTop: 6, color: "#71807A", fontSize: 11, textAlign: "right" },
  status: { marginTop: 9, color: "#71807A", fontSize: 12, lineHeight: 18 },
  error: { marginTop: 10, color: "#A44238", fontSize: 12, lineHeight: 18 },
  privacyNote: { marginTop: 10, color: "#71807A", fontSize: 11, lineHeight: 16 },
  retryText: { marginTop: 6, color: "#366F70", fontSize: 12, fontWeight: "800", textAlign: "right" },
  actions: { marginTop: 18, flexDirection: "row", gap: 10 },
  cancelButton: { flex: 1, height: 50, borderRadius: 15, backgroundColor: "#EAE6DD", alignItems: "center", justifyContent: "center" },
  cancelText: { color: "#536B67", fontSize: 14, fontWeight: "800" },
  confirmButton: { flex: 1, height: 50, borderRadius: 15, backgroundColor: "#366F70", alignItems: "center", justifyContent: "center" },
  confirmText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" },
  disabled: { opacity: 0.72 },
  discardAction: { alignSelf: "center", paddingHorizontal: 16, paddingVertical: 10, marginTop: 4 },
});
