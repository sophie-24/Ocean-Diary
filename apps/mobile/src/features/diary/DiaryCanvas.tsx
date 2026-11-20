import { StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import { Critter } from "../../components/Critter";
import { STICKER_ART } from "../../data/stickers";
import type { PlacedSticker } from "../log/logStore";

/** Drawing area of a picture-diary page, in its own 338×218 coordinate space. */
export const DRAW_W = 338;
export const DRAW_H = 218;
export const STICKER_BASE = 100;
export const CRITTER_BASE = { w: 120, h: 50 };

export function StickerArt({ item }: { item: PlacedSticker }) {
  if (item.type === "sticker") {
    return <Image source={STICKER_ART[item.kind]} style={{ width: STICKER_BASE, height: STICKER_BASE }} contentFit="contain" />;
  }
  return (
    <View style={[styles.critter, item.flip && { transform: [{ scaleX: -1 }] }]}>
      <Critter kind={item.kind} width={CRITTER_BASE.w} height={CRITTER_BASE.h} />
    </View>
  );
}

export const itemSize = (item: PlacedSticker) =>
  item.type === "sticker" ? { w: STICKER_BASE, h: STICKER_BASE } : { w: CRITTER_BASE.w + 12, h: CRITTER_BASE.h + 12 };

/** Read-only render used in the log detail page. `scale` maps drawing space to screen points. */
export function DiaryCanvas({ layout, scale = 1, background = "#FFFEF8" }: { layout: PlacedSticker[]; scale?: number; background?: string }) {
  return (
    <View style={{ width: DRAW_W * scale, height: DRAW_H * scale, overflow: "hidden", backgroundColor: background }}>
      <View style={{ width: DRAW_W, height: DRAW_H, transform: [{ scale }], transformOrigin: "top left" }}>
        {layout.map((it) => {
          const { w, h } = itemSize(it);
          return (
            <View
              key={it.id}
              style={{ position: "absolute", left: it.x, top: it.y, width: w, height: h, transform: [{ rotate: `${it.rot}deg` }, { scale: it.scale }] }}
            >
              <StickerArt item={it} />
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // White die-cut edge around "my species" stickers so they read like the crayon set.
  critter: {
    padding: 6,
    shadowColor: "#1C1C1E",
    shadowOpacity: 0.22,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
  },
});
