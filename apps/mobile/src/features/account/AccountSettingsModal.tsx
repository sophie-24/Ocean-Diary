import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

type AccountSettingsModalProps = {
  visible: boolean;
  email: string | null;
  deleting: boolean;
  deleteRetryWait: number;
  onClose: () => void;
  onSignOut: () => Promise<boolean>;
  onRequestDelete: () => void;
};

export function AccountSettingsModal({
  visible,
  email,
  deleting,
  deleteRetryWait,
  onClose,
  onSignOut,
  onRequestDelete,
}: AccountSettingsModalProps) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable accessible={false} style={styles.backdrop} onPress={() => !deleting && onClose()}>
        <Pressable accessible={false} accessibilityViewIsModal importantForAccessibility="yes" style={styles.sheet} onPress={(event) => event.stopPropagation()}>
          <ScrollView keyboardShouldPersistTaps="handled">
            <Text style={styles.eyebrow}>계정과 개인정보</Text>
            <Text accessibilityRole="header" style={styles.title}>내 기록은 비공개예요</Text>
            <Text style={styles.description}>
              발견 사진과 기록은 본인 계정에만 연결돼요. 사진을 분석할 때 외부 AI가 사용되면 업로드 전에 안내해요.
            </Text>
            <Text style={styles.description}>
              사진을 고른 뒤 기록을 마칠 때까지 앱 임시 공간에 보관돼요. 기기 백업에 포함될 수 있고, 저장·취소·로그아웃 시 앱 사본을 삭제해요.
            </Text>
            <Text style={styles.description}>
              사진의 GPS 등 촬영 위치 정보는 서버에 보관하기 전에 제거해요. 다이빙 지역은 직접 입력한 경우에만 기록돼요.
            </Text>
            <Text style={styles.description}>
              기록에 저장하지 않은 업로드 사진은 7일 안에 자동 정리돼요. 발견 기록을 삭제하면 다른 기록에서 사용 중이지 않은 연결 사진도 함께 삭제돼요.
            </Text>
            <Text style={styles.description}>
              계정을 삭제하면 발견 기록, 식별 기록, 연결된 사진과 로그인 계정 삭제를 요청해요.
            </Text>
            <Text style={styles.email}>{email ?? "로그인된 계정"}</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="로그아웃"
              style={styles.secondaryButton}
              disabled={deleting}
              onPress={() => void onSignOut().then((didSignOut) => {
                if (didSignOut) onClose();
              })}
            >
              <Text style={styles.secondaryButtonText}>로그아웃</Text>
            </Pressable>
            {deleting && <Text accessibilityLiveRegion="polite" style={styles.status}>계정과 모든 기록 삭제를 처리하고 있어요.</Text>}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="계정과 모든 발견 기록 삭제"
              style={styles.deleteButton}
              disabled={deleting || deleteRetryWait > 0}
              onPress={onRequestDelete}
            >
              {deleting
                ? <ActivityIndicator color="#A44238" />
                : <Text style={styles.deleteText}>{deleteRetryWait > 0 ? `${deleteRetryWait}초 후 계정 삭제 재시도` : "계정과 모든 기록 삭제"}</Text>}
            </Pressable>
            <Pressable accessibilityRole="button" accessibilityLabel="계정 설정 닫기" style={styles.secondaryButton} disabled={deleting} onPress={onClose}>
              <Text style={styles.secondaryButtonText}>닫기</Text>
            </Pressable>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(24, 43, 44, 0.38)" },
  sheet: { maxHeight: "85%", paddingHorizontal: 22, paddingTop: 22, paddingBottom: 30, borderTopLeftRadius: 26, borderTopRightRadius: 26, backgroundColor: "#FBF8F1" },
  eyebrow: { color: "#548A84", fontSize: 12, fontWeight: "700" },
  title: { marginTop: 5, marginBottom: 15, color: "#203D45", fontSize: 22, fontWeight: "800" },
  description: { marginBottom: 13, color: "#536B67", fontSize: 13, lineHeight: 19 },
  email: { marginTop: 4, color: "#315B5B", fontSize: 12, fontWeight: "700" },
  status: { marginTop: 9, color: "#71807A", fontSize: 12, lineHeight: 18 },
  secondaryButton: { height: 42, marginTop: 8, alignItems: "center", justifyContent: "center" },
  secondaryButtonText: { color: "#536B67", fontSize: 14, fontWeight: "800" },
  deleteButton: { height: 50, marginTop: 14, borderRadius: 15, backgroundColor: "#F8E8E3", alignItems: "center", justifyContent: "center" },
  deleteText: { color: "#A44238", fontSize: 14, fontWeight: "800" },
});
