export type Phase = "dawn" | "day" | "dusk" | "night";

export const PHASES: Phase[] = ["dawn", "day", "dusk", "night"];

export const phaseOf = (hour: number): Phase =>
  hour >= 5 && hour < 7 ? "dawn" : hour >= 7 && hour < 17 ? "day" : hour >= 17 && hour < 19 ? "dusk" : "night";

/** Lighting per phase: overlay gradient stops (top → bottom), light-shaft opacity and HUD copy. */
export const PHASE_LOOK: Record<Phase, { label: string; dot: string; tint: [string, string, string]; rays: number; note: string }> = {
  dawn: { label: "새벽", dot: "#F2A983", tint: ["rgba(255,186,150,0.26)", "rgba(90,90,170,0.18)", "rgba(10,24,64,0.22)"], rays: 0.5, note: "물빛이 천천히 밝아지고 있어요" },
  day: { label: "한낮", dot: "#F7C948", tint: ["rgba(0,0,0,0)", "rgba(0,0,0,0)", "rgba(0,0,0,0)"], rays: 1, note: "모두 깨어 있어요 · 만다린피쉬는 산호 틈에 숨었어요" },
  dusk: { label: "해 질 녘", dot: "#E9774F", tint: ["rgba(255,140,80,0.30)", "rgba(130,64,150,0.30)", "rgba(8,18,56,0.42)"], rays: 0.45, note: "만다린피쉬가 나와 짝짓기 춤을 춰요" },
  night: { label: "밤", dot: "#2B3F7A", tint: ["rgba(4,12,40,0.56)", "rgba(3,10,34,0.63)", "rgba(2,8,28,0.7)"], rays: 0, note: "백기흉상어가 사냥을 나섰어요 · 나폴레옹은 자는 중" },
};

export const clockLabel = (d = new Date()) => `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
