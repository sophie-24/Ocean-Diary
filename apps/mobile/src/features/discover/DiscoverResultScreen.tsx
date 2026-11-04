import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Critter } from "../../components/Critter";
import { CheckIcon, ChevronLeft, PinIcon, SoundOffIcon } from "../../components/icons";
import { Txt } from "../../components/ui/Txt";
import { SPECIES_BY_NO } from "../../data/species";
import { MOCK_RESULT } from "../../mocks/discover";
import { colors } from "../../theme/tokens";
import { discoverStore, useDiscover } from "./discoverStore";

export function DiscoverResultScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { pickedCandidate, selected } = useDiscover();
  const top = MOCK_RESULT.candidates[0];
  const topSpecies = SPECIES_BY_NO[top.no];
  const a = MOCK_RESULT.appearance;

  return (
    <View style={styles.root}>
      {/* Media preview */}
      <View style={styles.media}>
        <View style={[styles.glare, { left: -30 }]} />
        <View style={[styles.glare, { left: 170, width: 60, opacity: 0.75 }]} />
        <Critter kind={top.kind} width={358} height={170} style={{ position: "absolute", left: 16, top: 124 }} />
        <View style={styles.box} />
        <View style={styles.boxLabel}>
          <Txt size={13} weight="black">
            {topSpecies.nameKo} · {top.pct}%
          </Txt>
        </View>
        <SafeAreaView edges={["top"]} style={styles.topBar}>
          <Pressable accessibilityRole="button" accessibilityLabel="뒤로" onPress={() => router.navigate("/discover")} style={styles.glassBtn}>
            <ChevronLeft color={colors.white} />
          </Pressable>
          <View style={styles.glassPill}>
            <Txt size={13} weight="bold" color={colors.white}>
              {selected.length || 1}개 중 1번째 · 영상
            </Txt>
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel="소리 켜기" style={styles.glassBtn}>
            <SoundOffIcon />
          </Pressable>
        </SafeAreaView>
        <View style={styles.scrubber}>
          <View style={styles.scrubLabels}>
            <View style={styles.timeChip}>
              <Txt size={12} weight="bold" color={colors.white}>
                {a.from} – {a.to} 등장
              </Txt>
            </View>
            <View style={styles.timeChip}>
              <Txt size={12} weight="bold" color={colors.white}>
                0:19 / {a.total}
              </Txt>
            </View>
          </View>
          <View style={styles.scrubTrack} accessibilityLabel={`${a.from}부터 ${a.to}까지 생물이 나와요`}>
            <View style={[styles.scrubHit, { left: `${a.startPct}%`, width: `${a.widthPct}%` }]} />
            <View style={[styles.knob, { left: `${a.startPct + a.widthPct * 0.4}%` }]} />
          </View>
        </View>
      </View>

      {/* Candidate sheet */}
      <View style={styles.sheet}>
        <View style={styles.grabber} />
        <ScrollView contentContainerStyle={{ paddingBottom: 12 }}>
          <Txt accessibilityRole="header" size={21} weight="black" style={{ marginTop: 14 }}>
            이 친구가 맞나요?
          </Txt>
          <View style={styles.ctxRow}>
            <PinIcon />
            <Txt size={13} color={colors.ink2} style={{ flex: 1 }}>
              {MOCK_RESULT.context}
            </Txt>
          </View>
          <View accessibilityRole="radiogroup" style={{ gap: 10, marginTop: 14 }}>
            {MOCK_RESULT.candidates.map((c, i) => {
              const s = SPECIES_BY_NO[c.no];
              const on = pickedCandidate === i;
              return (
                <Pressable
                  key={c.no}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: on }}
                  accessibilityLabel={`${i + 1}순위 ${s.nameKo}, 일치도 ${c.pct}퍼센트. ${c.note}`}
                  onPress={() => discoverStore.set({ pickedCandidate: i })}
                  style={[styles.cand, on ? styles.candOn : styles.candOff]}
                >
                  <View style={styles.candArt}>
                    <Critter kind={c.kind} width={70} height={40} />
                  </View>
                  <View style={{ flex: 1, gap: 4 }}>
                    <View style={[styles.row, { gap: 6, alignItems: "baseline" }]}>
                      <Txt size={12} weight="extraBold" color={colors.ink2}>
                        {i + 1}순위
                      </Txt>
                      <Txt size={16} weight="black">
                        {s.nameKo}
                      </Txt>
                    </View>
                    <Txt size={12} color={colors.ink2} style={{ fontStyle: "italic" }}>
                      {s.sciName}
                    </Txt>
                    <View style={[styles.row, { gap: 8 }]}>
                      <View style={styles.track}>
                        <View style={[styles.fill, { width: `${c.pct}%`, backgroundColor: i === 0 ? colors.oceanBlue : "#9BB2D1" }]} />
                      </View>
                      <Txt size={13} weight="black">
                        {c.pct}%
                      </Txt>
                    </View>
                    <Txt size={12} color={c.isNewForMe ? "#A8382A" : colors.ink2}>
                      {c.note}
                    </Txt>
                  </View>
                  <View style={[styles.radio, on ? styles.radioOn : styles.radioOff]} />
                </Pressable>
              );
            })}
          </View>
          <Pressable accessibilityRole="button" style={styles.manual}>
            <Txt size={13} weight="bold" color={colors.oceanBlue} style={{ textDecorationLine: "underline" }}>
              목록에 없어요 · 이름으로 직접 찾기
            </Txt>
          </Pressable>
        </ScrollView>
        <View style={[styles.actions, { paddingBottom: 12 + insets.bottom }]}>
          <Pressable accessibilityRole="button" onPress={() => router.navigate("/discover")} style={styles.noBtn}>
            <Txt size={15} weight="bold">
              아니에요
            </Txt>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={() => router.replace("/discover/collected")} style={styles.yesBtn}>
            <CheckIcon size={18} />
            <Txt size={16} weight="extraBold" color={colors.white}>
              이 생물이 맞아요
            </Txt>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.deepSea },
  row: { flexDirection: "row", alignItems: "center" },
  media: { height: 420, backgroundColor: "#1B4F86", overflow: "hidden" },
  glare: { position: "absolute", top: -60, width: 90, height: 520, backgroundColor: "rgba(255,255,255,0.08)", transform: [{ rotate: "18deg" }] },
  box: { position: "absolute", left: 16, right: 18, top: 120, height: 176, borderWidth: 2.5, borderColor: colors.sunny, borderRadius: 10 },
  boxLabel: { position: "absolute", left: 16, top: 90, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, backgroundColor: colors.sunny },
  topBar: { position: "absolute", left: 0, right: 0, top: 0, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 12 },
  glassBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(9,25,56,0.45)", alignItems: "center", justifyContent: "center" },
  glassPill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, backgroundColor: "rgba(9,25,56,0.45)" },
  scrubber: { position: "absolute", left: 20, right: 20, top: 334, gap: 6 },
  scrubLabels: { flexDirection: "row", justifyContent: "space-between" },
  timeChip: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, backgroundColor: "rgba(9,25,56,0.55)" },
  scrubTrack: { height: 6, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.3)" },
  scrubHit: { position: "absolute", height: 6, borderRadius: 3, backgroundColor: colors.sunny },
  knob: { position: "absolute", top: -5, width: 16, height: 16, marginLeft: -8, borderRadius: 8, backgroundColor: colors.white },
  sheet: { flex: 1, marginTop: -28, paddingTop: 10, paddingHorizontal: 20, backgroundColor: colors.mist, borderTopLeftRadius: 28, borderTopRightRadius: 28 },
  grabber: { alignSelf: "center", width: 40, height: 5, borderRadius: 3, backgroundColor: colors.lineStrong },
  ctxRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
  cand: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: 20, borderWidth: 2 },
  candOn: { backgroundColor: "#EAF3FC", borderColor: colors.oceanBlue },
  candOff: { backgroundColor: colors.white, borderColor: colors.line },
  candArt: { width: 76, height: 60, borderRadius: 14, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, alignItems: "center", justifyContent: "center" },
  track: { flex: 1, height: 6, borderRadius: 3, backgroundColor: colors.track, overflow: "hidden" },
  fill: { height: 6, borderRadius: 3 },
  radio: { width: 22, height: 22, borderRadius: 11, backgroundColor: colors.white },
  radioOn: { borderWidth: 7, borderColor: colors.oceanBlue },
  radioOff: { borderWidth: 2, borderColor: "#A9BEDD" },
  manual: { alignSelf: "center", height: 44, justifyContent: "center", marginTop: 8 },
  actions: { flexDirection: "row", gap: 10, paddingTop: 8 },
  noBtn: { width: 110, height: 54, borderRadius: 18, borderWidth: 1.5, borderColor: colors.lineStrong, backgroundColor: colors.white, alignItems: "center", justifyContent: "center" },
  yesBtn: { flex: 1, height: 54, borderRadius: 18, backgroundColor: colors.oceanBlue, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 },
});
