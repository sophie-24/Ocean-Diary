import { useRef, useState, type ComponentRef } from "react";
import { Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import * as Haptics from "expo-haptics";
import * as Sharing from "expo-sharing";
import { captureRef } from "react-native-view-shot";
import Animated, { runOnJS, useAnimatedStyle, useSharedValue } from "react-native-reanimated";
import { GestureDetector, usePanGesture, usePinchGesture, useRotationGesture, useSimultaneousGestures, useTapGesture } from "react-native-gesture-handler";
import { Critter } from "../../components/Critter";
import { ChevronLeft, CloseIcon, ShareIcon } from "../../components/icons";
import { Txt } from "../../components/ui/Txt";
import type { CritterKind } from "../../data/illustrations";
import { SPECIES_BY_NO } from "../../data/species";
import { STICKER_ART, STICKER_CATEGORIES, STICKER_NAMES, type StickerKind } from "../../data/stickers";
import { colors, fonts } from "../../theme/tokens";
import type { DiveLog, PlacedSticker } from "../log/logStore";
import { useCollection, useDiveLog, useUpdateDiveLog } from "../../api/queries";
import { errorMessage } from "../../api/client";
import { StateView } from "../../components/ui/StateView";
import { DRAW_H, DRAW_W, StickerArt, itemSize } from "./DiaryCanvas";
import { Manuscript } from "./Manuscript";

const INK = "#3B4C86";

function PlacedItem({
  item,
  selected,
  onSelect,
  onChange,
  onDelete,
}: {
  item: PlacedSticker;
  selected: boolean;
  onSelect: () => void;
  onChange: (patch: Partial<PlacedSticker>) => void;
  onDelete: () => void;
}) {
  const { w, h } = itemSize(item);
  const x = useSharedValue(item.x);
  const y = useSharedValue(item.y);
  const s = useSharedValue(item.scale);
  const r = useSharedValue(item.rot);
  const start = useSharedValue({ x: 0, y: 0, s: 1, r: 0 });

  const commit = (nx: number, ny: number, ns: number, nr: number) => onChange({ x: nx, y: ny, scale: ns, rot: nr });

  const pan = usePanGesture({
    onBegin: () => {
      "worklet";
      start.value = { x: x.value, y: y.value, s: s.value, r: r.value };
      runOnJS(onSelect)();
    },
    onUpdate: (e) => {
      "worklet";
      x.value = Math.min(DRAW_W - 20, Math.max(-w + 20, start.value.x + e.translationX));
      y.value = Math.min(DRAW_H - 20, Math.max(-h + 20, start.value.y + e.translationY));
    },
    onDeactivate: () => {
      "worklet";
      runOnJS(commit)(x.value, y.value, s.value, r.value);
    },
  });
  const pinch = usePinchGesture({
    onBegin: () => {
      "worklet";
      start.value = { x: x.value, y: y.value, s: s.value, r: r.value };
    },
    onUpdate: (e) => {
      "worklet";
      s.value = Math.min(2.6, Math.max(0.35, start.value.s * e.scale));
    },
    onDeactivate: () => {
      "worklet";
      runOnJS(commit)(x.value, y.value, s.value, r.value);
    },
  });
  const rotate = useRotationGesture({
    onUpdate: (e) => {
      "worklet";
      r.value = start.value.r + (e.rotation * 180) / Math.PI;
    },
    onDeactivate: () => {
      "worklet";
      runOnJS(commit)(x.value, y.value, s.value, r.value);
    },
  });
  const tap = useTapGesture({
    onDeactivate: () => {
      "worklet";
      runOnJS(onSelect)();
    },
  });
  const gesture = useSimultaneousGestures(pan, pinch, rotate, tap);

  const style = useAnimatedStyle(() => ({
    position: "absolute",
    left: x.value,
    top: y.value,
    width: w,
    height: h,
    transform: [{ rotate: `${r.value}deg` }, { scale: s.value }],
  }));

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={style} accessibilityRole="button" accessibilityLabel={`${item.type === "sticker" ? STICKER_NAMES[item.kind] : "생물"} 스티커, 끌어서 옮기고 두 손가락으로 크기·회전`}>
        <StickerArt item={item} />
        {selected ? (
          <>
            <View pointerEvents="none" style={styles.selBox} />
            <Pressable accessibilityRole="button" accessibilityLabel="스티커 삭제" onPress={onDelete} hitSlop={10} style={styles.delete}>
              <CloseIcon size={12} color={colors.white} strokeWidth={3} />
            </Pressable>
          </>
        ) : null}
      </Animated.View>
    </GestureDetector>
  );
}

export function DiaryDecorateScreen({ logId }: { logId: string }) {
  const { data: log, isLoading, error, refetch } = useDiveLog(logId);
  if (!log) {
    return (
      <SafeAreaView style={[styles.root, { justifyContent: "center" }]}>
        <StateView loading={isLoading} error={error} onRetry={() => void refetch()} empty="기록을 찾을 수 없어요" />
      </SafeAreaView>
    );
  }
  return <DiaryDecorateInner key={log.id} log={log} />;
}

function DiaryDecorateInner({ log }: { log: DiveLog }) {
  const logId = log.id;
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const update = useUpdateDiveLog();
  const { data: collection } = useCollection();
  const [layout, setLayout] = useState<PlacedSticker[]>(log?.layout ?? []);
  const [selected, setSelected] = useState<string | null>(null);
  const [cat, setCat] = useState<string>("mine");
  // Host element ref for react-native-view-shot.
  const pageRef = useRef<ComponentRef<typeof View>>(null);

  const pageW = Math.min(366, width - 24);
  const drawScale = (pageW - 28) / DRAW_W;

  const mine: CritterKind[] = Array.from(
    new Set([
      ...log.stickers,
      ...Array.from(collection?.keys() ?? []).map((no) => SPECIES_BY_NO[no]?.art).filter((k): k is CritterKind => !!k),
    ]),
  );

  const add = (item: Omit<PlacedSticker, "id" | "x" | "y" | "scale" | "rot">) => {
    const id = `${Date.now()}`;
    const placed = { ...item, id, x: DRAW_W / 2 - 50 + (layout.length % 4) * 12, y: DRAW_H / 2 - 50, scale: item.type === "sticker" ? 0.8 : 1, rot: 0 } as PlacedSticker;
    setLayout((l) => [...l, placed]);
    setSelected(id);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
  };
  const change = (id: string) => (patch: Partial<PlacedSticker>) => setLayout((l) => l.map((it) => (it.id === id ? ({ ...it, ...patch } as PlacedSticker) : it)));
  // Bring the touched sticker to the front.
  const select = (id: string) => () => {
    setSelected(id);
    setLayout((l) => {
      const i = l.findIndex((it) => it.id === id);
      return i < 0 || i === l.length - 1 ? l : [...l.slice(0, i), ...l.slice(i + 1), l[i]];
    });
  };

  const done = () => {
    if (update.isPending) return;
    update.mutate(
      { id: logId, patch: { sticker_layout: layout.map((it) => ({ ...it, x: Math.round(it.x), y: Math.round(it.y) })), is_draft: false } },
      { onSuccess: () => router.replace({ pathname: "/log/[id]", params: { id: logId } }) },
    );
  };

  const share = async () => {
    setSelected(null);
    try {
      await new Promise((r) => setTimeout(r, 50));
      const uri = await captureRef(pageRef as never, { format: "png", quality: 1 });
      if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(uri, { mimeType: "image/png", dialogTitle: "그림일기 공유" });
    } catch {
      // Capture is not available in every runtime (e.g. web preview); sharing is best-effort.
    }
  };

  const d = new Date(`${log.date}T00:00:00`);
  const trayItems =
    cat === "mine"
      ? mine.map((k) => ({ key: k, type: "critter" as const, kind: k }))
      : (STICKER_CATEGORIES.find((c) => c.key === cat)?.items ?? []).map((k) => ({ key: k, type: "sticker" as const, kind: k }));

  return (
    <SafeAreaView edges={["top"]} style={styles.root}>
      <View style={styles.header}>
        <Pressable accessibilityRole="button" accessibilityLabel="글쓰기로 돌아가기" onPress={() => router.back()} style={styles.hit}>
          <ChevronLeft />
        </Pressable>
        <Txt accessibilityRole="header" size={16} weight="black">
          그림일기 꾸미기
        </Txt>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Pressable accessibilityRole="button" accessibilityLabel="이미지로 저장하거나 공유하기" onPress={share} style={styles.hit}>
            <ShareIcon />
          </Pressable>
          <Pressable accessibilityRole="button" onPress={done} style={[styles.hit, { width: 52 }]}>
            <Txt size={15} weight="black" color={colors.oceanBlue}>
              {update.isPending ? "저장…" : "완료"}
            </Txt>
          </Pressable>
        </View>
      </View>

      <View style={{ alignItems: "center", marginTop: 6 }}>
        <View ref={pageRef} collapsable={false} style={[styles.page, { width: pageW }]}>
          <View style={styles.dateRow}>
            <Txt size={19} style={styles.crayon}>
              <Txt size={19} style={[styles.crayon, { color: colors.oceanBlue }]}>
                {d.getFullYear()}
              </Txt>
              년{" "}
              <Txt size={19} style={[styles.crayon, { color: colors.oceanBlue }]}>
                {d.getMonth() + 1}
              </Txt>
              월{" "}
              <Txt size={19} style={[styles.crayon, { color: colors.oceanBlue }]}>
                {d.getDate()}
              </Txt>
              일{" "}
              <Txt size={19} style={[styles.crayon, { color: colors.oceanBlue }]}>
                {"일월화수목금토"[d.getDay()]}
              </Txt>
              요일
            </Txt>
            <Txt size={15} style={styles.crayon} numberOfLines={1}>
              {log.point}
            </Txt>
          </View>
          <View style={[styles.drawing, { height: DRAW_H * drawScale + 4 }]}>
            <View style={{ width: DRAW_W, height: DRAW_H, transform: [{ scale: drawScale }], transformOrigin: "top left" }}>
              <Pressable accessible={false} onPress={() => setSelected(null)} style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }} />
              {layout.map((it) => (
                <PlacedItem
                  key={it.id}
                  item={it}
                  selected={selected === it.id}
                  onSelect={select(it.id)}
                  onChange={change(it.id)}
                  onDelete={() => {
                    setLayout((l) => l.filter((x) => x.id !== it.id));
                    setSelected(null);
                  }}
                />
              ))}
            </View>
            {layout.length === 0 ? (
              <View pointerEvents="none" style={styles.emptyHint}>
                <Txt size={13} weight="bold" color={colors.ink3}>
                  아래에서 스티커를 눌러 붙여 보세요
                </Txt>
              </View>
            ) : null}
          </View>
          <View style={{ alignItems: "center", marginTop: 8 }}>
            <Manuscript text={log.diary ?? ""} rows={3} cell={(pageW - 30) / 12} />
          </View>
        </View>
      </View>
      <Txt size={11} weight="bold" color={update.isError ? colors.coral : colors.ink2} align="center" style={{ marginTop: 8 }} accessibilityLiveRegion="polite">
        {update.isError ? `${errorMessage(update.error)} 완료를 다시 눌러 주세요.` : "끌어서 옮기고 · 두 손가락으로 크기와 방향을 바꿔요"}
      </Txt>

      <View style={[styles.tray, { paddingBottom: 12 + insets.bottom }]}>
        <View style={styles.grabber} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cats} accessibilityRole="tablist">
          {[{ key: "mine", label: `내 생물 ${mine.length}` }, ...STICKER_CATEGORIES].map((c) => {
            const on = cat === c.key;
            return (
              <Pressable key={c.key} accessibilityRole="tab" accessibilityState={{ selected: on }} onPress={() => setCat(c.key)} style={[styles.cat, on ? styles.catOn : styles.catOff]}>
                <Txt size={13} weight={on ? "extraBold" : "bold"} color={on ? colors.white : colors.navy}>
                  {c.label}
                </Txt>
              </Pressable>
            );
          })}
        </ScrollView>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.items}>
          {trayItems.map((t) => (
            <Pressable
              key={t.key}
              accessibilityRole="button"
              accessibilityLabel={`${t.type === "sticker" ? STICKER_NAMES[t.kind as StickerKind] : "내 생물"} 스티커 붙이기`}
              onPress={() => add(t.type === "sticker" ? { type: "sticker", kind: t.kind as StickerKind } : { type: "critter", kind: t.kind as CritterKind })}
              style={styles.item}
            >
              {t.type === "sticker" ? (
                <Image source={STICKER_ART[t.kind as StickerKind]} style={{ width: 56, height: 56 }} contentFit="contain" />
              ) : (
                <Critter kind={t.kind as CritterKind} width={60} height={44} />
              )}
              <Txt size={10} weight="bold" numberOfLines={1}>
                {t.type === "sticker" ? STICKER_NAMES[t.kind as StickerKind] : (Object.values(SPECIES_BY_NO).find((s) => s.art === t.kind)?.nameKo ?? "")}
              </Txt>
            </Pressable>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.mist },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 8 },
  hit: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  page: { paddingTop: 10, paddingHorizontal: 12, paddingBottom: 12, borderRadius: 6, backgroundColor: "#FFFEF8" },
  dateRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 6, paddingVertical: 6, paddingHorizontal: 8, borderWidth: 2, borderColor: INK, borderRadius: 4 },
  crayon: { fontFamily: fonts.diary, color: INK, lineHeight: 22 },
  drawing: { marginTop: 8, borderWidth: 2, borderColor: INK, borderRadius: 4, overflow: "hidden", backgroundColor: "#FFFEF8" },
  emptyHint: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, alignItems: "center", justifyContent: "center" },
  selBox: { position: "absolute", top: -4, left: -4, right: -4, bottom: -4, borderWidth: 1.5, borderStyle: "dashed", borderColor: colors.oceanBlue, borderRadius: 6 },
  delete: { position: "absolute", right: -12, top: -12, width: 24, height: 24, borderRadius: 12, backgroundColor: colors.oceanBlue, alignItems: "center", justifyContent: "center" },
  tray: { marginTop: "auto", paddingTop: 8, backgroundColor: colors.white, borderTopLeftRadius: 12, borderTopRightRadius: 12, shadowColor: "#1C1C1E", shadowOpacity: 0.12, shadowRadius: 24, shadowOffset: { width: 0, height: -8 }, elevation: 8 },
  grabber: { alignSelf: "center", width: 40, height: 5, borderRadius: 3, backgroundColor: colors.lineStrong },
  cats: { gap: 6, paddingHorizontal: 20, paddingTop: 10 },
  cat: { height: 34, paddingHorizontal: 12, borderRadius: 999, borderWidth: 1.5, justifyContent: "center" },
  catOn: { backgroundColor: colors.navy, borderColor: colors.navy },
  catOff: { backgroundColor: colors.white, borderColor: colors.lineStrong },
  items: { gap: 10, paddingHorizontal: 20, paddingTop: 10 },
  item: { width: 76, height: 92, borderRadius: 12, borderWidth: 1, borderColor: "#E8E2CF", backgroundColor: "#FFFEF8", alignItems: "center", justifyContent: "center", gap: 4 },
});
