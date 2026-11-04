import { memo } from "react";
import { StyleSheet, View } from "react-native";
import { Txt } from "../../components/ui/Txt";
import { fonts } from "../../theme/tokens";

const COLS = 12;
const INK = "#E9A3A3";

/**
 * 원고지 (Korean manuscript grid). Each character takes one cell; a newline jumps to the next row.
 * The first page in the diary shows 6 rows (72 chars) under the drawing area.
 */
function ManuscriptBase({ text, rows = 6, cell = 26 }: { text: string; rows?: number; cell?: number }) {
  const cells: string[] = [];
  for (const ch of Array.from(text)) {
    if (ch === "\n") {
      const rem = cells.length % COLS;
      if (rem) for (let i = rem; i < COLS; i++) cells.push("");
      continue;
    }
    cells.push(ch);
  }
  const visible = rows * COLS;
  const shown = cells.slice(0, visible);
  while (shown.length < visible) shown.push("");

  return (
    <View
      style={[styles.grid, { width: cell * COLS + 2 }]}
      accessible
      accessibilityLabel={`원고지: ${text.slice(0, 200)}`}
    >
      {Array.from({ length: rows }, (_, r) => (
        <View key={r} style={[styles.row, { height: cell }]}>
          {shown.slice(r * COLS, r * COLS + COLS).map((c, i) => (
            <View key={i} style={[styles.cell, { width: cell, height: cell }]}>
              <Txt size={cell * 0.66} color="#2B2B2B" style={{ fontFamily: fonts.diary, lineHeight: cell }}>
                {c}
              </Txt>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

export const Manuscript = memo(ManuscriptBase);

/** Pages needed: page 1 holds 72 chars beside the drawing, later pages 216 (18 rows). */
export const manuscriptPages = (len: number) => (len <= 72 ? 1 : 1 + Math.ceil((len - 72) / 216));

const styles = StyleSheet.create({
  grid: { borderWidth: 1, borderColor: INK, backgroundColor: "#FFFDF7" },
  row: { flexDirection: "row" },
  cell: { borderRightWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: INK, alignItems: "center", justifyContent: "center" },
});
