// Field-guide copy for a few species. The full set will come from the species API (phase 4).

export type SpeciesFacts = {
  family: string;
  iucn?: string;
  size: string;
  habitat: string;
  depth: string;
  food: string;
  didYouKnow: string;
  manner?: string;
};

export const MOCK_FACTS: Record<string, SpeciesFacts> = {
  "001": {
    family: "고래상어과",
    iucn: "IUCN 위기(EN)",
    size: "보통 5.5–10m, 드물게 18m",
    habitat: "열대·아열대 바다의 표층, 플랑크톤이 많은 연안",
    depth: "주로 0–50m, 1,000m 넘게 잠수하기도 해요",
    food: "플랑크톤, 물고기 알, 작은 물고기",
    didYouKnow: "몸의 흰 점 무늬가 사람 지문처럼 저마다 달라서, 사진으로 한 마리씩 구별할 수 있어요.",
    manner: "3m 이상 거리를 두고, 몸을 만지거나 앞길을 막지 않아요.",
  },
  "006": {
    family: "흉상어과",
    iucn: "IUCN 취약(VU)",
    size: "보통 1.6m 이하",
    habitat: "인도-태평양의 산호초, 동굴과 바위 아래",
    depth: "주로 8–40m",
    food: "산호초 물고기, 문어, 갑각류",
    didYouKnow: "많은 상어와 달리 바닥에 가만히 누운 채로도 숨을 쉴 수 있어요. 낮에는 동굴에서 쉬다가 밤이 되면 산호 틈을 뒤지며 사냥해요.",
    manner: "쉬고 있는 상어에게 다가가거나 동굴 입구를 막지 않아요.",
  },
  "007": {
    family: "환도상어과",
    iucn: "IUCN 위기(EN)",
    size: "보통 3m 안팎, 꼬리가 몸 길이의 절반",
    habitat: "먼바다와 깊은 바다, 새벽에 얕은 클리닝 스테이션",
    depth: "주로 10–150m",
    food: "무리 지은 작은 물고기, 오징어",
    didYouKnow: "긴 꼬리를 채찍처럼 휘둘러 물고기 무리를 기절시킨 뒤 먹어요.",
    manner: "스트로브는 끄고, 클리닝 스테이션 가장자리에서 조용히 지켜봐요.",
  },
  "026": {
    family: "돛양태과",
    size: "6cm 안팎",
    habitat: "얕은 산호 잔해와 가지산호 사이",
    depth: "주로 1–18m",
    food: "작은 갑각류, 동물성 플랑크톤",
    didYouKnow: "해 질 녘이 되면 암수가 짝을 지어 천천히 떠오르며 짝짓기 춤을 춰요.",
    manner: "밝은 조명을 정면으로 비추지 말고, 붉은빛이나 약한 빛으로 봐요.",
  },
};

export type EncounterRecord = { round: number; date: string; place: string; meta: string; first: boolean; logLabel?: string };

export const MOCK_ENCOUNTERS: Record<string, EncounterRecord[]> = {
  "006": [
    { round: 1, date: "2025.04.15", place: "보홀 · 발리카삭", meta: "수심 18m · 사진 2장", first: true },
    { round: 2, date: "2025.11.22", place: "세부 모알보알 · 페스카도르 섬", meta: "수심 22m · 영상 0:15", first: false },
    { round: 3, date: "2026.11.01", place: "말라파스쿠아 · 가토 섬", meta: "수심 16m · 동굴", first: false, logLabel: "로그북 #36" },
  ],
  "007": [{ round: 1, date: "2026.11.02", place: "말라파스쿠아 · 모나드 숄", meta: "수심 24m · 사진 3장", first: true, logLabel: "로그북 #38" }],
  "026": [{ round: 1, date: "2026.11.01", place: "말라파스쿠아 · 라이트하우스", meta: "수심 7m · 해 질 녘", first: true, logLabel: "로그북 #37" }],
};

export const REGULAR_BADGE_GOAL = 5;
