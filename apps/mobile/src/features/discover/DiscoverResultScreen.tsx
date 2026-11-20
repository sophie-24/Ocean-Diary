import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Critter } from "../../components/Critter";
import { CheckIcon, ChevronLeft, PinIcon, SearchIcon } from "../../components/icons";
import { Txt } from "../../components/ui/Txt";
import { isCritterKind } from "../../data/illustrations";
import { errorMessage } from "../../api/client";
import { localDate, saveObservation, searchSpecies } from "../../api/discover";
import { keys, useCollection, useDiveLogs } from "../../api/queries";
import type { ApiSpecies } from "../../api/types";
import { colors, fonts } from "../../theme/tokens";
import { discoverStore, matchLog, useDiscover } from "./discoverStore";
import { LogPickerSheet } from "./LogPickerSheet";

const BAND: Record<string, { label: string; w: number }> = {
  high: { label: "높음", w: 92 },
  medium: { label: "보통", w: 58 },
  low: { label: "낮음", w: 26 },
};

function SpeciesArt({ sp, w, h }: { sp: ApiSpecies; w: number; h: number }) {
  return sp.art_key && isCritterKind(sp.art_key) ? (
    <Critter kind={sp.art_key} width={w} height={h} />
  ) : (
    <Txt size={11} weight="bold" color={colors.ink3}>
      {sp.group_ko ?? "그림 준비 중"}
    </Txt>
  );
}

export function DiscoverResultScreen() {
  const router = useRouter();
  const qc = useQueryClient();
  const insets = useSafeAreaInsets();
  const { pickedCandidate, selected, current, work, manual, logChoice } = useDiscover();
  const [picker, setPicker] = useState(false);
  const photo = discoverStore.currentPhoto();
  const id = selected[current];
  const w = id ? work[id] : undefined;
  const candidates = useMemo(() => w?.candidates ?? [], [w]);
  const { data: collection } = useCollection();
  const { data: logData } = useDiveLogs();
  const [searchOpen, setSearchOpen] = useState(candidates.length === 0);
  const [q, setQ] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const search = useQuery({ queryKey: ["species-search", q.trim()], queryFn: () => searchSpecies(q.trim()), enabled: q.trim().length >= 1 });

  const day = photo?.takenAt ? localDate(photo.takenAt) : null;
  const match = matchLog(photo, logData?.logs, logChoice);
  const log = match.log;
  const context = [day?.replace(/-/g, "."), log ? `${log.region} ${log.point}` : null, log ? `로그 ${log.label}에 연결` : "로그 연결 안 함"]
    .filter(Boolean)
    .join(" · ");
  const chosen: ApiSpecies | null = manual ?? candidates[pickedCandidate]?.species ?? null;
  const met = (sp: ApiSpecies) => (sp.catalog_no ? collection?.get(sp.catalog_no) : undefined);

  const save = async (unidentified = false) => {
    if (!photo || !w?.mediaId || (!unidentified && !chosen)) return;
    setSaving(true);
    setError(null);
    try {
      const res = await saveObservation(
        {
          media_id: w.mediaId,
          species_id: unidentified ? null : chosen!.id,
          identification_job_id: !unidentified && !manual ? (w.jobId ?? null) : null,
          identified_by: unidentified ? "unidentified" : manual ? "user_selected" : "ai_confirmed",
          observed_at: photo.takenAt ?? new Date().toISOString(),
          region_label: log?.region ?? null,
          dive_log_id: log?.id ?? null,
        },
        w.saveKey,
      );
      discoverStore.patchWork(id, { saved: { ...res, species: unidentified ? null : chosen } });
      for (const k of [keys.collection, keys.summary, keys.logs, keys.places, ["observations"]]) void qc.invalidateQueries({ queryKey: k });
      router.replace("/discover/collected");
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const top = candidates[0];

  return (
    <View style={styles.root}>
      {/* Photo preview */}
      <View style={styles.media}>
        {photo ? <Image source={{ uri: photo.uri }} style={StyleSheet.absoluteFill} contentFit="cover" /> : null}
        {top ? (
          <View style={styles.boxLabel}>
            <Txt size={13} weight="black">
              {top.species.common_name_ko} · 일치도 {BAND[top.confidence_band]?.label ?? "—"}
            </Txt>
          </View>
        ) : null}
        <SafeAreaView edges={["top"]} style={styles.topBar}>
          <Pressable accessibilityRole="button" accessibilityLabel="사진 고르기로 돌아가기" onPress={() => router.navigate("/discover")} style={styles.glassBtn}>
            <ChevronLeft color={colors.white} />
          </Pressable>
          <View style={styles.glassPill}>
            <Txt size={13} weight="bold" color={colors.white}>
              {selected.length || 1}개 중 {current + 1}번째 · 사진
            </Txt>
          </View>
          <View style={{ width: 44 }} />
        </SafeAreaView>
      </View>

      {picker && logData ? (
        <LogPickerSheet
          date={day}
          logs={logData.logs}
          selectedId={log?.id ?? null}
          onPick={(logId) => {
            if (day) discoverStore.chooseLog(day, logId);
            setPicker(false);
          }}
          onClose={() => setPicker(false)}
        />
      ) : null}

      {/* Candidate sheet */}
      <View style={styles.sheet}>
        <View style={styles.grabber} />
        <ScrollView contentContainerStyle={{ paddingBottom: 12 }} keyboardShouldPersistTaps="handled">
          <Txt accessibilityRole="header" size={21} weight="black" style={{ marginTop: 14 }}>
            {candidates.length ? "이 친구가 맞나요?" : "AI가 확실한 후보를 찾지 못했어요"}
          </Txt>
          <View style={styles.ctxRow}>
            <PinIcon />
            <Txt size={13} color={colors.ink2} style={{ flex: 1 }}>
              {context || "촬영 날짜를 알 수 없는 사진"}
              {match.guessed ? " (시간으로 추정)" : ""}
            </Txt>
            {logData?.logs.length && day ? (
              <Pressable accessibilityRole="button" accessibilityLabel="연결할 로그 바꾸기" onPress={() => setPicker(true)} hitSlop={8}>
                <Txt size={13} weight="bold" color={colors.oceanBlue}>
                  바꾸기
                </Txt>
              </Pressable>
            ) : null}
          </View>
          <View accessibilityRole="radiogroup" style={{ gap: 10, marginTop: 14 }}>
            {candidates.map((c, i) => {
              const sp = c.species;
              const on = !manual && pickedCandidate === i;
              const band = BAND[c.confidence_band] ?? BAND.low;
              const mark = met(sp);
              const note = mark ? `도감에 있는 친구 · ${mark.count}번 만났어요` : "도감에 없는 친구예요 · 첫 만남이 돼요";
              return (
                <Pressable
                  key={sp.id}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: on }}
                  accessibilityLabel={`${i + 1}순위 ${sp.common_name_ko}, 일치도 ${band.label}. ${note}`}
                  onPress={() => discoverStore.set({ pickedCandidate: i, manual: null })}
                  style={[styles.cand, on ? styles.candOn : styles.candOff]}
                >
                  <View style={styles.candArt}>
                    <SpeciesArt sp={sp} w={70} h={40} />
                  </View>
                  <View style={{ flex: 1, gap: 4 }}>
                    <View style={[styles.row, { gap: 6, alignItems: "baseline" }]}>
                      <Txt size={12} weight="extraBold" color={colors.ink2}>
                        {i + 1}순위
                      </Txt>
                      <Txt size={16} weight="black">
                        {sp.common_name_ko}
                      </Txt>
                    </View>
                    <Txt size={12} color={colors.ink2} style={{ fontStyle: "italic" }}>
                      {sp.scientific_name}
                    </Txt>
                    <View style={[styles.row, { gap: 8 }]}>
                      <View style={styles.track}>
                        <View style={[styles.fill, { width: `${band.w}%`, backgroundColor: i === 0 ? colors.oceanBlue : "#9BB2D1" }]} />
                      </View>
                      <Txt size={13} weight="black">
                        {band.label}
                      </Txt>
                    </View>
                    <Txt size={12} color={mark ? colors.ink2 : "#DC2626"}>
                      {note}
                    </Txt>
                  </View>
                  <View style={[styles.radio, on ? styles.radioOn : styles.radioOff]} />
                </Pressable>
              );
            })}
            {manual ? (
              <View accessibilityRole="radio" accessibilityState={{ checked: true }} style={[styles.cand, styles.candOn]}>
                <View style={styles.candArt}>
                  <SpeciesArt sp={manual} w={70} h={40} />
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <Txt size={12} weight="extraBold" color={colors.ink2}>
                    직접 고른 친구
                  </Txt>
                  <Txt size={16} weight="black">
                    {manual.common_name_ko}
                  </Txt>
                  <Txt size={12} color={colors.ink2} style={{ fontStyle: "italic" }}>
                    {manual.scientific_name}
                  </Txt>
                </View>
                <View style={[styles.radio, styles.radioOn]} />
              </View>
            ) : null}
          </View>

          {searchOpen ? (
            <View style={styles.searchBox}>
              <View style={styles.searchRow}>
                <SearchIcon size={18} color={colors.ink2} />
                <TextInput
                  value={q}
                  onChangeText={setQ}
                  placeholder="생물 이름 (예: 만다린피쉬)"
                  placeholderTextColor={colors.ink3}
                  accessibilityLabel="생물 이름으로 찾기"
                  autoFocus={candidates.length > 0}
                  style={styles.searchInput}
                  returnKeyType="search"
                />
              </View>
              {(search.data?.items ?? []).slice(0, 8).map((sp) => (
                <Pressable
                  key={sp.id}
                  accessibilityRole="button"
                  onPress={() => {
                    discoverStore.set({ manual: sp });
                    setSearchOpen(false);
                    setQ("");
                  }}
                  style={styles.searchItem}
                >
                  <Txt size={15} weight="bold">
                    {sp.common_name_ko}
                  </Txt>
                  <Txt size={12} color={colors.ink2} style={{ fontStyle: "italic" }}>
                    {sp.scientific_name}
                  </Txt>
                </Pressable>
              ))}
              {q.trim() && search.data && search.data.items.length === 0 ? (
                <Txt size={13} color={colors.ink2} style={{ paddingVertical: 8 }}>
                  도감에서 찾지 못했어요. 다른 이름으로 찾아보세요.
                </Txt>
              ) : null}
            </View>
          ) : (
            <Pressable accessibilityRole="button" onPress={() => setSearchOpen(true)} style={styles.manual}>
              <Txt size={13} weight="bold" color={colors.oceanBlue} style={{ textDecorationLine: "underline" }}>
                목록에 없어요 · 이름으로 직접 찾기
              </Txt>
            </Pressable>
          )}
          <Pressable accessibilityRole="button" disabled={saving} onPress={() => void save(true)} style={styles.manual}>
            <Txt size={13} weight="bold" color={colors.ink2}>
              이름은 모르지만 사진만 기록할게요
            </Txt>
          </Pressable>
          {error ? (
            <Txt size={13} color={colors.coral} align="center">
              {error}
            </Txt>
          ) : null}
        </ScrollView>
        <View style={[styles.actions, { paddingBottom: 12 + insets.bottom }]}>
          <Pressable accessibilityRole="button" onPress={() => setSearchOpen(true)} style={styles.noBtn}>
            <Txt size={15} weight="bold">
              아니에요
            </Txt>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: !chosen || saving }}
            disabled={!chosen || saving}
            onPress={() => void save()}
            style={[styles.yesBtn, (!chosen || saving) && { opacity: 0.5 }]}
          >
            <CheckIcon size={18} />
            <Txt size={16} weight="extraBold" color={colors.white}>
              {saving ? "저장 중…" : "이 생물이 맞아요"}
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
  boxLabel: { position: "absolute", left: 16, bottom: 44, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, backgroundColor: colors.sunny },
  topBar: { position: "absolute", left: 0, right: 0, top: 0, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 12 },
  glassBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: "rgba(9,25,56,0.45)", alignItems: "center", justifyContent: "center" },
  glassPill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, backgroundColor: "rgba(9,25,56,0.45)" },
  scrubber: { position: "absolute", left: 20, right: 20, top: 334, gap: 6 },
  scrubLabels: { flexDirection: "row", justifyContent: "space-between" },
  timeChip: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, backgroundColor: "rgba(9,25,56,0.55)" },
  scrubTrack: { height: 6, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.3)" },
  scrubHit: { position: "absolute", height: 6, borderRadius: 3, backgroundColor: colors.sunny },
  knob: { position: "absolute", top: -5, width: 16, height: 16, marginLeft: -8, borderRadius: 8, backgroundColor: colors.white },
  sheet: { flex: 1, marginTop: -28, paddingTop: 10, paddingHorizontal: 20, backgroundColor: colors.mist, borderTopLeftRadius: 12, borderTopRightRadius: 12 },
  grabber: { alignSelf: "center", width: 40, height: 5, borderRadius: 3, backgroundColor: colors.lineStrong },
  ctxRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
  cand: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: 12, borderWidth: 2 },
  candOn: { backgroundColor: "#F0F4FA", borderColor: colors.oceanBlue },
  candOff: { backgroundColor: colors.white, borderColor: colors.line },
  candArt: { width: 76, height: 60, borderRadius: 10, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, alignItems: "center", justifyContent: "center" },
  track: { flex: 1, height: 6, borderRadius: 3, backgroundColor: colors.track, overflow: "hidden" },
  fill: { height: 6, borderRadius: 3 },
  radio: { width: 22, height: 22, borderRadius: 11, backgroundColor: colors.white },
  radioOn: { borderWidth: 7, borderColor: colors.oceanBlue },
  radioOff: { borderWidth: 2, borderColor: "#A9BEDD" },
  manual: { alignSelf: "center", height: 44, justifyContent: "center", marginTop: 4 },
  searchBox: { marginTop: 12, padding: 12, borderRadius: 12, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, gap: 4 },
  searchRow: { flexDirection: "row", alignItems: "center", gap: 8, height: 44, paddingHorizontal: 10, borderRadius: 12, backgroundColor: colors.mist },
  searchInput: { flex: 1, fontFamily: fonts.regular, fontSize: 15, color: colors.navy },
  searchItem: { paddingVertical: 10, paddingHorizontal: 6, borderBottomWidth: 1, borderBottomColor: colors.line },
  actions: { flexDirection: "row", gap: 10, paddingTop: 8 },
  noBtn: { width: 110, height: 54, borderRadius: 12, borderWidth: 1.5, borderColor: colors.lineStrong, backgroundColor: colors.white, alignItems: "center", justifyContent: "center" },
  yesBtn: { flex: 1, height: 54, borderRadius: 12, backgroundColor: colors.oceanBlue, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 },
});
