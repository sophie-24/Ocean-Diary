import type { ReactNode } from "react";
import { Pressable, StyleSheet, TextInput, View, type TextInputProps } from "react-native";
import { FreeIcon, ScubaIcon, SnorkelIcon } from "../../components/icons";
import { Txt } from "../../components/ui/Txt";
import { colors, fonts } from "../../theme/tokens";
import type { LogKind } from "./logStore";

export function Section({ title, optional, note, children }: { title: string; optional?: boolean; note?: string; children: ReactNode }) {
  return (
    <View style={styles.sec}>
      <View style={styles.secHead}>
        <Txt accessibilityRole="header" size={16} weight="black">
          {title}
        </Txt>
        {note ? (
          <Txt size={11} weight="bold" color={colors.coral}>
            {note}
          </Txt>
        ) : optional ? (
          <View style={styles.opt}>
            <Txt size={11} weight="bold" color={colors.ink3}>
              선택
            </Txt>
          </View>
        ) : null}
      </View>
      {children}
    </View>
  );
}

type FieldProps = TextInputProps & { label: string; required?: boolean; unit?: string; hint?: string; error?: string };

export function Field({ label, required, unit, hint, error, style, ...input }: FieldProps) {
  return (
    <View style={{ gap: 6 }}>
      <Txt size={12} weight="bold" color={colors.ink2}>
        {label}
        {required ? (
          <Txt size={12} weight="bold" color={colors.coral}>
            {" "}*
          </Txt>
        ) : null}
      </Txt>
      <View style={[styles.input, !!error && { borderColor: colors.coral }]}>
        <TextInput
          {...input}
          accessibilityLabel={label}
          placeholderTextColor="#8C9AB5"
          style={[styles.inputText, style]}
        />
        {unit ? (
          <Txt size={13} weight="bold" color={colors.ink3}>
            {unit}
          </Txt>
        ) : null}
      </View>
      {error ? (
        <Txt size={11} weight="bold" color={colors.coral}>
          {error}
        </Txt>
      ) : hint ? (
        <Txt size={11} color={colors.ink2}>
          {hint}
        </Txt>
      ) : null}
    </View>
  );
}

/** Compact numeric box used in the dive-computer grid (label above, unit inside). */
export function MiniField({ label, sub, unit, ...input }: TextInputProps & { label: string; sub?: string; unit?: string }) {
  return (
    <View style={{ flex: 1, minWidth: 0 }}>
      <Txt size={12} weight="extraBold" numberOfLines={1}>
        {label}
        {sub ? (
          <Txt size={10} color={colors.inkSoft}>
            {" "}
            {sub}
          </Txt>
        ) : null}
      </Txt>
      <View style={styles.mini}>
        <TextInput
          {...input}
          accessibilityLabel={label}
          placeholderTextColor="#8C9AB5"
          style={[styles.miniText]}
        />
        {unit ? (
          <Txt size={12} weight="bold" color={colors.ink3}>
            {unit}
          </Txt>
        ) : null}
      </View>
    </View>
  );
}

type ChipGroupProps = {
  label?: string;
  sub?: string;
  options: string[];
  value: string[];
  onChange: (next: string[]) => void;
  single?: boolean;
};

export function ChipGroup({ label, sub, options, value, onChange, single }: ChipGroupProps) {
  const toggle = (o: string) => {
    const on = value.includes(o);
    if (single) onChange(on ? [] : [o]);
    else onChange(on ? value.filter((x) => x !== o) : [...value, o]);
  };
  const chips = (
    <View style={styles.chips} accessibilityRole={single ? "radiogroup" : undefined} accessibilityLabel={label}>
      {options.map((o) => {
        const on = value.includes(o);
        return (
          <Pressable
            key={o}
            onPress={() => toggle(o)}
            accessibilityRole={single ? "radio" : "checkbox"}
            accessibilityState={single ? { checked: on } : { checked: on }}
            style={[styles.chip, on ? styles.chipOn : styles.chipOff]}
          >
            <Txt size={13} weight={on ? "extraBold" : "medium"} color={on ? colors.white : colors.navy}>
              {o}
            </Txt>
          </Pressable>
        );
      })}
    </View>
  );
  if (!label) return chips;
  return (
    <View style={styles.row}>
      <View style={{ width: 88 }}>
        <Txt size={14} weight="extraBold">
          {label}
        </Txt>
        {sub ? (
          <Txt size={10} color={colors.ink3}>
            {sub}
          </Txt>
        ) : null}
      </View>
      <View style={{ flex: 1 }}>{chips}</View>
    </View>
  );
}

const KIND_ICON = { scuba: ScubaIcon, free: FreeIcon, snorkel: SnorkelIcon } as const;
const KIND_TEXT: Record<LogKind, string> = { scuba: "스쿠버", free: "프리다이빙", snorkel: "스노클링" };

export function KindToggle({ value, onChange }: { value: LogKind; onChange: (k: LogKind) => void }) {
  return (
    <View accessibilityRole="radiogroup" accessibilityLabel="물놀이 종류" style={styles.kinds}>
      {(["scuba", "free", "snorkel"] as LogKind[]).map((k) => {
        const on = k === value;
        const Icon = KIND_ICON[k];
        return (
          <Pressable
            key={k}
            accessibilityRole="radio"
            accessibilityState={{ checked: on }}
            onPress={() => onChange(k)}
            style={[styles.kind, on ? styles.kindOn : styles.kindOff]}
          >
            <Icon color={on ? colors.white : colors.navy} />
            <Txt size={13} weight={on ? "extraBold" : "bold"} color={on ? colors.white : colors.navy}>
              {KIND_TEXT[k]}
            </Txt>
          </Pressable>
        );
      })}
    </View>
  );
}

export function Segmented<T extends string>({ options, value, onChange, label }: { options: [T, string][]; value: T; onChange: (v: T) => void; label: string }) {
  return (
    <View accessibilityRole="radiogroup" accessibilityLabel={label} style={styles.seg}>
      {options.map(([k, text]) => {
        const on = k === value;
        return (
          <Pressable key={k} accessibilityRole="radio" accessibilityState={{ checked: on }} onPress={() => onChange(k)} style={[styles.segItem, on && styles.segOn]}>
            <Txt size={13} weight={on ? "extraBold" : "bold"} color={on ? colors.navy : colors.ink2}>
              {text}
            </Txt>
          </Pressable>
        );
      })}
    </View>
  );
}

export const formStyles = StyleSheet.create({
  diaryFont: { fontFamily: fonts.diary },
});

const styles = StyleSheet.create({
  sec: { padding: 16, paddingBottom: 18, borderRadius: 22, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, gap: 12 },
  secHead: { flexDirection: "row", alignItems: "baseline", justifyContent: "space-between" },
  opt: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999, backgroundColor: colors.mist },
  input: { flexDirection: "row", alignItems: "center", gap: 8, height: 48, paddingHorizontal: 14, borderRadius: 14, backgroundColor: colors.white, borderWidth: 1.5, borderColor: colors.lineStrong },
  inputText: { flex: 1, fontFamily: fonts.bold, fontSize: 15, color: colors.navy, paddingVertical: 0 },
  mini: { flexDirection: "row", alignItems: "center", gap: 4, height: 40, marginTop: 4, paddingHorizontal: 10, borderRadius: 12, backgroundColor: colors.white, borderWidth: 1.5, borderColor: colors.pillLine },
  miniText: { flex: 1, minWidth: 0, fontFamily: fonts.extraBold, fontSize: 16, color: colors.navy, paddingVertical: 0, fontVariant: ["tabular-nums"] },
  row: { flexDirection: "row", gap: 10, paddingVertical: 12, borderTopWidth: 1, borderTopColor: "#EDF2F9" },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  chip: { height: 36, paddingHorizontal: 12, borderRadius: 999, borderWidth: 1.5, justifyContent: "center" },
  chipOn: { backgroundColor: colors.navy, borderColor: colors.navy },
  chipOff: { backgroundColor: colors.white, borderColor: colors.lineStrong },
  kinds: { flexDirection: "row", gap: 6 },
  kind: { flex: 1, height: 46, borderRadius: 14, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, borderWidth: 1 },
  kindOn: { backgroundColor: colors.navy, borderColor: colors.navy },
  kindOff: { backgroundColor: colors.white, borderColor: colors.lineStrong },
  seg: { flexDirection: "row", padding: 4, borderRadius: 12, backgroundColor: colors.track },
  segItem: { flex: 1, height: 36, borderRadius: 9, alignItems: "center", justifyContent: "center" },
  segOn: { backgroundColor: colors.white },
});
