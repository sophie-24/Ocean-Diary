import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

type AuthModalProps = {
  visible: boolean;
  authReady: boolean;
  email: string;
  code: string;
  codeSent: boolean;
  authenticating: boolean;
  error: string | null;
  onEmailChange: (email: string) => void;
  onCodeChange: (code: string) => void;
  onClose: () => void;
  onSendCode: () => void;
  onVerifyCode: () => void;
  onChangeEmail: () => void;
};

export function AuthModal({
  visible,
  authReady,
  email,
  code,
  codeSent,
  authenticating,
  error,
  onEmailChange,
  onCodeChange,
  onClose,
  onSendCode,
  onVerifyCode,
  onChangeEmail,
}: AuthModalProps) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable accessible={false} style={styles.backdrop} onPress={onClose}>
        <Pressable accessible={false} accessibilityViewIsModal importantForAccessibility="yes" style={styles.sheet} onPress={(event) => event.stopPropagation()}>
          <Text style={styles.eyebrow}>계정</Text>
          <Text accessibilityRole="header" style={styles.title}>이메일로 로그인해요</Text>
          <Text style={styles.description}>발견 기록은 로그인한 계정에 비공개로 저장돼요.</Text>
          <TextInput
            accessibilityLabel="로그인 이메일"
            value={email}
            onChangeText={onEmailChange}
            placeholder="이메일 주소"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!codeSent && !authenticating}
            style={styles.input}
          />
          {codeSent && (
            <>
              <Text style={styles.description}>이메일로 받은 로그인 코드를 입력해 주세요.</Text>
              <TextInput
                accessibilityLabel="이메일 로그인 코드"
                value={code}
                onChangeText={onCodeChange}
                placeholder="로그인 코드"
                keyboardType="number-pad"
                maxLength={8}
                editable={!authenticating}
                style={styles.input}
              />
            </>
          )}
          {!authReady && <Text accessibilityLiveRegion="polite" style={styles.status}>로그인 상태를 확인하고 있어요.</Text>}
          {authenticating && <Text accessibilityLiveRegion="polite" style={styles.status}>로그인 요청을 처리하고 있어요.</Text>}
          {error && <Text accessibilityLiveRegion="assertive" style={styles.error}>{error}</Text>}
          <View style={styles.actions}>
            <Pressable accessibilityRole="button" accessibilityLabel="로그인 닫기" style={styles.cancelButton} disabled={authenticating} onPress={onClose}>
              <Text style={styles.cancelText}>닫기</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={codeSent ? "로그인 코드 확인" : "로그인 코드 받기"}
              style={styles.confirmButton}
              disabled={authenticating}
              onPress={codeSent ? onVerifyCode : onSendCode}
            >
              {authenticating ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.confirmText}>{codeSent ? "로그인" : "코드 받기"}</Text>}
            </Pressable>
          </View>
          {codeSent && (
            <Pressable accessibilityRole="button" accessibilityLabel="이메일 주소 수정" style={styles.changeEmailButton} disabled={authenticating} onPress={onChangeEmail}>
              <Text style={styles.cancelText}>이메일 주소 수정</Text>
            </Pressable>
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
  description: { marginBottom: 13, color: "#536B67", fontSize: 13, lineHeight: 19 },
  input: { height: 46, marginBottom: 14, paddingHorizontal: 14, borderRadius: 14, borderWidth: 1, borderColor: "#EEE9DE", backgroundColor: "#FFFFFF", color: "#203D45", fontSize: 13 },
  status: { marginTop: 9, color: "#71807A", fontSize: 12, lineHeight: 18 },
  error: { marginTop: 10, color: "#A44238", fontSize: 12, lineHeight: 18 },
  actions: { marginTop: 18, flexDirection: "row", gap: 10 },
  cancelButton: { flex: 1, height: 50, borderRadius: 15, backgroundColor: "#EAE6DD", alignItems: "center", justifyContent: "center" },
  cancelText: { color: "#536B67", fontSize: 14, fontWeight: "800" },
  confirmButton: { flex: 1, height: 50, borderRadius: 15, backgroundColor: "#366F70", alignItems: "center", justifyContent: "center" },
  confirmText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" },
  changeEmailButton: { height: 42, marginTop: 8, alignItems: "center", justifyContent: "center" },
});
