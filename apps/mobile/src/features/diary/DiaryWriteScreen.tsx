import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ChevronLeft, ChevronRight } from "../../components/icons";
import { Txt } from "../../components/ui/Txt";
import { colors, fonts } from "../../theme/tokens";
import type { DiveLog } from "../log/logStore";
import { useDiveLog, useUpdateDiveLog } from "../../api/queries";
import { errorMessage } from "../../api/client";
import { StateView } from "../../components/ui/StateView";

export const DIARY_MAX = 500;
const PROMPTS = ["처음 본 생물", "가장 기억나는 순간", "버디와 있었던 일", "다음엔 꼭"];

const formatDate = (iso: string) => {
  const d = new Date(`${iso}T00:00:00`);
  return Number.isNaN(d.getTime()) ? iso : `${d.getMonth() + 1}월 ${d.getDate()}일 (${"일월화수목금토"[d.getDay()]})`;
};

export function DiaryWriteScreen({ logId }: { logId: string }) {
  const { data: log, isLoading, error, refetch } = useDiveLog(logId);
  if (!log) {
    return (
      <SafeAreaView style={[styles.root, { justifyContent: "center" }]}>
        <StateView loading={isLoading} error={error} onRetry={() => void refetch()} empty="기록을 찾을 수 없어요" />
      </SafeAreaView>
    );
  }
  return <DiaryWriteInner key={log.id} log={log} />;
}

function DiaryWriteInner({ log }: { log: DiveLog }) {
  const logId = log.id;
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const update = useUpdateDiveLog();
  const [text, setText] = useState(log?.diary ?? "");

  const len = Array.from(text).length;
  const onText = (v: string) => setText(Array.from(v).slice(0, DIARY_MAX).join(""));
  const addPrompt = (p: string) => onText(`${text}${text && !text.endsWith("\n") ? "\n" : ""}${p}: `);

  const finish = (withText: boolean) => {
    if (update.isPending) return;
    update.mutate(
      { id: logId, patch: withText ? { diary_text: text, is_draft: true } : { is_draft: false } },
      {
        onSuccess: () => {
          if (withText) router.replace({ pathname: "/diary/[logId]/decorate", params: { logId } });
          else router.replace({ pathname: "/log/[id]", params: { id: logId } });
        },
      },
    );
  };

  return (
    <SafeAreaView edges={["top"]} style={styles.root}>
      <View style={styles.header}>
        <Pressable accessibilityRole="button" accessibilityLabel="로그로 돌아가기" onPress={() => router.back()} style={styles.hit}>
          <ChevronLeft />
        </Pressable>
        <View style={{ alignItems: "center" }}>
          <Txt accessibilityRole="header" size={16} weight="black">
            그림일기 쓰기
          </Txt>
          <Txt size={11} color={colors.ink2}>
            {`2단계, ${log.kind === "scuba" ? `다이브 ${log.label}` : log.label} 저장됨`}
          </Txt>
        </View>
        <Pressable accessibilityRole="button" onPress={() => router.navigate("/log")} style={[styles.hit, { width: 64, alignItems: "flex-end" }]}>
          <Txt size={14} weight="medium" color={colors.ink2}>
            나중에
          </Txt>
        </Pressable>
      </View>
      <View style={styles.progress}>
        <View style={[styles.bar, { backgroundColor: colors.oceanBlue }]} />
        <View style={[styles.bar, { backgroundColor: colors.oceanBlue }]} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={[styles.content, { paddingBottom: 100 + insets.bottom }]} keyboardShouldPersistTaps="handled">
          {log ? (
            <View style={styles.metaRow}>
              {[formatDate(log.date), `${log.region}, ${log.point}`, Array.isArray(log.details.weather) ? (log.details.weather as string[]).join(", ") : ""].filter(Boolean).map((m) => (
                <View key={m} style={styles.metaChip}>
                  <Txt size={12} weight="bold">
                    {m}
                  </Txt>
                </View>
              ))}
            </View>
          ) : null}
          <Txt size={21} weight="black" tracking={-0.02} style={{ lineHeight: 28, marginTop: 2 }}>
            오늘 바닷속은 어땠나요?
          </Txt>
          <Txt size={14} color={colors.ink2}>
            생각나는 대로 편하게 적어 주세요. 원고지에 옮겨 그림일기로 만들어 드릴게요.
          </Txt>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }} accessibilityLabel="글감 추천">
            {PROMPTS.map((p) => (
              <Pressable key={p} accessibilityRole="button" onPress={() => addPrompt(p)} style={styles.prompt}>
                <Txt size={13} weight="medium">
                  {`+ ${p}`}
                </Txt>
              </Pressable>
            ))}
          </ScrollView>

          <View style={styles.paper}>
            <TextInput
              value={text}
              onChangeText={onText}
              multiline
              placeholder="예) 오늘은 가토 섬 동굴 다이빙! 입구가 생각보다 좁아서…"
              placeholderTextColor={colors.ink3}
              accessibilityLabel="그림일기 글"
              style={styles.textarea}
              textAlignVertical="top"
            />
            <View style={styles.paperFoot}>
              <Txt size={13} weight="bold" color={len > 450 ? colors.coral : colors.ink2} style={{ fontVariant: ["tabular-nums"] }} accessibilityLiveRegion="polite">
                {len} / {DIARY_MAX}
              </Txt>
            </View>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>

      <View style={[styles.footer, { paddingBottom: 12 + insets.bottom }]}>
        {update.isError ? (
          <Txt size={12} weight="bold" color={colors.coral} style={styles.footerError} accessibilityLiveRegion="assertive">
            {errorMessage(update.error)}
          </Txt>
        ) : null}
        <Pressable accessibilityRole="button" onPress={() => finish(false)} style={styles.secondary}>
          <Txt size={14} weight="bold">
            글 없이 저장
          </Txt>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => finish(true)}
          style={[styles.primary, !text.trim() && { opacity: 0.5 }]}
          disabled={!text.trim()}
          accessibilityState={{ disabled: !text.trim() }}
        >
          <Txt size={15} weight="black" color={colors.white}>
            {update.isPending ? "저장 중…" : "그림일기 만들기"}
          </Txt>
          <ChevronRight color={colors.white} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.mist },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 8 },
  hit: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  progress: { flexDirection: "row", gap: 6, paddingTop: 8, paddingHorizontal: 16 },
  bar: { flex: 1, height: 4, borderRadius: 2 },
  content: { paddingTop: 16, paddingHorizontal: 16, gap: 12 },
  metaRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  metaChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 4, backgroundColor: colors.white },
  prompt: { height: 34, paddingHorizontal: 12, borderRadius: 999, backgroundColor: colors.white, borderWidth: 1.5, borderColor: colors.line, justifyContent: "center" },
  paper: { borderRadius: 12, backgroundColor: colors.white, borderWidth: 1.5, borderColor: colors.oceanBlue, paddingTop: 16, paddingHorizontal: 16, paddingBottom: 12, gap: 8 },
  textarea: { minHeight: 220, fontFamily: fonts.regular, fontSize: 16, lineHeight: 29, color: colors.navy, padding: 0 },
  paperFoot: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.track },
  footerError: { position: "absolute", left: 16, right: 16, top: -22 },
  footer: { position: "absolute", left: 0, right: 0, bottom: 0, flexDirection: "row", gap: 8, paddingTop: 12, paddingHorizontal: 16, backgroundColor: "rgba(255,255,255,0.97)", borderTopWidth: 1, borderTopColor: colors.line },
  secondary: { width: 110, height: 52, borderRadius: 10, backgroundColor: colors.white, alignItems: "center", justifyContent: "center" },
  primary: { flex: 1, height: 52, borderRadius: 10, backgroundColor: colors.oceanBlue, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 },
});
