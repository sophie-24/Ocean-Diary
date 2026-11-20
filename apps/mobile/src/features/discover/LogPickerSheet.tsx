import { Modal, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CheckIcon } from "../../components/icons";
import { Txt } from "../../components/ui/Txt";
import { colors } from "../../theme/tokens";
import { KIND_LABEL, type DiveLog } from "../log/logStore";

type Props = {
  /** Shooting date (YYYY-MM-DD) the choice applies to. */
  date: string | null;
  logs: DiveLog[];
  selectedId: string | null | undefined;
  onPick: (logId: string | null) => void;
  onClose: () => void;
};

const fmt = (ymd: string) => {
  const [, m, d] = ymd.split("-").map(Number);
  return `${m}월 ${d}일`;
};

/**
 * Pick which dive log the photos of one shooting date belong to. Same-day logs come first,
 * then the rest of the logbook (for photos whose camera clock was off).
 */
export function LogPickerSheet({ date, logs, selectedId, onPick, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const sameDay = date ? logs.filter((l) => l.date === date) : [];
  const others = logs.filter((l) => !sameDay.includes(l)).slice(0, 30);

  const Row = ({ log }: { log: DiveLog }) => {
    const on = selectedId === log.id;
    const time = typeof log.details.timeIn === "string" ? ` · ${log.details.timeIn} 입수` : "";
    return (
      <Pressable
        accessibilityRole="radio"
        accessibilityState={{ checked: on }}
        onPress={() => onPick(log.id)}
        style={[styles.row, on && styles.rowOn]}
      >
        <View style={styles.label}>
          <Txt size={13} weight="black" color={colors.oceanBlue}>
            {log.label}
          </Txt>
        </View>
        <View style={{ flex: 1 }}>
          <Txt size={15} weight="bold" numberOfLines={1}>
            {log.region} {log.point}
          </Txt>
          <Txt size={12} color={colors.ink2}>
            {fmt(log.date)} · {KIND_LABEL[log.kind]}
            {time}
          </Txt>
        </View>
        {on ? <CheckIcon size={18} color={colors.oceanBlue} /> : null}
      </Pressable>
    );
  };

  return (
    <Modal transparent animationType="slide" visible onRequestClose={onClose}>
      <Pressable accessibilityLabel="닫기" onPress={onClose} style={styles.scrim} />
      <View style={[styles.sheet, { paddingBottom: 16 + insets.bottom }]} accessibilityViewIsModal>
        <View style={styles.grabber} />
        <Txt accessibilityRole="header" size={18} weight="black">
          {date ? `${fmt(date)} 사진을 어느 다이빙에 넣을까요?` : "어느 다이빙의 사진인가요?"}
        </Txt>
        <ScrollView style={{ maxHeight: 420 }} contentContainerStyle={{ gap: 8, paddingTop: 12 }}>
          {sameDay.length ? (
            <Txt size={12} weight="extraBold" color={colors.ink2}>
              같은 날 기록
            </Txt>
          ) : null}
          {sameDay.map((l) => (
            <Row key={l.id} log={l} />
          ))}
          {others.length ? (
            <Txt size={12} weight="extraBold" color={colors.ink2} style={{ marginTop: sameDay.length ? 8 : 0 }}>
              다른 날 기록
            </Txt>
          ) : null}
          {others.map((l) => (
            <Row key={l.id} log={l} />
          ))}
          <Pressable
            accessibilityRole="radio"
            accessibilityState={{ checked: selectedId === null }}
            onPress={() => onPick(null)}
            style={[styles.row, selectedId === null && styles.rowOn]}
          >
            <Txt size={15} weight="bold" style={{ flex: 1 }}>
              로그에 연결하지 않기
            </Txt>
            {selectedId === null ? <CheckIcon size={18} color={colors.oceanBlue} /> : null}
          </Pressable>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: { flex: 1, backgroundColor: "rgba(9,25,56,0.45)" },
  sheet: { paddingTop: 10, paddingHorizontal: 20, backgroundColor: colors.mist, borderTopLeftRadius: 12, borderTopRightRadius: 12 },
  grabber: { alignSelf: "center", width: 40, height: 5, borderRadius: 3, backgroundColor: colors.lineStrong, marginBottom: 12 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, minHeight: 56, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 12, backgroundColor: colors.white, borderWidth: 1.5, borderColor: colors.line },
  rowOn: { borderColor: colors.oceanBlue, backgroundColor: "#F0F4FA" },
  label: { minWidth: 44, paddingHorizontal: 6, paddingVertical: 4, borderRadius: 8, backgroundColor: colors.sky, alignItems: "center" },
});
