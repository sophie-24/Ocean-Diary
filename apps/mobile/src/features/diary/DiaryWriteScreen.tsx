import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Switch, TextInput, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ChevronLeft, ChevronRight } from "../../components/icons";
import { Txt } from "../../components/ui/Txt";
import { colors, fonts } from "../../theme/tokens";
import { logStore } from "../log/logStore";
import { Manuscript, manuscriptPages } from "./Manuscript";

export const DIARY_MAX = 500;
const PROMPTS = ["처음 본 생물", "가장 기억나는 순간", "버디와 있었던 일", "다음엔 꼭"];

const formatDate = (iso: string) => {
  const d = new Date(`${iso}T00:00:00`);
  return Number.isNaN(d.getTime()) ? iso : `${d.getMonth() + 1}월 ${d.getDate()}일 (${"일월화수목금토"[d.getDay()]})`;
};

export function DiaryWriteScreen({ logId }: { logId: string }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const log = logStore.find(logId);
  const [text, setText] = useState(log?.diary ?? "");
  const [polish, setPolish] = useState(false);

  const len = Array.from(text).length;
  const pages = manuscriptPages(len);
  const onText = (v: string) => setText(Array.from(v).slice(0, DIARY_MAX).join(""));
  const addPrompt = (p: string) => onText(`${text}${text && !text.endsWith("\n") ? "\n" : ""}${p}: `);

  const finish = (withText: boolean) => {
    if (log) logStore.update(log.id, { diary: withText ? text : log.diary, draft: false, title: withText && text.trim() ? text.trim().split("\n")[0].slice(0, 20) : log.title });
    router.replace({ pathname: "/log/[id]", params: { id: logId } });
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
            2단계 · {log ? `${log.label} 저장됨` : "기록 저장됨"}
          </Txt>
        </View>
        <Pressable accessibilityRole="button" onPress={() => router.navigate("/log")} style={[styles.hit, { width: 64, alignItems: "flex-end" }]}>
          <Txt size={14} weight="bold" color={colors.ink2}>
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
              {[formatDate(log.date), `${log.region} · ${log.point}`].map((m) => (
                <View key={m} style={styles.metaChip}>
                  <Txt size={12} weight="bold" color={colors.ink2}>
                    {m}
                  </Txt>
                </View>
              ))}
            </View>
          ) : null}
          <Txt size={22} weight="black" tracking={-0.02}>
            오늘 바닷속은 어땠나요?
          </Txt>
          <Txt size={14} color={colors.ink2}>
            생각나는 대로 편하게 적어 주세요. 원고지에 옮겨 그림일기로 만들어 드릴게요.
          </Txt>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }} accessibilityLabel="글감 추천">
            {PROMPTS.map((p) => (
              <Pressable key={p} accessibilityRole="button" onPress={() => addPrompt(p)} style={styles.prompt}>
                <Txt size={13} weight="bold" color="#1F4FA8">
                  + {p}
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
              placeholderTextColor="#9AA8C2"
              accessibilityLabel="그림일기 글"
              style={styles.textarea}
              textAlignVertical="top"
            />
            <View style={styles.paperFoot}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Switch value={polish} onValueChange={setPolish} trackColor={{ true: colors.oceanBlue, false: colors.lineStrong }} accessibilityLabel="띄어쓰기·맞춤법만 살짝 다듬기" />
                <Txt size={12} color={colors.ink2}>
                  띄어쓰기·맞춤법만 살짝 다듬기
                </Txt>
              </View>
              <Txt size={12} weight="bold" color={len > 450 ? "#A8382A" : colors.ink2} accessibilityLiveRegion="polite">
                {len} / {DIARY_MAX}
              </Txt>
            </View>
          </View>

          <View style={styles.preview}>
            <View style={{ gap: 2 }}>
              <Txt size={14} weight="extraBold">
                원고지 {pages}쪽으로 옮겨져요
              </Txt>
              <Txt size={12} color={colors.ink2}>
                1쪽엔 그림 칸 + 72자, 다음 쪽부턴 216자씩
              </Txt>
            </View>
            <View style={{ alignItems: "center" }}>
              <Manuscript text={text} rows={3} cell={24} />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={[styles.footer, { paddingBottom: 12 + insets.bottom }]}>
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
            그림일기 만들기
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
  content: { paddingTop: 16, paddingHorizontal: 20, gap: 12 },
  metaRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  metaChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line },
  prompt: { height: 34, paddingHorizontal: 12, borderRadius: 999, backgroundColor: colors.sky, justifyContent: "center" },
  paper: { borderRadius: 20, backgroundColor: "#FFFDF7", borderWidth: 1, borderColor: "#EADFC8", padding: 14, gap: 8 },
  textarea: { minHeight: 220, fontFamily: fonts.diary, fontSize: 20, lineHeight: 30, color: "#2B2B2B" },
  paperFoot: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  preview: { gap: 10, padding: 12, borderRadius: 18, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line },
  footer: { position: "absolute", left: 0, right: 0, bottom: 0, flexDirection: "row", gap: 8, paddingTop: 12, paddingHorizontal: 16, backgroundColor: "rgba(255,255,255,0.97)", borderTopWidth: 1, borderTopColor: colors.line },
  secondary: { width: 112, height: 52, borderRadius: 16, borderWidth: 1.5, borderColor: colors.lineStrong, backgroundColor: colors.white, alignItems: "center", justifyContent: "center" },
  primary: { flex: 1, height: 52, borderRadius: 16, backgroundColor: colors.oceanBlue, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 },
});
