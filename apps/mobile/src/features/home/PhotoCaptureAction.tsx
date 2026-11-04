import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";

type PhotoCaptureActionProps = {
  draftAwaitingSignIn: boolean;
  saveRequestStarted: boolean;
  pickingPhoto: boolean;
  uploadingPhoto: boolean;
  savingObservation: boolean;
  draftHydrated: boolean;
  hasSelectedPhoto: boolean;
  onPress: () => void;
};

export function PhotoCaptureAction({
  draftAwaitingSignIn,
  saveRequestStarted,
  pickingPhoto,
  uploadingPhoto,
  savingObservation,
  draftHydrated,
  hasSelectedPhoto,
  onPress,
}: PhotoCaptureActionProps) {
  const busy = pickingPhoto || uploadingPhoto || savingObservation;
  const disabled = busy || (!draftHydrated && !draftAwaitingSignIn);
  const accessibilityLabel = draftAwaitingSignIn
    ? "로그인해 이전 초안 이어가기"
    : saveRequestStarted
      ? "진행 중인 발견 기록 저장 이어하기"
      : uploadingPhoto
        ? "사진을 저장하고 있어요"
        : !draftHydrated
          ? "저장된 초안을 확인하고 있어요"
          : hasSelectedPhoto ? "사진 바꾸기" : "발견 사진 선택";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled, busy: busy || !draftHydrated }}
      onPress={onPress}
      disabled={disabled}
      style={[styles.button, disabled && styles.disabled]}
    >
      {busy || !draftHydrated ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <>
          {!draftAwaitingSignIn && !saveRequestStarted && <Text style={styles.plus}>{hasSelectedPhoto ? "↻" : "＋"}</Text>}
          <Text style={styles.label}>
            {draftAwaitingSignIn
              ? "로그인해 이전 초안 이어가기"
              : saveRequestStarted
                ? "저장 다시 시도하기"
                : hasSelectedPhoto ? "다른 사진 고르기" : "발견 사진 고르기"}
          </Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { marginTop: 8, height: 54, borderRadius: 17, backgroundColor: "#366F70", flexDirection: "row", alignItems: "center", justifyContent: "center" },
  disabled: { opacity: 0.72 },
  plus: { marginRight: 8, color: "#FFFFFF", fontSize: 22, fontWeight: "500" },
  label: { color: "#FFFFFF", fontSize: 15, fontWeight: "800" },
});
