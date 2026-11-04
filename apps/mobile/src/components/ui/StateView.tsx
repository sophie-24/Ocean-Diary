import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";
import { Txt } from "./Txt";
import { errorMessage } from "../../api/client";
import { colors } from "../../theme/tokens";

/** Loading / error / empty placeholder used by API-backed screens. */
export function StateView({
  loading,
  error,
  onRetry,
  empty,
  tone = "light",
}: {
  loading?: boolean;
  error?: unknown;
  onRetry?: () => void;
  empty?: string;
  tone?: "light" | "dark";
}) {
  const fg = tone === "dark" ? colors.white : colors.ink2;
  if (loading) {
    return (
      <View style={styles.box} accessibilityLiveRegion="polite" accessibilityLabel="불러오는 중">
        <ActivityIndicator color={tone === "dark" ? colors.white : colors.oceanBlue} />
      </View>
    );
  }
  if (error) {
    return (
      <View style={styles.box} accessibilityLiveRegion="assertive">
        <Txt size={14} weight="bold" color={fg} align="center">
          {errorMessage(error)}
        </Txt>
        {onRetry ? (
          <Pressable accessibilityRole="button" onPress={onRetry} style={styles.retry}>
            <Txt size={14} weight="extraBold" color={colors.white}>
              다시 시도
            </Txt>
          </Pressable>
        ) : null}
      </View>
    );
  }
  if (empty) {
    return (
      <View style={styles.box}>
        <Txt size={14} color={fg} align="center">
          {empty}
        </Txt>
      </View>
    );
  }
  return null;
}

const styles = StyleSheet.create({
  box: { paddingVertical: 40, paddingHorizontal: 24, alignItems: "center", gap: 12 },
  retry: { height: 44, paddingHorizontal: 18, borderRadius: 14, backgroundColor: colors.oceanBlue, justifyContent: "center" },
});
