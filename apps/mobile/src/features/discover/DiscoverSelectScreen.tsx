import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Critter } from "../../components/Critter";
import { ChevronDown, CloseIcon, InfoIcon, PlayIcon, SparkleIcon } from "../../components/icons";
import { Txt } from "../../components/ui/Txt";
import { MOCK_MEDIA_GROUPS, type MockMedia } from "../../mocks/discover";
import { colors } from "../../theme/tokens";
import { discoverStore, useDiscover } from "./discoverStore";

type Seg = "전체" | "사진" | "영상";

export function DiscoverSelectScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { selected } = useDiscover();
  const [seg, setSeg] = useState<Seg>("전체");

  const groups = useMemo(
    () =>
      MOCK_MEDIA_GROUPS.map((g) => ({
        ...g,
        items: g.items.filter((m) => seg === "전체" || (seg === "영상" ? !!m.dur : !m.dur)),
      })).filter((g) => g.items.length > 0),
    [seg],
  );

  return (
    <SafeAreaView edges={["top"]} style={styles.root}>
      <View style={styles.header}>
        <Pressable accessibilityRole="button" accessibilityLabel="닫기" onPress={() => router.navigate("/")} style={styles.hit}>
          <CloseIcon />
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="앨범 고르기, 지금 최근 항목" style={styles.album}>
          <Txt size={17} weight="black">
            최근 항목
          </Txt>
          <ChevronDown />
        </Pressable>
        <View style={styles.hit} />
      </View>

      <View accessibilityRole="tablist" style={styles.segment}>
        {(["전체", "사진", "영상"] as Seg[]).map((s) => {
          const on = s === seg;
          return (
            <Pressable
              key={s}
              accessibilityRole="tab"
              accessibilityState={{ selected: on }}
              onPress={() => setSeg(s)}
              style={[styles.segItem, on && styles.segOn]}
            >
              <Txt size={14} weight={on ? "black" : "bold"} color={on ? colors.navy : colors.ink2}>
                {s}
              </Txt>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.hint}>
        <InfoIcon color="#1F4FA8" size={16} />
        <Txt size={13} color="#1F4FA8" style={{ flex: 1 }}>
          촬영 날짜로 다이빙 로그를 찾아 자동으로 연결해요
        </Txt>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 180 + insets.bottom }}>
        {groups.map((g) => (
          <View key={g.id}>
            <View style={styles.groupHead}>
              <Txt size={14} weight="extraBold" style={{ flex: 1 }}>
                {g.title}
              </Txt>
              <View style={styles.diveChip}>
                <Txt size={11} weight="bold" color={colors.ink2}>
                  {g.diveLabel}
                </Txt>
              </View>
            </View>
            <View style={styles.grid}>
              {g.items.map((m) => (
                <Thumb key={m.id} media={m} order={selected.indexOf(m.id)} onPress={() => discoverStore.toggle(m.id)} />
              ))}
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={[styles.sheet, { paddingBottom: 16 + insets.bottom }]}>
        <View style={styles.sheetRow}>
          <View>
            <Txt size={15} weight="black" accessibilityLiveRegion="polite">
              {selected.length}개 선택됨
            </Txt>
            <Txt size={12} color={colors.ink2}>
              영상은 한 개당 최대 60초까지 분석해요
            </Txt>
          </View>
          <Pressable accessibilityRole="button" onPress={() => discoverStore.set({ selected: [] })} hitSlop={8} style={{ height: 44, justifyContent: "center" }}>
            <Txt size={13} weight="bold" color={colors.oceanBlue}>
              선택 해제
            </Txt>
          </Pressable>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: selected.length === 0 }}
          disabled={selected.length === 0}
          onPress={() => router.push("/discover/analyzing")}
          style={[styles.cta, selected.length === 0 && { opacity: 0.45 }]}
        >
          <SparkleIcon />
          <Txt size={16} weight="extraBold" color={colors.white}>
            AI로 바닷속 친구 찾기
          </Txt>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function Thumb({ media, order, onPress }: { media: MockMedia; order: number; onPress: () => void }) {
  const on = order >= 0;
  const { width } = useWindowDimensions();
  const size = Math.floor((width - 4) / 3);
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: on }}
      accessibilityLabel={`${media.dur ? `영상 ${media.dur}` : "사진"}${on ? `, ${order + 1}번째 선택됨` : ""}`}
      style={[styles.thumb, { width: size, backgroundColor: media.bg }]}
    >
      <View style={styles.glare} />
      <View style={{ position: "absolute", left: media.x, top: media.y, opacity: 0.92 }}>
        <Critter kind={media.kind} width={media.w} height={media.h} />
      </View>
      {media.dur ? (
        <View style={styles.dur}>
          <PlayIcon />
          <Txt size={11} weight="bold" color={colors.white}>
            {media.dur}
          </Txt>
        </View>
      ) : null}
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
  thumb: { height: 128, overflow: "hidden" },
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
