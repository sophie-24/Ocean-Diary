import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery } from "@tanstack/react-query";
import { Critter } from "../../components/Critter";
import { CloseIcon, InfoIcon, PlusIcon, SparkleIcon } from "../../components/icons";
import { Txt } from "../../components/ui/Txt";
import { exifToIso, getClientConfig, keyFor, localDate, type PickedPhoto } from "../../api/discover";
import { useDiveLogs } from "../../api/queries";
import { useAuth } from "../../api/auth";
import { colors } from "../../theme/tokens";
import { discoverStore, matchLog, useDiscover, type PhotoWork } from "./discoverStore";
import { LogPickerSheet } from "./LogPickerSheet";
import { keepPhoto } from "./photoKeep";

const MAX_PICK = 10;
const NO_DATE = "no-date";
const WEEKDAY = ["일", "월", "화", "수", "목", "금", "토"];

const dateTitle = (ymd: string) => {
  const [y, m, d] = ymd.split("-").map(Number);
  return `${m}월 ${d}일 (${WEEKDAY[new Date(y, m - 1, d).getDay()]})`;
};
const consentKey = (provider: string | null, version: string | null) => `ocean-diary:ai-consent:${provider}:${version}`;

export function DiscoverSelectScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { photos, selected, work, logChoice } = useDiscover();
  const [pickerDate, setPickerDate] = useState<string | null | undefined>(undefined);
  const open = discoverStore.openCount();
  const savedCount = selected.filter((id) => work[id]?.saved).length;
  const { data: logData } = useDiveLogs();
  const { userId } = useAuth();
  const config = useQuery({ queryKey: ["client-config"], queryFn: getClientConfig, staleTime: 5 * 60_000 });
  const [error, setError] = useState<string | null>(null);
  const [askConsent, setAskConsent] = useState(false);

  const groups = useMemo(() => {
    const byDate = new Map<string, PickedPhoto[]>();
    for (const p of photos) {
      const k = p.takenAt ? localDate(p.takenAt) : NO_DATE;
      byDate.set(k, [...(byDate.get(k) ?? []), p]);
    }
    return [...byDate.entries()]
      .sort(([a], [b]) => (a === NO_DATE ? 1 : b === NO_DATE ? -1 : b.localeCompare(a)))
      .map(([k, items]) => {
        const m = matchLog(items[0], logData?.logs, logChoice);
        const log = m.log;
        const many = m.sameDay.length > 1;
        return {
          id: k,
          title: k === NO_DATE ? "촬영 날짜를 모르는 사진" : `${dateTitle(k)}${log ? ` · ${log.region} ${log.point}` : ""}`,
          diveLabel: log ? `로그 ${log.label}${many ? ` · ${m.sameDay.length}개 중` : ""}` : k === NO_DATE ? "로그 고르기" : "연결 안 함",
          attention: m.guessed,
          items,
        };
      });
  }, [photos, logData, logChoice]);

  const pick = async () => {
    setError(null);
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      setError("사진 보관함 접근을 허용해야 사진을 고를 수 있어요. 설정에서 바꿀 수 있어요.");
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      selectionLimit: MAX_PICK,
      orderedSelection: true,
      exif: true,
      quality: 0.85,
      preferredAssetRepresentationMode: ImagePicker.UIImagePickerPreferredAssetRepresentationMode.Compatible,
    });
    if (res.canceled) return;
    const known = new Set(photos.map((p) => p.id));
    const added: PickedPhoto[] = res.assets
      .map((a) => ({
        id: a.assetId ?? a.uri,
        uri: keepPhoto(a.uri, a.assetId ?? a.uri),
        mimeType: a.mimeType ?? (a.uri.toLowerCase().endsWith(".png") ? "image/png" : "image/jpeg"),
        size: a.fileSize ?? 0,
        width: a.width,
        height: a.height,
        takenAt: exifToIso(a.exif?.DateTimeOriginal ?? a.exif?.["{Exif}"]?.DateTimeOriginal),
      }))
      .filter((p) => !known.has(p.id));
    const all = [...photos, ...added].slice(-MAX_PICK * 3);
    discoverStore.set({ photos: all, selected: [...selected, ...added.map((p) => p.id)].slice(0, MAX_PICK) });
  };

  const start = () => {
    const work: Record<string, PhotoWork> = {};
    const prev = discoverStore.get().work;
    for (const id of selected) work[id] = prev[id] ?? { intentKey: keyFor("upload"), identifyKey: keyFor("identify"), saveKey: keyFor("obs") };
    const first = selected.findIndex((id) => !work[id].saved && !work[id].skipped);
    if (first < 0) return;
    discoverStore.set({ current: first, pickedCandidate: 0, manual: null, work, owner: userId ?? discoverStore.get().owner });
    router.push("/discover/analyzing");
  };

  const analyse = async () => {
    const c = config.data;
    if (!c) {
      setError("사진 분석 방식을 확인하지 못했어요. 연결 상태를 확인해 주세요.");
      void config.refetch();
      return;
    }
    if (c.external_ai_processing) {
      const ok = await AsyncStorage.getItem(consentKey(c.external_ai_provider, c.external_ai_consent_version)).catch(() => null);
      if (!ok) return setAskConsent(true);
    }
    start();
  };

  const acceptConsent = async () => {
    const c = config.data;
    if (c) await AsyncStorage.setItem(consentKey(c.external_ai_provider, c.external_ai_consent_version), new Date().toISOString()).catch(() => undefined);
    setAskConsent(false);
    start();
  };

  return (
    <SafeAreaView edges={["top"]} style={styles.root}>
      <View style={styles.header}>
        <Pressable accessibilityRole="button" accessibilityLabel="닫기" onPress={() => router.navigate("/")} style={styles.hit}>
          <CloseIcon />
        </Pressable>
        <Txt accessibilityRole="header" size={17} weight="black">
          사진으로 친구 찾기
        </Txt>
        <Pressable accessibilityRole="button" accessibilityLabel="사진 더 고르기" onPress={() => void pick()} style={styles.hit}>
          <PlusIcon color={colors.navy} />
        </Pressable>
      </View>

      <View style={styles.hint}>
        <InfoIcon color="#1F4FA8" size={16} />
        <Txt size={13} color="#1F4FA8" style={{ flex: 1 }}>
          촬영 날짜가 같은 다이빙 로그에 자동으로 연결해요
        </Txt>
      </View>

      {open > 0 ? (
        <View style={styles.resume}>
          <View style={{ flex: 1 }}>
            <Txt size={14} weight="extraBold" color={colors.white}>
              하던 사진 {open}장이 남아 있어요
            </Txt>
            <Txt size={12} color="#C3D8F5">
              {savedCount ? `${savedCount}장은 이미 도감에 저장했어요` : "올린 사진은 다시 올리지 않아요"}
            </Txt>
          </View>
          <Pressable accessibilityRole="button" onPress={() => void analyse()} style={styles.resumeCta}>
            <Txt size={13} weight="black">
              이어서 하기
            </Txt>
          </Pressable>
        </View>
      ) : null}

      {photos.length === 0 ? (
        <View style={styles.empty}>
          <Critter kind="mandarin" width={150} height={94} />
          <Txt size={18} weight="black" align="center">
            다이빙 사진을 골라 주세요
          </Txt>
          <Txt size={14} color={colors.ink2} align="center" style={{ lineHeight: 22 }}>
            한 번에 {MAX_PICK}장까지 고를 수 있어요.{"\n"}AI가 한 장씩 살펴보고 생물 이름을 알려줘요.
          </Txt>
          <Pressable accessibilityRole="button" onPress={() => void pick()} style={[styles.cta, { alignSelf: "stretch", marginTop: 8 }]}>
            <Txt size={16} weight="extraBold" color={colors.white}>
              사진 보관함 열기
            </Txt>
          </Pressable>
          {error ? (
            <Txt size={13} color={colors.coral} align="center">
              {error}
            </Txt>
          ) : null}
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 180 + insets.bottom }}>
          {groups.map((g) => (
            <View key={g.id}>
              <View style={styles.groupHead}>
                <Txt size={14} weight="extraBold" style={{ flex: 1 }}>
                  {g.title}
                </Txt>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`${g.diveLabel}, 연결할 로그 바꾸기`}
                  disabled={!logData?.logs.length}
                  onPress={() => setPickerDate(g.id === NO_DATE ? null : g.id)}
                  hitSlop={6}
                  style={[styles.diveChip, g.attention && styles.diveChipWarn]}
                >
                  <Txt size={11} weight="bold" color={g.attention ? "#8A5A00" : colors.ink2}>
                    {g.diveLabel}
                    {logData?.logs.length ? " ›" : ""}
                  </Txt>
                </Pressable>
              </View>
              <View style={styles.grid}>
                {g.items.map((m) => (
                  <Thumb key={m.id} photo={m} order={selected.indexOf(m.id)} onPress={() => discoverStore.toggle(m.id)} />
                ))}
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {photos.length > 0 ? (
        <View style={[styles.sheet, { paddingBottom: 16 + insets.bottom }]}>
          <View style={styles.sheetRow}>
            <View style={{ flex: 1 }}>
              <Txt size={15} weight="black" accessibilityLiveRegion="polite">
                {selected.length}개 선택됨
              </Txt>
              <Txt size={12} color={error ? colors.coral : colors.ink2}>
                {error ?? "JPEG·PNG 사진을 한 장씩 분석해요"}
              </Txt>
            </View>
            <Pressable accessibilityRole="button" onPress={() => discoverStore.reset()} hitSlop={8} style={{ height: 44, justifyContent: "center" }}>
              <Txt size={13} weight="bold" color={colors.oceanBlue}>
                새로 시작
              </Txt>
            </Pressable>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: selected.length === 0 }}
            disabled={selected.length === 0}
            onPress={() => void analyse()}
            style={[styles.cta, selected.length === 0 && { opacity: 0.45 }]}
          >
            <SparkleIcon />
            <Txt size={16} weight="extraBold" color={colors.white}>
              AI로 바닷속 친구 찾기
            </Txt>
          </Pressable>
        </View>
      ) : null}

      {pickerDate !== undefined && logData ? (
        <LogPickerSheet
          date={pickerDate}
          logs={logData.logs}
          selectedId={pickerDate ? (pickerDate in logChoice ? logChoice[pickerDate] : matchLog(photos.find((p) => p.takenAt && localDate(p.takenAt) === pickerDate), logData.logs, logChoice).log?.id) : undefined}
          onPick={(id) => {
            if (pickerDate) discoverStore.chooseLog(pickerDate, id);
            else {
              // Photos without a date: give them the chosen log's date so they link too.
              const log = logData.logs.find((l) => l.id === id);
              if (log) {
                const noon = new Date(`${log.date}T12:00:00`).toISOString();
                discoverStore.set({ photos: photos.map((p) => (p.takenAt ? p : { ...p, takenAt: noon })) });
                discoverStore.chooseLog(log.date, log.id);
              }
            }
            setPickerDate(undefined);
          }}
          onClose={() => setPickerDate(undefined)}
        />
      ) : null}

      {askConsent ? (
        <View style={styles.scrim}>
          <View style={[styles.consent, { paddingBottom: 20 + insets.bottom }]} accessibilityViewIsModal>
            <Txt accessibilityRole="header" size={18} weight="black">
              사진 분석 안내
            </Txt>
            <Txt size={14} color="#34466E" style={{ lineHeight: 22 }}>
              고른 사진은 생물 이름을 찾기 위해 외부 AI 서비스({config.data?.external_ai_provider})로 보내져요. 분석에만 쓰이고, 사진과 기록은 내 계정에서
              언제든 지울 수 있어요.
            </Txt>
            <View style={{ flexDirection: "row", gap: 10 }}>
              <Pressable accessibilityRole="button" onPress={() => setAskConsent(false)} style={styles.consentNo}>
                <Txt size={15} weight="bold">
                  취소
                </Txt>
              </Pressable>
              <Pressable accessibilityRole="button" onPress={() => void acceptConsent()} style={[styles.cta, { flex: 1 }]}>
                <Txt size={15} weight="extraBold" color={colors.white}>
                  동의하고 분석하기
                </Txt>
              </Pressable>
            </View>
          </View>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

function Thumb({ photo, order, onPress }: { photo: PickedPhoto; order: number; onPress: () => void }) {
  const on = order >= 0;
  const { width } = useWindowDimensions();
  const size = Math.floor((width - 4) / 3);
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: on }}
      accessibilityLabel={`사진${on ? `, ${order + 1}번째 선택됨` : ""}`}
      style={[styles.thumb, { width: size }]}
    >
      <Image source={{ uri: photo.uri }} style={{ width: "100%", height: "100%" }} contentFit="cover" />
      {on ? <View style={styles.ring} pointerEvents="none" /> : null}
      <View style={[styles.num, on ? styles.numOn : styles.numOff]}>
        {on ? (
          <Txt size={12} weight="extraBold" color={colors.white}>
            {order + 1}
          </Txt>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.mist },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 12 },
  hit: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  album: { flexDirection: "row", alignItems: "center", gap: 4, height: 44 },
  segment: { flexDirection: "row", marginTop: 8, marginHorizontal: 20, padding: 4, borderRadius: 14, backgroundColor: colors.track },
  segItem: { flex: 1, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  segOn: { backgroundColor: colors.white },
  hint: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 12, marginHorizontal: 20, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 14, backgroundColor: colors.sky },
  groupHead: { flexDirection: "row", alignItems: "center", gap: 8, paddingTop: 16, paddingBottom: 8, paddingHorizontal: 20 },
  diveChip: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.lineStrong },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 2 },
  thumb: { height: 128, overflow: "hidden", backgroundColor: colors.track },
  diveChipWarn: { backgroundColor: "#FFF4D6", borderColor: "#E9C46A" },
  resume: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 12, marginHorizontal: 20, paddingVertical: 12, paddingHorizontal: 14, borderRadius: 18, backgroundColor: colors.navy },
  resumeCta: { height: 40, paddingHorizontal: 14, borderRadius: 12, backgroundColor: colors.white, alignItems: "center", justifyContent: "center" },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10, paddingHorizontal: 32, paddingBottom: 80 },
  scrim: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(9,25,56,0.45)", justifyContent: "flex-end" },
  consent: { gap: 14, padding: 20, backgroundColor: colors.white, borderTopLeftRadius: 26, borderTopRightRadius: 26 },
  consentNo: { width: 96, height: 54, borderRadius: 18, borderWidth: 1.5, borderColor: colors.lineStrong, alignItems: "center", justifyContent: "center" },
  glare: { position: "absolute", left: -20, top: -30, width: 70, height: 190, backgroundColor: "rgba(255,255,255,0.12)", transform: [{ rotate: "22deg" }] },
  dur: { position: "absolute", left: 6, bottom: 6, flexDirection: "row", alignItems: "center", gap: 3, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, backgroundColor: "rgba(15,32,50,0.72)" },
  ring: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, borderWidth: 4, borderColor: colors.oceanBlue, backgroundColor: "rgba(47,111,219,0.14)" },
  num: { position: "absolute", top: 7, right: 7, width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: colors.white, alignItems: "center", justifyContent: "center" },
  numOn: { backgroundColor: colors.oceanBlue },
  numOff: { backgroundColor: "rgba(15,32,50,0.25)" },
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: 16,
    paddingHorizontal: 20,
    gap: 12,
    backgroundColor: colors.white,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    shadowColor: "#1E468C",
    shadowOpacity: 0.1,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: -8 },
    elevation: 10,
  },
  sheetRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  cta: { height: 54, borderRadius: 18, backgroundColor: colors.oceanBlue, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
});
