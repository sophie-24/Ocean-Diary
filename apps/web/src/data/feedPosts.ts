import { FeedSlideProps } from "@/components/feed/FeedSlide";
import { colors } from "@/theme/tokens";

/**
 * Mola content calendar — one entry per Instagram carousel post.
 *
 * Each post resolves to an ordered array of FeedSlideProps. The /preview/feed
 * routes render these directly so copy edits ship without touching components.
 *
 * Schema:
 *   slug     — kebab-case id used in the URL (/preview/feed/<slug>)
 *   week     — ISO week label, e.g. "W48"
 *   day      — Mon/Tue/Wed/Thu/Fri/Sat/Sun (just for sorting)
 *   kind     — "carousel" | "reel" | "threads" (Reels + Threads carry no
 *              slides; they live here only for the caption + hashtag copy)
 *   pillar   — which content pillar this post belongs to (M01…M09, T01…T05)
 *   title    — human-readable title (shown in the preview index)
 *   caption  — Instagram caption body (1인칭 평어체 + emoji, OLBA tone)
 *   hashtags — flat array; preview page joins with spaces
 *   slides   — array of FeedSlideProps (empty for reel/threads)
 */

export type FeedPost = {
  slug: string;
  week: string;
  day: "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";
  kind: "carousel" | "reel" | "threads";
  pillar: string;
  title: string;
  caption: string;
  hashtags: string[];
  slides: FeedSlideProps[];
};

// ---------------------------------------------------------------------------
// Palette shortcuts — every post uses token colors, never hardcoded hex.
// ---------------------------------------------------------------------------
const palette = {
  ocean: colors.oceanBlue,
  navy: colors.navy,
  deep: colors.deepSea,
  mist: colors.mist,
  sky: colors.sky,
  coral: colors.coral,
  sunny: colors.sunny,
} as const;

// Reusable tag for diver-targeted hashtags.
const CORE_TAGS = [
  "다이빙",
  "스쿠버다이빙",
  "프리다이빙",
  "다이빙로그",
  "다이빙기록",
  "mola",
  "molamola",
  "다이빙앱",
];

// ---------------------------------------------------------------------------
// W48 — 2026-11-23 (Mon) → 2026-11-29 (Sun)
// ---------------------------------------------------------------------------

export const feedPosts: FeedPost[] = [
  // ---------------------------------------------------------------- Mon T01
  {
    slug: "w48-mon-t01-maker-log",
    week: "W48",
    day: "Mon",
    kind: "threads",
    pillar: "T01",
    title: "Threads · 메이커 로그 (수조 drift)",
    caption: `오늘 Mola 수조 작업.

CSS keyframe으로 20초 짜리 drift 루프 넣었는데
물고기 18마리가 한 프레임에 겹치지 않게 배치하는 게 하루 반 걸렸음.

랜딩에 켜놓고 보니까
진짜 가만히 보게 되더라.
10분 만들어서 1시간 멍때릴 수 있으면 흑자.

내일부터 수요일까지 3일간 한 종씩 소개해요.
첫 타자는 만다린피쉬.`,
    hashtags: ["메이커로그", "스타트업", "앱만들기", "다이빙앱", "mola"],
    slides: [],
  },

  // ---------------------------------------------------------------- Tue T03
  {
    slug: "w48-tue-t03-today-dive",
    week: "W48",
    day: "Tue",
    kind: "threads",
    pillar: "T03",
    title: "Threads · 오늘의 다이빙 추천 (라자 암팟)",
    caption: `다이빙 포인트 100곳 중에
"평생 한 번은" 소리 나오는 곳 하나 던져볼게요.

📍 라자 암팟, 인도네시아

- 생물 다양성 세계 1위 공인
- 20분 수중에 만다린피쉬 짝짓기 댄스 보는 거 가능
- 보트 다이빙만 가능, 11–3월이 베스트

가본 분 손 들어주세요 🤿
갈 계획 있는 분은 저장해두시고.`,
    hashtags: [
      "라자암팟",
      "rajaampat",
      "다이빙여행",
      "해외다이빙",
      "다이빙포인트",
      "스쿠버다이빙",
    ],
    slides: [],
  },

  // ---------------------------------------------------------------- Wed M01
  {
    slug: "w48-wed-m01-mandarin",
    week: "W48",
    day: "Wed",
    kind: "carousel",
    pillar: "M01",
    title: "캐러셀 · 다이버 90%가 모르는 만다린피쉬 3가지",
    caption: `다음 다이빙에 눈 뜨고 보려면 저장해두세요 🐠

만다린피쉬, 작고 알록달록해서 유명하지만
정작 다이버 90%가 못 보고 올라와요.

1️⃣ 짝짓기 댄스는 일몰 직후 20분만
2️⃣ 다 자라도 6cm, 라이트 없으면 거의 못 봄
3️⃣ 비늘이 없어서 점액 독으로 몸을 감싸요

Mola 도감에도 들어있어요.
본 다이빙 날짜만 체크하면 수조에 자동으로 들어와요 🫧

프로필 링크에서 더 보기 →`,
    hashtags: [
      "만다린피쉬",
      "mandarinfish",
      ...CORE_TAGS,
      "수중사진",
      "해양생물",
    ],
    slides: [
      // Cover
      {
        brandLabel: "Mola · 오늘의 바다",
        toneLine: "다이버 90%가 모르는",
        bigCopy: ["만다린피쉬의", "비밀 3가지"],
        description: "다음 다이빙에 눈 뜨고 보려면 저장",
        critter: { kind: "mandarin", size: 480 },
        tag: "수집 03",
        bgColor: palette.ocean,
      },
      // Secret 01
      {
        brandLabel: "Secret 01",
        toneLine: "짝짓기 댄스는",
        bigCopy: ["해지는", "20분만"],
        description:
          "일몰 직후 딱 20분. 그 시간 아니면 산호 틈에 숨어버려요. 시간 못 맞추면 다이빙 10번에 한 번 볼까 말까.",
        critter: {
          kind: "mandarin",
          size: 340,
          offset: { right: 120, bottom: 200 },
        },
        tag: "01 / 03",
        bgColor: palette.deep,
      },
      // Secret 02
      {
        brandLabel: "Secret 02",
        toneLine: "전설의 다 자란 사이즈",
        bigCopy: ["손가락", "하나 크기"],
        description:
          "최대 6cm. 라이트 없으면 산호 틈 어둠에 묻혀서 거의 못 봐요. 다이빙 가이드가 가리켜줘도 못 찾기로 유명.",
        critter: {
          kind: "mandarin",
          size: 320,
          offset: { right: 140, bottom: 220 },
          rotate: -8,
        },
        tag: "02 / 03",
        bgColor: palette.navy,
      },
      // Secret 03
      {
        brandLabel: "Secret 03",
        toneLine: "만지면 큰일 나는 이유",
        bigCopy: ["비늘이", "없어요"],
        description:
          "대신 독성 점액으로 몸 전체를 감싸고 있어요. 컬러도 그 점액에서 나오는 것. 절대 만지지 말기.",
        critter: {
          kind: "mandarin",
          size: 360,
          offset: { right: 100, bottom: 180 },
          rotate: 6,
        },
        tag: "03 / 03",
        bgColor: palette.ocean,
      },
      // CTA
      {
        brandLabel: "Mola · 수집",
        toneLine: "다음 다이빙",
        bigCopy: ["체크 한 번,", "수조에 쏙"],
        description:
          "본 날짜만 기록하면 내 수조에 자동으로 들어와요. 다이빙 안 간 날에도 보러 가요.",
        critter: {
          kind: "mandarin",
          size: 300,
          offset: { right: 140, bottom: 240 },
        },
        tag: "@molamola_log",
        bgColor: palette.sunny,
        inkColor: colors.navy,
        softInkColor: "rgba(22, 40, 90, 0.72)",
      },
    ],
  },

  // ---------------------------------------------------------------- Thu M03
  {
    slug: "w48-thu-m03-diary",
    week: "W48",
    day: "Thu",
    kind: "carousel",
    pillar: "M03",
    title: "캐러셀 · 다이빙 로그 안 쓰면 1년 뒤 후회함",
    caption: `다이빙 10번 중 9번은 1년이면 기억에서 사라져요.
"어디서 뭐 봤더라..." 하면 끝.

Mola는 그래서 이렇게 만들었어요:
한 줄만 적으면 — 수채 그림일기로 바뀝니다.
스티커도 자유롭게 붙여요 🪸✨

예시 3편 넘겨보세요 👉

쓰기 귀찮던 분, 지금 시작하면 내년 이맘때 보물이에요.
프로필 링크 →`,
    hashtags: [
      "다이빙로그",
      "다이빙기록",
      "다이빙일기",
      "로그북",
      "다이빙앱",
      ...CORE_TAGS,
    ],
    slides: [
      // Cover
      {
        brandLabel: "Mola · 로그북",
        toneLine: "쓰기 귀찮으면",
        bigCopy: ["1년 뒤", "후회해요"],
        description: "다이빙 10번 중 9번은 기억에서 사라져요",
        critter: { kind: "whale", size: 500 },
        tag: "로그 00",
        bgColor: palette.deep,
      },
      // Sample 01
      {
        brandLabel: "Sample 01",
        toneLine: "내가 입력한 한 줄",
        bigCopy: ['"라이온피쉬', '3마리 봤음"'],
        description:
          "→ Mola가 수채 그림일기로 자동 생성. 산호 배경과 라이온피쉬 스티커 함께 추천.",
        critter: { kind: "lionfish", size: 360 },
        tag: "01 / 03",
        bgColor: palette.ocean,
      },
      // Sample 02
      {
        brandLabel: "Sample 02",
        toneLine: "내가 입력한 한 줄",
        bigCopy: ['"상어 떼', '살짝 무서움"'],
        description:
          "→ 심해 배경 + 해머헤드 스티커 자동 추천. 감정도 그림 톤으로 반영돼요.",
        critter: { kind: "hammerhead", size: 400 },
        tag: "02 / 03",
        bgColor: palette.navy,
      },
      // Sample 03
      {
        brandLabel: "Sample 03",
        toneLine: "내가 입력한 한 줄",
        bigCopy: ['"고래 등', '타고 싶었음"'],
        description:
          "→ 상상 삽화도 OK. 꿈 다이빙·버킷 리스트도 똑같이 그림일기로 남아요.",
        critter: { kind: "whale", size: 420 },
        tag: "03 / 03",
        bgColor: palette.ocean,
      },
      // CTA
      {
        brandLabel: "Mola · 로그북",
        toneLine: "다음 다이빙부터",
        bigCopy: ["한 줄이면", "일기 1편"],
        description: "스티커도 자유롭게. @molamola_log · 프로필 링크",
        critter: { kind: "seabunny", size: 320 },
        tag: "시작하기",
        bgColor: palette.mist,
        inkColor: colors.navy,
        softInkColor: "rgba(22, 40, 90, 0.68)",
      },
    ],
  },

  // ---------------------------------------------------------------- Fri M04
  {
    slug: "w48-fri-m04-dive-story",
    week: "W48",
    day: "Fri",
    kind: "reel",
    pillar: "M04",
    title: "Reel · Dive Story (Mola UI 프레임 + 수중 영상 20초)",
    caption: `다이빙 안 가는 주말에도
내 수조는 열려있어요 🫧

20초 미리보기:
- 내가 본 종만 등장하는 개인 수조
- Mola 앱 UI에서 바로 재생
- 스티커로 다꾸(다이버 꾸미기) 가능
- 백색소음 ASMR 모드

다이빙 인터벌 때 숨 돌리면서 보기 딱 좋아요.
프로필 링크에서 앱 열면 내 수조 바로 시작 🤿`,
    hashtags: [
      "물멍",
      "온라인다이빙",
      "다이빙ASMR",
      "수중영상",
      "힐링",
      ...CORE_TAGS,
    ],
    slides: [],
  },

  // ---------------------------------------------------------------- Sat M05
  {
    slug: "w48-sat-m05-aquarium-asmr",
    week: "W48",
    day: "Sat",
    kind: "reel",
    pillar: "M05",
    title: "Reel · 수조 ASMR 15초 루프",
    caption: `주말에 아무것도 안 해도 돼요.
수조만 열어두세요 🫧

- 실제 스쿠버 호흡 소리
- 물고기 18마리 3개 depth 레이어
- 15초 심리스 루프

소리 켜고 ↑↑↑ 볼륨 올려서 보세요.
저녁 샤워 후 조명 어둡게 하고 틀어놓으면 베스트.

프로필 링크에서 실제 앱 수조도 열어볼 수 있어요.`,
    hashtags: ["ASMR", "물멍", "힐링영상", "수면ASMR", "underwater", ...CORE_TAGS],
    slides: [],
  },

  // ---------------------------------------------------------------- Sun M08
  {
    slug: "w48-sun-m08-meme",
    week: "W48",
    day: "Sun",
    kind: "carousel",
    pillar: "M08",
    title: "밈 · 다이빙 간다고 하면 친구들 반응 4단계",
    caption: `공감하면 ❤️
다이버 친구 있으면 태그해주세요.

다음 주에는 한 종씩 더 깊게 소개할게요 🐠`,
    hashtags: [
      "다이빙밈",
      "스쿠버다이버",
      "다이빙짤",
      "다이버일상",
      ...CORE_TAGS,
    ],
    slides: [
      // Cover
      {
        brandLabel: "Mola · 일요밈",
        toneLine: "다이빙 간다고 하면",
        bigCopy: ["친구들 반응", "4단계"],
        description: "공감 100% 보장",
        critter: { kind: "pikachu", size: 440 },
        tag: "밈 01",
        bgColor: palette.sunny,
        inkColor: colors.navy,
        softInkColor: "rgba(22, 40, 90, 0.7)",
      },
      // Step 1
      {
        brandLabel: "01 / 04",
        toneLine: "첫 반응",
        bigCopy: ['"오 멋있다"'],
        description: "→ 사진 두세 장 보여주면 리액션 끝. 이후 관심 없음.",
        critter: { kind: "boxfish", size: 360 },
        tag: "friend 1",
        bgColor: palette.ocean,
      },
      // Step 2
      {
        brandLabel: "02 / 04",
        toneLine: "두 번째 반응",
        bigCopy: ['"안 무서워?"'],
        description: "→ 상어 얘기 꺼내면 바로 소재 바뀌어요.",
        critter: { kind: "hammerhead", size: 400 },
        tag: "friend 2",
        bgColor: palette.navy,
      },
      // Step 3
      {
        brandLabel: "03 / 04",
        toneLine: "세 번째 반응",
        bigCopy: ['"장비값', '얼만데?"'],
        description: "→ 설명 끝나면 조용해짐. 월급 다 쓴 사람 보는 눈빛.",
        critter: { kind: "puffer", size: 360 },
        tag: "friend 3",
        bgColor: palette.deep,
      },
      // Step 4
      {
        brandLabel: "04 / 04",
        toneLine: "네 번째 반응",
        bigCopy: ['"나도 배워', '볼까..?"'],
        description: "→ 이 반응 나오면 바로 Mola 링크 보내주세요.",
        critter: { kind: "seabunny", size: 380 },
        tag: "friend 4",
        bgColor: palette.coral,
      },
    ],
  },
];

export function getPostBySlug(slug: string): FeedPost | undefined {
  return feedPosts.find((p) => p.slug === slug);
}
