import { useMemo, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { CameraIcon, CheckIcon, ChevronRight, InfoIcon } from "../../components/icons";
import { Txt } from "../../components/ui/Txt";
import { colors } from "../../theme/tokens";
import { ChipGroup, Field, KindToggle, MiniField, Section, Segmented } from "./formParts";
import { logStore, nextLabel, useLogs, type LogKind } from "./logStore";

const pad = (n: number) => String(n).padStart(2, "0");
const today = () => {
  const d = new Date();
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}`;
};
const DATE_RE = /^(\d{4})[.\-/ ]\s*(\d{1,2})[.\-/ ]\s*(\d{1,2})$/;

const WEATHER = ["맑음", "구름 조금", "흐림", "비", "눈"];

const SCUBA_OPTS = {
  weightType: ["포켓", "벨트"],
  wave: ["잔잔함", "파도", "서프", "서지"],
  current: ["없음", "약함", "보통", "강함"],
  tank: ["알루미늄", "스틸"],
  gas: ["공기", "나이트록스", "트라이믹스"],
  suit: ["스킨", "웻수트", "세미드라이", "드라이"],
  suitAdd: ["후드", "베스트", "후드 베스트", "재킷", "부츠", "장갑"],
  gear: ["컴퓨터", "시계", "나침반", "라이트", "SMB", "다이브 릴", "나이프", "카메라", "액션캠", "메모 보드", "티클 스틱", "리프 훅", "스쿠터"],
  type: ["바다", "민물", "딥", "보트", "비치", "리브어보드", "월", "동굴", "고지대", "드리프트", "난파선", "얼음", "사진", "영상"],
};
const FREE_OPTS = {
  discipline: ["CWT", "CWTB", "CNF", "FIM", "STA", "DYN"],
  place: ["부이 · 라인", "풀", "비치", "보트"],
  safety: ["원 업 원 다운", "랜야드 착용", "회복 호흡", "블랙아웃·LMC 없음"],
};

type Chips = Record<string, string[]>;

const pick = <T,>(src: Record<string, T>, keys: string[]) =>
  Object.fromEntries(keys.filter((k) => src[k] !== undefined && src[k] !== "").map((k) => [k, src[k]])) as Record<string, T>;

export function LogFormScreen({ initialKind = "scuba" }: { initialKind?: LogKind }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const logs = useLogs();
  const [kind, setKind] = useState<LogKind>(initialKind);
  const [date, setDate] = useState(today());
  const [region, setRegion] = useState("");
  const [point, setPoint] = useState("");
  const [pointFocus, setPointFocus] = useState(false);
  const [buddy, setBuddy] = useState("");
  const [weather, setWeather] = useState<string[]>([]);
  const [dayNight, setDayNight] = useState<"day" | "night">("day");
  const [num, setNum] = useState<Record<string, string>>({});
  const [chips, setChips] = useState<Chips>({ weightType: ["벨트"], suit: ["웻수트"], gear: ["컴퓨터"], type: ["바다"] });
  const [memo, setMemo] = useState("");
  const [snorkel, setSnorkel] = useState({ when: "낮", vis: "맑음" });
  const [condition, setCondition] = useState(4);
  const [submitted, setSubmitted] = useState(false);

  const setN = (k: string) => (v: string) => setNum((s) => ({ ...s, [k]: v }));
  const setC = (k: string) => (v: string[]) => setChips((s) => ({ ...s, [k]: v }));

  const dateOk = DATE_RE.test(date.trim());
  const required = [dateOk, region.trim().length > 0, point.trim().length > 0];
  const requiredDone = required.filter(Boolean).length;
  const optionalFilled =
    Object.values(num).filter((v) => v.trim()).length + Object.values(chips).filter((v) => v.length).length + (weather.length ? 1 : 0) + (memo ? 1 : 0) + (buddy ? 1 : 0);

  // Bottom time is derived from entry/exit times when both are filled (HH:MM).
  const bottomTime = useMemo(() => {
    const p = (s?: string) => (s && /^\d{1,2}:\d{2}$/.test(s) ? Number(s.split(":")[0]) * 60 + Number(s.split(":")[1]) : null);
    const a = p(num.timeIn);
    const b = p(num.timeOut);
    return a !== null && b !== null && b > a ? String(b - a) : "";
  }, [num.timeIn, num.timeOut]);

  const pointSuggestions = useMemo(() => {
    const q = point.trim();
    if (!q) return [];
    const seen = new Map<string, { point: string; region: string; n: number }>();
    logs.forEach((l) => {
      if (l.point.includes(q)) {
        const key = `${l.region}|${l.point}`;
        const cur = seen.get(key);
        seen.set(key, { point: l.point, region: l.region, n: (cur?.n ?? 0) + 1 });
      }
    });
    return Array.from(seen.values()).slice(0, 3);
  }, [point, logs]);

  const save = (thenDiary: boolean) => {
    setSubmitted(true);
    if (requiredDone < 3) return;
    const m = date.trim().match(DATE_RE)!;
    const iso = `${m[1]}-${pad(Number(m[2]))}-${pad(Number(m[3]))}`;
    const summary =
      kind === "scuba"
        ? [num.maxDepth && `최대 ${num.maxDepth}m`, (num.bottom || bottomTime) && `${num.bottom || bottomTime}분`, num.waterTemp && `${num.waterTemp}°C`].filter(Boolean).join(" · ")
        : kind === "free"
          ? [num.bestDepth && `최고 ${num.bestDepth}m`, num.dives && `${num.dives}회`, num.longest && `최장 ${num.longest}`].filter(Boolean).join(" · ")
          : `${snorkel.when} · 시야 ${snorkel.vis === "맑음" ? "좋음" : snorkel.vis}`;
    const log = logStore.add({
      kind,
      date: iso,
      region: region.trim(),
      point: point.trim(),
      title: memo.trim().slice(0, 24) || `${point.trim()}에서`,
      summary: summary || "기록 저장됨",
      coverKind: kind === "snorkel" ? "boxfish" : kind === "free" ? "puffer" : "whitetip",
      coverBg: kind === "snorkel" ? "#3C8AD0" : "#1B4F86",
      stickers: [],
      extraStickers: 0,
      draft: thenDiary,
      details:
        kind === "snorkel"
          ? { when: snorkel.when, waterClarity: snorkel.vis, memo }
          : kind === "free"
            ? { ...pick(num, ["bestDepth", "longest", "dives", "waterTemp", "vis", "weight", "eq"]), ...pick(chips, ["discipline", "freePlace", "freeSafety"]), weather, buddy, memo, condition }
            : {
                ...pick(num, ["surfTemp", "interval", "waterTemp", "timeIn", "barIn", "vis", "bottom", "avgDepth", "maxDepth", "timeOut", "barOut", "weight", "o2"]),
                ...(bottomTime && !num.bottom ? { bottom: bottomTime } : {}),
                ...pick(chips, ["safety", "weightType", "wave", "current", "tank", "gas", "suit", "suitAdd", "gear", "type"]),
                weather,
                dayNight,
                buddy,
                memo,
              },
    });
    if (thenDiary) router.replace({ pathname: "/diary/[logId]/write", params: { logId: log.id } });
    else router.replace({ pathname: "/log/[id]", params: { id: log.id } });
  };

  return (
    <SafeAreaView edges={["top"]} style={styles.root}>
      <View style={styles.header}>
        <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.headerBtn}>
          <Txt size={15} weight="bold" color={colors.ink2}>
            취소
          </Txt>
        </Pressable>
        <View style={{ alignItems: "center" }}>
          <Txt accessibilityRole="header" size={16} weight="black">
            {kind === "snorkel" ? "새 스노클링 기록" : "새 다이빙 기록"}
          </Txt>
          <Txt size={11} color={colors.ink2}>
            {kind === "snorkel" ? "30초면 끝 · 그다음 그림일기" : "1단계 로그 · 2단계 그림일기"}
          </Txt>
        </View>
        <Pressable accessibilityRole="button" style={[styles.headerBtn, { alignItems: "flex-end" }]}>
          <Txt size={14} weight="bold" color={colors.oceanBlue}>
            임시저장
          </Txt>
        </Pressable>
      </View>
      <View style={styles.progress} accessibilityLabel="진행 단계 1/2">
        <View style={[styles.progressBar, { backgroundColor: colors.oceanBlue }]} />
        <View style={styles.progressBar} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={[styles.content, { paddingBottom: 150 + insets.bottom }]} keyboardShouldPersistTaps="handled">
          <KindToggle value={kind} onChange={setKind} />

          <Section title="기본 정보" note="* 3개만 필수">
            <View style={{ flexDirection: "row", gap: 12, alignItems: "flex-start" }}>
              <View style={styles.diveNo} accessibilityLabel={`기록 번호 ${nextLabel(kind)}`}>
                <Txt size={9} weight="extraBold" color={colors.ink3}>
                  {kind === "snorkel" ? "snorkel" : "dive no."}
                </Txt>
                <Txt size={24} weight="black">
                  {nextLabel(kind).replace("#", "")}
                </Txt>
              </View>
              <View style={{ flex: 1 }}>
                <Field
                  label="날짜"
                  required
                  value={date}
                  onChangeText={setDate}
                  keyboardType="numbers-and-punctuation"
                  hint="오늘 날짜로 미리 채웠어요"
                  error={submitted && !dateOk ? "2026.11.04처럼 입력해 주세요" : undefined}
                />
              </View>
            </View>
            <Field
              label="지역"
              required
              value={region}
              onChangeText={setRegion}
              placeholder="예) 필리핀 · 세부 말라파스쿠아"
              error={submitted && !region.trim() ? "지역을 적어 주세요" : undefined}
            />
            <View>
              <Field
                label="포인트"
                required
                value={point}
                onChangeText={setPoint}
                onFocus={() => setPointFocus(true)}
                onBlur={() => setTimeout(() => setPointFocus(false), 150)}
                placeholder="예) 가토 섬"
                error={submitted && !point.trim() ? "포인트 이름을 적어 주세요" : undefined}
                hint="GPS 좌표는 저장하지 않아요. 이름만 남겨요."
              />
              {pointFocus && pointSuggestions.length > 0 ? (
                <View style={styles.suggest} accessibilityRole="list">
                  {pointSuggestions.map((s) => (
                    <Pressable
                      key={`${s.region}${s.point}`}
                      accessibilityRole="button"
                      onPress={() => {
                        setPoint(s.point);
                        if (!region) setRegion(s.region);
                        setPointFocus(false);
                      }}
                      style={styles.suggestRow}
                    >
                      <Txt size={14} weight="bold">
                        {s.point}
                      </Txt>
                      <Txt size={12} color={colors.ink2}>
                        내가 다녀온 곳 · {s.n}회
                      </Txt>
                    </Pressable>
                  ))}
                </View>
              ) : null}
            </View>
            {kind !== "snorkel" ? <Field label="버디" value={buddy} onChangeText={setBuddy} placeholder="함께 들어간 사람 (쉼표로 여러 명)" /> : null}
          </Section>

          {kind === "snorkel" ? (
            <Section title="한 번씩만 톡" optional>
              <Txt size={12} weight="bold" color={colors.ink2}>
                언제
              </Txt>
              <Segmented label="시간대" options={[["아침", "아침"], ["낮", "낮"], ["해 질 녘", "해 질 녘"]]} value={snorkel.when} onChange={(when) => setSnorkel((s) => ({ ...s, when }))} />
              <Txt size={12} weight="bold" color={colors.ink2}>
                물빛
              </Txt>
              <Segmented label="물빛 (시야)" options={[["흐림", "흐림"], ["보통", "보통"], ["맑음", "맑음"]]} value={snorkel.vis} onChange={(vis) => setSnorkel((s) => ({ ...s, vis }))} />
              <Field label="한 줄 메모" value={memo} onChangeText={setMemo} maxLength={60} placeholder="예) 보트 기다리다 거북복 봤다" />
              <View style={styles.note}>
                <InfoIcon size={16} />
                <Txt size={12} color={colors.ink2} style={{ flex: 1 }}>
                  스노클링은 수심·시간·장비를 묻지 않아요. 다이브 번호 대신 S1, S2…로 따로 쌓여요.
                </Txt>
              </View>
            </Section>
          ) : (
            <Section title="날씨" optional>
              <ChipGroup options={WEATHER} value={weather} onChange={setWeather} single />
              {kind === "scuba" ? (
                <Segmented
                  label="낮 또는 밤"
                  options={[
                    ["day", "낮 다이빙 · Day"],
                    ["night", "나이트 다이빙 · Night"],
                  ]}
                  value={dayNight}
                  onChange={setDayNight}
                />
              ) : null}
            </Section>
          )}

          {kind === "scuba" ? (
            <>
              <Section title="수면 · 수중 기록" optional>
                <View style={styles.grid3}>
                  <MiniField label="수면 온도" unit="°C" keyboardType="decimal-pad" value={num.surfTemp ?? ""} onChangeText={setN("surfTemp")} />
                  <MiniField label="수면 휴식" placeholder="시:분" value={num.interval ?? ""} onChangeText={setN("interval")} />
                  <MiniField label="수중 온도" unit="°C" keyboardType="decimal-pad" value={num.waterTemp ?? ""} onChangeText={setN("waterTemp")} />
                </View>
                <View style={styles.grid3}>
                  <MiniField label="입수 시간" placeholder="09:12" value={num.timeIn ?? ""} onChangeText={setN("timeIn")} />
                  <MiniField label="입수 잔압" unit="bar" keyboardType="number-pad" value={num.barIn ?? ""} onChangeText={setN("barIn")} />
                  <MiniField label="시야" unit="m" keyboardType="decimal-pad" value={num.vis ?? ""} onChangeText={setN("vis")} />
                </View>
                <View style={styles.grid3}>
                  <MiniField label="잠수 시간" unit="min" keyboardType="number-pad" value={num.bottom ?? bottomTime} onChangeText={setN("bottom")} />
                  <MiniField label="평균 수심" unit="m" keyboardType="decimal-pad" value={num.avgDepth ?? ""} onChangeText={setN("avgDepth")} />
                  <MiniField label="최대 수심" unit="m" keyboardType="decimal-pad" value={num.maxDepth ?? ""} onChangeText={setN("maxDepth")} />
                </View>
                <View style={styles.grid3}>
                  <MiniField label="출수 시간" placeholder="09:58" value={num.timeOut ?? ""} onChangeText={setN("timeOut")} />
                  <MiniField label="출수 잔압" unit="bar" keyboardType="number-pad" value={num.barOut ?? ""} onChangeText={setN("barOut")} />
                  <View style={{ flex: 1 }}>
                    <Txt size={12} weight="extraBold">
                      안전정지
                    </Txt>
                    <ChipGroup options={["5m 3분"]} value={chips.safety ?? []} onChange={setC("safety")} />
                  </View>
                </View>
                <View style={styles.note}>
                  <InfoIcon size={16} />
                  <Txt size={12} color={colors.ink2} style={{ flex: 1 }}>
                    다이브 컴퓨터 화면을 보면서 그대로 옮겨 적어 주세요. 입·출수 시간을 적으면 잠수 시간이 자동으로 채워져요.
                  </Txt>
                </View>
              </Section>
              <Section title="장비 · 환경" optional>
                <ChipGroup label="웨이트" sub="Weight" options={SCUBA_OPTS.weightType} value={chips.weightType ?? []} onChange={setC("weightType")} single />
                <MiniField label="웨이트 무게" unit="kg" keyboardType="decimal-pad" value={num.weight ?? ""} onChangeText={setN("weight")} />
                <ChipGroup label="파도" sub="Water" options={SCUBA_OPTS.wave} value={chips.wave ?? []} onChange={setC("wave")} single />
                <ChipGroup label="조류" sub="Current" options={SCUBA_OPTS.current} value={chips.current ?? []} onChange={setC("current")} single />
                <ChipGroup label="탱크" sub="Tank" options={SCUBA_OPTS.tank} value={chips.tank ?? []} onChange={setC("tank")} single />
                <ChipGroup label="기체" sub="Gas" options={SCUBA_OPTS.gas} value={chips.gas ?? []} onChange={setC("gas")} single />
                {chips.gas?.includes("나이트록스") ? <MiniField label="산소 비율" unit="%" keyboardType="number-pad" value={num.o2 ?? ""} onChangeText={setN("o2")} /> : null}
                <ChipGroup label="슈트" sub="Suit" options={SCUBA_OPTS.suit} value={chips.suit ?? []} onChange={setC("suit")} single />
                <ChipGroup label="추가 보온" options={SCUBA_OPTS.suitAdd} value={chips.suitAdd ?? []} onChange={setC("suitAdd")} />
                <ChipGroup label="장비" sub="Equipment" options={SCUBA_OPTS.gear} value={chips.gear ?? []} onChange={setC("gear")} />
                <ChipGroup label="종류" sub="Dive Type" options={SCUBA_OPTS.type} value={chips.type ?? []} onChange={setC("type")} />
              </Section>
            </>
          ) : null}

          {kind === "free" ? (
            <>
              <Section title="세션 기록" optional>
                <ChipGroup label="종목" sub="Discipline" options={FREE_OPTS.discipline} value={chips.discipline ?? []} onChange={setC("discipline")} />
                <ChipGroup label="장소" options={FREE_OPTS.place} value={chips.freePlace ?? []} onChange={setC("freePlace")} single />
                <View style={styles.grid3}>
                  <MiniField label="최고 수심" unit="m" keyboardType="decimal-pad" value={num.bestDepth ?? ""} onChangeText={setN("bestDepth")} />
                  <MiniField label="최장 잠수" placeholder="1:12" value={num.longest ?? ""} onChangeText={setN("longest")} />
                  <MiniField label="다이브" unit="회" keyboardType="number-pad" value={num.dives ?? ""} onChangeText={setN("dives")} />
                </View>
                <View style={styles.grid3}>
                  <MiniField label="수온" unit="°C" keyboardType="decimal-pad" value={num.waterTemp ?? ""} onChangeText={setN("waterTemp")} />
                  <MiniField label="시야" unit="m" keyboardType="decimal-pad" value={num.vis ?? ""} onChangeText={setN("vis")} />
                  <MiniField label="웨이트" unit="kg" keyboardType="decimal-pad" value={num.weight ?? ""} onChangeText={setN("weight")} />
                </View>
              </Section>
              <Section title="몸 상태 · 안전" optional>
                <Txt size={12} weight="bold" color={colors.ink2}>
                  컨디션
                </Txt>
                <View style={{ flexDirection: "row", gap: 8 }} accessibilityRole="adjustable" accessibilityValue={{ min: 1, max: 5, now: condition }}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Pressable key={n} accessibilityLabel={`컨디션 ${n}점`} onPress={() => setCondition(n)} style={[styles.dot, n <= condition && styles.dotOn]} />
                  ))}
                </View>
                <Field label="이퀄라이징 · 컨트랙션" value={num.eq ?? ""} onChangeText={setN("eq")} placeholder="예) 프렌젤 · 16m 이후 살짝 압박" />
                <ChipGroup label="안전 체크" options={FREE_OPTS.safety} value={chips.freeSafety ?? []} onChange={setC("freeSafety")} />
              </Section>
            </>
          ) : null}

          {kind !== "snorkel" ? (
            <Section title="만난 생물" optional>
              <Pressable accessibilityRole="button" onPress={() => router.push("/discover")} style={styles.addSpecies}>
                <View style={styles.addIcon}>
                  <CameraIcon />
                </View>
                <View style={{ flex: 1 }}>
                  <Txt size={14} weight="bold">
                    사진으로 생물 추가
                  </Txt>
                  <Txt size={12} color={colors.ink2}>
                    확정한 생물은 그림일기 스티커로도 쓸 수 있어요
                  </Txt>
                </View>
                <ChevronRight color={colors.ink3} />
              </Pressable>
            </Section>
          ) : null}

          {kind !== "snorkel" ? (
            <Section title="메모" optional>
              <Field label="메모" value={memo} onChangeText={setMemo} multiline placeholder="강사·가이드에게 남길 말이나 특이사항" style={{ minHeight: 48 }} />
            </Section>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={[styles.footer, { paddingBottom: 12 + insets.bottom }]}>
        <View style={styles.footerInfo}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }} accessibilityLiveRegion="polite">
            {requiredDone === 3 ? <CheckIcon color={colors.success} /> : null}
            <Txt size={12} weight="extraBold" color={requiredDone === 3 ? colors.success : colors.coral}>
              {requiredDone === 3 ? "필수 3개 입력 완료" : `필수 ${3 - requiredDone}개 남았어요`}
            </Txt>
          </View>
          <Txt size={12} color={colors.ink2}>
            선택 항목 {optionalFilled}개 입력
          </Txt>
        </View>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <Pressable accessibilityRole="button" onPress={() => save(false)} style={styles.secondary}>
            <Txt size={14} weight="bold">
              로그만 저장
            </Txt>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={() => save(true)} style={styles.primary}>
            <Txt size={15} weight="black" color={colors.white}>
              저장하고 그림일기 쓰기
            </Txt>
            <ChevronRight color={colors.white} />
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.mist },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 8 },
  headerBtn: { width: 72, height: 44, justifyContent: "center", paddingHorizontal: 8 },
  progress: { flexDirection: "row", gap: 6, paddingTop: 8, paddingHorizontal: 16 },
  progressBar: { flex: 1, height: 4, borderRadius: 2, backgroundColor: colors.line },
  content: { paddingTop: 14, paddingHorizontal: 16, gap: 12 },
  diveNo: { width: 64, height: 72, marginTop: 22, borderRadius: 14, borderWidth: 2, borderColor: colors.navy, alignItems: "center", justifyContent: "center", backgroundColor: colors.sky },
  suggest: { marginTop: 6, borderRadius: 14, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, overflow: "hidden" },
  suggestRow: { paddingVertical: 10, paddingHorizontal: 14, flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderBottomWidth: 1, borderBottomColor: "#EDF2F9" },
  grid3: { flexDirection: "row", gap: 8 },
  note: { flexDirection: "row", gap: 6, alignItems: "flex-start" },
  dot: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: colors.ghostLine },
  dotOn: { backgroundColor: colors.oceanBlue, borderColor: colors.oceanBlue },
  addSpecies: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: 16, borderWidth: 1.5, borderStyle: "dashed", borderColor: colors.pillLine, backgroundColor: colors.mist },
  addIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.oceanBlue, alignItems: "center", justifyContent: "center" },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: 12,
    paddingHorizontal: 16,
    gap: 10,
    backgroundColor: "rgba(255,255,255,0.97)",
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  footerInfo: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  secondary: { width: 112, height: 52, borderRadius: 16, borderWidth: 1.5, borderColor: colors.lineStrong, backgroundColor: colors.white, alignItems: "center", justifyContent: "center" },
  primary: { flex: 1, height: 52, borderRadius: 16, backgroundColor: colors.oceanBlue, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 },
});
