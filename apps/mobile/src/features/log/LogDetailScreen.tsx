import { useState, type ReactNode } from "react";
import { Alert, Platform, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Critter } from "../../components/Critter";
import { CheckIcon, ChevronLeft } from "../../components/icons";
import { Txt } from "../../components/ui/Txt";
import { SPECIES } from "../../data/species";
import { colors } from "../../theme/tokens";
import type { DiveLog } from "./logStore";
import { useDeleteDiveLog, useDiveLog } from "../../api/queries";
import { errorMessage } from "../../api/client";
import { StateView } from "../../components/ui/StateView";

const SPECIES_NAME: Record<string, string> = {};
SPECIES.forEach((sp) => {
  if (sp.art && !SPECIES_NAME[sp.art]) SPECIES_NAME[sp.art] = sp.nameKo;
});

const formatDate = (iso: string) => {
  const d = new Date(`${iso}T00:00:00`);
  return Number.isNaN(d.getTime()) ? iso : `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 (${"일월화수목금토"[d.getDay()]})`;
};

/** Reads one detail value as display text (arrays are joined with commas). */
const detail = (log: DiveLog, key: string) => {
  const v = log.details[key];
  const s = Array.isArray(v) ? v.join(", ") : v === undefined || v === null || v === "" || v === false ? "" : String(v);
  return s || undefined;
};
const join = (...parts: (string | undefined)[]) => parts.filter(Boolean).join(", ");

export function LogDetailScreen({ id }: { id: string }) {
  const router = useRouter();
  const { data: log, isLoading, error, refetch } = useDiveLog(id);
  const goBack = () => (router.canGoBack() ? router.back() : router.navigate("/log"));
  const remove = useDeleteDiveLog();
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const doDelete = () =>
    remove.mutate(id, {
      onSuccess: () => router.replace("/log"),
      onError: (e) => setDeleteError(errorMessage(e)),
    });
  const confirmDelete = () => {
    const msg = "이 기록과 그림일기가 지워지고 되돌릴 수 없어요. 도감에 모은 생물은 그대로 남아요.";
    if (Platform.OS === "web") {
      // eslint-disable-next-line no-alert
      if (globalThis.confirm?.(`기록을 삭제할까요?\n${msg}`)) doDelete();
      return;
    }
    Alert.alert("기록을 삭제할까요?", msg, [
      { text: "취소", style: "cancel" },
      { text: "삭제", style: "destructive", onPress: doDelete },
    ]);
  };

  if (!log) {
    return (
      <SafeAreaView style={[styles.root, { justifyContent: "center" }]}>
        <StateView loading={isLoading} error={error} onRetry={() => void refetch()} empty="기록을 찾을 수 없어요" />
      </SafeAreaView>
    );
  }

  const d = (k: string) => detail(log, k);
  const num = (k: string, unit: string) => (d(k) ? `${d(k)}${unit}` : undefined);
  const eyebrow = log.kind === "scuba" ? `${log.label.replace("#", "")}번째 다이빙` : log.kind === "free" ? `세션 ${log.label}` : `스노클링 ${log.label}`;
  const typeChip = log.kind === "scuba" ? d("type") : log.kind === "free" ? d("freePlace") : undefined;
  const dateLine = join(formatDate(log.date), log.kind === "free" ? num("bottom", "분") : undefined);
  const dayChip = join(d("weather"), log.kind === "scuba" ? (log.details.dayNight === "night" ? "밤" : "낮") : d("when"));
  const disciplines = Array.isArray(log.details.discipline) ? (log.details.discipline as string[]) : [];
  const safety = Array.isArray(log.details.freeSafety) ? (log.details.freeSafety as string[]) : [];
  const condition = typeof log.details.condition === "number" ? log.details.condition : 0;

  return (
    <SafeAreaView edges={["top"]} style={styles.root}>
      <View style={styles.header}>
        <Pressable accessibilityRole="button" accessibilityLabel="로그북 목록으로" onPress={goBack} style={styles.hit}>
          <ChevronLeft />
        </Pressable>
        <View accessibilityRole="tablist" accessibilityLabel="로그 보기" style={styles.tabs}>
          <Pressable
            accessibilityRole="tab"
            accessibilityState={{ selected: false }}
            onPress={() => router.replace({ pathname: "/diary/[logId]/decorate", params: { logId: log.id } })}
            style={styles.tab}
          >
            <Txt size={13} weight="bold" color={colors.ink2}>
              그림일기
            </Txt>
          </Pressable>
          <View accessibilityRole="tab" accessibilityState={{ selected: true }} style={[styles.tab, styles.tabOn]}>
            <Txt size={13} weight="black">
              다이빙 기록
            </Txt>
          </View>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="그림일기 글 고치기"
          onPress={() => router.push({ pathname: "/diary/[logId]/write", params: { logId: log.id } })}
          style={[styles.hit, { width: 52, alignItems: "flex-end" }]}
        >
          <Txt size={15} weight="black" color={colors.oceanBlue}>
            편집
          </Txt>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={{ paddingHorizontal: 2, paddingTop: 4 }}>
          <View style={styles.row8}>
            <Txt size={13} weight="black" color={colors.oceanBlue}>
              {eyebrow}
            </Txt>
            {typeChip ? (
              <View style={styles.typeChip}>
                <Txt size={11} weight="bold" color={colors.oceanBlue}>
                  {typeChip}
                </Txt>
              </View>
            ) : null}
            {log.draft ? (
              <View style={[styles.typeChip, { backgroundColor: "#FFF7DC" }]}>
                <Txt size={11} weight="bold" color="#6B5310">
                  작성 중
                </Txt>
              </View>
            ) : null}
          </View>
          <Txt accessibilityRole="header" size={22} weight="black" tracking={-0.02} style={{ marginTop: 4, lineHeight: 29 }}>
            {join(log.region, log.point)}
          </Txt>
          <Txt size={13} color={colors.ink2} style={{ marginTop: 2 }}>
            {dateLine}
          </Txt>
          <View style={styles.chips}>
            {dayChip ? <Chip text={dayChip} /> : null}
            {d("buddy") ? <Chip text={`버디 ${d("buddy")}`} /> : null}
            {log.kind === "free"
              ? disciplines.map((x, i) => <Chip key={x} text={x} solid={i === 0} outline={i > 0} />)
              : null}
          </View>
        </View>

        {log.kind === "free" ? (
          <View style={styles.statStrip}>
            <Stat label="최고 수심" value={d("bestDepth")} unit="m" />
            <Stat label="최장 잠수" value={d("longest")} />
            <Stat label="다이브" value={d("dives")} unit="회" />
          </View>
        ) : null}

        {log.kind === "scuba" ? (
          <Card
            title="수면, 수중 기록"
            right={d("surfTemp") || d("interval") ? `수면 ${join(num("surfTemp", "°C"), d("interval") ? `휴식 ${d("interval")}` : undefined)}` : undefined}
          >
            <View style={styles.cells}>
              <Cell label="최대 수심" value={d("maxDepth")} unit="m" />
              <Cell label="평균 수심" value={d("avgDepth")} unit="m" />
              <Cell label="잠수 시간" value={d("bottom")} unit="분" />
              <Cell label="수중 온도" value={d("waterTemp")} unit="°C" />
              <Cell label="시야" value={d("vis")} unit="m" />
              <Cell label="입수" value={d("timeIn")} />
              <Cell label="출수" value={d("timeOut")} />
              <Cell label="입수 잔압" value={d("barIn")} unit="bar" />
              <Cell label="출수 잔압" value={d("barOut")} unit="bar" />
              {d("safety") ? (
                <View style={styles.cell}>
                  <Txt size={11} weight="bold" color={colors.ink2}>
                    안전정지
                  </Txt>
                  <View style={styles.row4}>
                    <CheckIcon size={14} color={colors.success} />
                    <Txt size={14} weight="black" color={colors.success}>
                      {d("safety")}
                    </Txt>
                  </View>
                </View>
              ) : null}
            </View>
          </Card>
        ) : null}

        {log.kind === "scuba" ? (
          <>
            <Rows title="환경" rows={[["파도", d("wave")], ["조류", d("current")], ["종류", d("type")]]} />
            <Rows
              title="기체, 탱크"
              rows={[
                ["기체", join(d("gas"), d("o2") ? `${d("o2")}%` : undefined)],
                ["탱크", d("tank")],
              ]}
              gauge={d("barIn") && d("barOut") ? { from: Number(d("barIn")), to: Number(d("barOut")) } : undefined}
            />
            <Rows
              title="장비"
              rows={[
                ["웨이트", join(num("weight", "kg"), d("weightType"))],
                ["슈트", join(d("suit"), d("suitAdd"))],
                ["챙긴 장비", d("gear")],
              ]}
            />
          </>
        ) : null}

        {log.kind === "free" ? (
          <>
            <Card title="몸 상태">
              <View style={styles.dl}>
                {condition > 0 ? (
                  <DlRow label="컨디션">
                    <View style={styles.row4} accessibilityLabel={`5점 중 ${condition}점`}>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <View key={n} style={[styles.dot, { backgroundColor: n <= condition ? colors.oceanBlue : colors.line }]} />
                      ))}
                    </View>
                  </DlRow>
                ) : null}
                {d("eq") ? <DlRow label="이퀄라이징" value={d("eq")} /> : null}
                {d("memo") ? <DlRow label="메모" value={d("memo")} light /> : null}
              </View>
            </Card>
            <Rows
              title="장비, 환경"
              rows={[
                ["웨이트", num("weight", "kg")],
                ["수온", num("waterTemp", "°C")],
                ["시야", num("vis", "m")],
              ]}
            />
            {safety.length > 0 ? (
              <Card title="안전 체크">
                <View style={{ gap: 8 }}>
                  {safety.map((s) => (
                    <View key={s} style={styles.row4}>
                      <CheckIcon size={16} color={colors.success} />
                      <Txt size={14} weight="bold" color={colors.success}>
                        {s}
                      </Txt>
                    </View>
                  ))}
                </View>
              </Card>
            ) : null}
          </>
        ) : null}

        {log.kind === "snorkel" ? <Rows title="기록" rows={[["시간대", d("when")], ["물빛", d("waterClarity")], ["메모", d("memo")]]} /> : null}

        {log.kind === "scuba" && d("memo") ? <Rows title="메모" rows={[["메모", d("memo")]]} light /> : null}

        <Card
          title="만난 생물"
          action={
            <Pressable accessibilityRole="button" onPress={() => router.push("/discover")}>
              <Txt size={13} weight="black" color={colors.oceanBlue}>
                + 사진으로 추가
              </Txt>
            </Pressable>
          }
        >
          {log.stickers.length > 0 ? (
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {log.stickers.map((k) => (
                <View key={k} style={styles.critterTile}>
                  <Critter kind={k} width={100} height={52} />
                  {SPECIES_NAME[k] ? (
                    <Txt size={13} weight="black">
                      {SPECIES_NAME[k]}
                    </Txt>
                  ) : null}
                </View>
              ))}
            </View>
          ) : (
            <Txt size={13} color={colors.ink3}>
              아직 만난 생물이 없어요
            </Txt>
          )}
        </Card>

        <Pressable accessibilityRole="button" disabled={remove.isPending} onPress={confirmDelete} style={styles.deleteBtn}>
          <Txt size={14} weight="bold" color={colors.coral}>
            {remove.isPending ? "삭제하는 중…" : "이 기록 삭제"}
          </Txt>
        </Pressable>
        {deleteError ? (
          <Txt size={13} color={colors.coral} align="center">
            {deleteError}
          </Txt>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function Chip({ text, solid, outline }: { text: string; solid?: boolean; outline?: boolean }) {
  return (
    <View style={[styles.chip, solid && { backgroundColor: colors.navy }, outline && { backgroundColor: colors.white, borderWidth: 1.5, borderColor: colors.oceanBlue }]}>
      <Txt size={12} weight="bold" color={solid ? colors.white : outline ? colors.oceanBlue : colors.ink2}>
        {text}
      </Txt>
    </View>
  );
}

function Card({ title, right, action, children }: { title: string; right?: string; action?: ReactNode; children: ReactNode }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHead}>
        <Txt accessibilityRole="header" size={15} weight="black">
          {title}
        </Txt>
        {right ? (
          <Txt size={13} color={colors.ink3}>
            {right}
          </Txt>
        ) : (
          action
        )}
      </View>
      {children}
    </View>
  );
}

function DlRow({ label, value, children, light }: { label: string; value?: string; children?: ReactNode; light?: boolean }) {
  return (
    <View style={styles.dlRow}>
      <Txt size={14} color={colors.ink2} style={{ width: 96 }}>
        {label}
      </Txt>
      <View style={{ flex: 1 }}>
        {children ?? (
          <Txt size={14} weight={light ? "medium" : "black"} style={light ? { lineHeight: 21 } : undefined}>
            {value}
          </Txt>
        )}
      </View>
    </View>
  );
}

/** A white card of label/value rows; rows without a value are skipped and an empty card is not drawn. */
function Rows({ title, rows, light, gauge }: { title: string; rows: [string, string | undefined][]; light?: boolean; gauge?: { from: number; to: number } }) {
  const shown = rows.filter((r): r is [string, string] => !!r[1]);
  if (shown.length === 0) return null;
  return (
    <Card title={title}>
      <View style={styles.dl}>
        {shown.map(([k, v]) => (
          <DlRow key={k} label={k} value={v} light={light} />
        ))}
      </View>
      {gauge && gauge.from > 0 ? (
        <View style={{ marginTop: 12 }}>
          <View style={styles.gaugeLabels}>
            <Txt size={12} color={colors.ink2}>{`입수 ${gauge.from} bar`}</Txt>
            <Txt size={12} color={colors.ink2}>{`출수 ${gauge.to} bar`}</Txt>
          </View>
          <View style={styles.gaugeTrack}>
            <View style={[styles.gaugeFill, { width: `${Math.max(0, Math.min(100, (gauge.to / gauge.from) * 100))}%` }]} />
          </View>
        </View>
      ) : null}
    </Card>
  );
}

function Cell({ label, value, unit }: { label: string; value?: string; unit?: string }) {
  if (!value) return null;
  return (
    <View style={styles.cell}>
      <Txt size={11} weight="bold" color={colors.ink2}>
        {label}
      </Txt>
      <Txt size={17} weight="black" style={{ fontVariant: ["tabular-nums"] }}>
        {value}
        {unit ? (
          <Txt size={12} weight="bold" color={colors.ink2}>
            {` ${unit}`}
          </Txt>
        ) : null}
      </Txt>
    </View>
  );
}

function Stat({ label, value, unit }: { label: string; value?: string; unit?: string }) {
  return (
    <View style={styles.stat}>
      <Txt size={12} color={colors.ink2}>
        {label}
      </Txt>
      <Txt size={24} weight="black" tracking={-0.02}>
        {value ?? "—"}
        {value && unit ? (
          <Txt size={13} color={colors.ink2}>
            {unit}
          </Txt>
        ) : null}
      </Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.mist },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 8 },
  hit: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  tabs: { flexDirection: "row", padding: 3, borderRadius: 10, backgroundColor: colors.line },
  tab: { height: 34, paddingHorizontal: 12, borderRadius: 7, alignItems: "center", justifyContent: "center" },
  tabOn: { backgroundColor: colors.white },
  content: { paddingTop: 10, paddingHorizontal: 16, paddingBottom: 48, gap: 12 },
  row8: { flexDirection: "row", alignItems: "center", gap: 8 },
  row4: { flexDirection: "row", alignItems: "center", gap: 4 },
  typeChip: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, backgroundColor: colors.sky },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 8 },
  chip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 4, backgroundColor: colors.ghostBg },
  statStrip: { flexDirection: "row", gap: 1, borderRadius: 12, backgroundColor: colors.line, overflow: "hidden" },
  stat: { flex: 1, padding: 12, backgroundColor: colors.white },
  card: { paddingVertical: 16, paddingHorizontal: 18, borderRadius: 12, backgroundColor: colors.white },
  cardHead: { flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", marginBottom: 10 },
  cells: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  cell: { width: "31.5%", flexGrow: 1, paddingVertical: 8, paddingHorizontal: 10, borderRadius: 8, backgroundColor: colors.ghostBg, gap: 2 },
  dl: { gap: 10 },
  dlRow: { flexDirection: "row", gap: 12 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  gaugeLabels: { flexDirection: "row", justifyContent: "space-between" },
  gaugeTrack: { height: 10, borderRadius: 5, marginTop: 6, backgroundColor: colors.line },
  gaugeFill: { height: 10, borderRadius: 5, backgroundColor: colors.oceanBlue },
  critterTile: { minWidth: 120, flexGrow: 1, flexBasis: 120, paddingVertical: 10, paddingHorizontal: 8, borderRadius: 12, backgroundColor: colors.ghostBg, alignItems: "center", gap: 4 },
  deleteBtn: { height: 48, borderRadius: 10, backgroundColor: colors.white, alignItems: "center", justifyContent: "center" },
});
