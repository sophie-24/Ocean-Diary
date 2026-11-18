import type { CritterKind, SiteArtKey } from "./illustrations";

/**
 * 오늘의 다이빙 — region-level curation.
 *
 * The native app's `sites-v1.json` is point-level (wreck, reef, pinnacle) and
 * too granular for the "오늘은 ○○ 어때요?" card. We curate wider regions
 * here that a diver from Korea can plan a weekend around.
 *
 * Signature species are keyed to the real Mola illustration catalog
 * (apps/mobile/src/data/illustrations.ts → SPECIES_ART). If a creature you'd
 * naturally associate with a region isn't in the catalog yet (e.g. turtle,
 * manta, sardine ball), leave it out of the chip row and let the vibe line
 * mention it in words instead of drawing something we don't have.
 */

export type Season = "봄" | "여름" | "가을" | "겨울";

export type Destination = {
  /** Lower-kebab id — used for OG image route and share URL. */
  id: string;
  nameKo: string;
  nameEn: string;
  country: string;
  /** ISO 3166-1 alpha-2, same codes as apps/mobile/src/data/countries.ts. */
  countryIso: string;
  /** 한국에서의 체감 접근성 한 줄. */
  accessFromKorea: string;
  bestSeasons: Season[];
  /** 베스트 시즌 평균 수온 (°C). */
  waterTempC: string;
  level: "입문" | "오픈워터+" | "어드밴스드" | "전문가";
  /** Signature species — only keys that exist in SPECIES_ART. Max 4 fits
      the hero card width comfortably. */
  signatureSpecies: CritterKind[];
  /** Site illustration key when a region has a hero landmark (wreck, blue
      hole, cenote). Optional — most regions don't need one. */
  siteArt?: SiteArtKey;
  /** One-line mood, in the picture-diary (Gaegu) voice. */
  vibe: string;
  /** One-line practical tip. */
  tip: string;
};

export const DESTINATIONS: Destination[] = [
  {
    id: "malapascua",
    nameKo: "말라파스쿠아",
    nameEn: "Malapascua",
    country: "필리핀",
    countryIso: "PH",
    accessFromKorea: "인천→세부 4시간 + 북부 다안방안 항구 페리 1시간",
    bestSeasons: ["가을", "겨울", "봄"],
    waterTempC: "27–29",
    level: "어드밴스드",
    signatureSpecies: ["thresher", "mandarin", "mantis", "pygmy"],
    vibe: "이른 새벽, 모나드 숄에서 환도상어가 청소 받는 시간을 기다려요.",
    tip: "모나드 숄 포인트는 일출 전 입수가 룰. 5시 기상 각오.",
  },
  {
    id: "moalboal",
    nameKo: "모알보알",
    nameEn: "Moalboal",
    country: "필리핀",
    countryIso: "PH",
    accessFromKorea: "인천→세부 4시간 + 남서쪽 차량 3시간",
    bestSeasons: ["가을", "겨울", "봄"],
    waterTempC: "27–29",
    level: "입문",
    signatureSpecies: ["trevally", "barracuda", "moray", "lionfish"],
    vibe: "해변에서 50m 걸어 들어가면 정어리 떼가 눈앞에서 회오리치는 곳.",
    tip: "사르딘 런은 날씨에 따라 수심이 요동. 가이드 꼭 붙이기.",
  },
  {
    id: "apo-reef",
    nameKo: "아포 리프",
    nameEn: "Apo Reef",
    country: "필리핀",
    countryIso: "PH",
    accessFromKorea: "인천→마닐라 4시간 + 민도로 상블랑카 경유 라이브어보드",
    bestSeasons: ["가을", "겨울", "봄"],
    waterTempC: "27–29",
    level: "어드밴스드",
    signatureSpecies: ["whitetip", "barracuda", "napoleon", "trevally"],
    vibe: "라이브어보드 3박. 갑판 위에서 보는 은하수가 다이빙만큼 전설이에요.",
    tip: "건기(11–5월)만 접근 가능. 트립은 2–3개월 전 예약 필수.",
  },
  {
    id: "anilao",
    nameKo: "아닐라오",
    nameEn: "Anilao",
    country: "필리핀",
    countryIso: "PH",
    accessFromKorea: "인천→마닐라 4시간 + 차량 2.5시간",
    bestSeasons: ["겨울", "봄"],
    waterTempC: "26–28",
    level: "입문",
    signatureSpecies: ["mandarin", "pygmy", "ghostpipe", "harlequin"],
    vibe: "마크로 다이버의 성지. 돋보기 끼고 들어간다는 느낌으로.",
    tip: "카메라 + 마크로 렌즈 지참 추천. 가이드가 포인트 찾아줘요.",
  },
  {
    id: "coron",
    nameKo: "코론",
    nameEn: "Coron",
    country: "필리핀",
    countryIso: "PH",
    accessFromKorea: "인천→마닐라 4시간 + 국내선 1시간",
    bestSeasons: ["가을", "겨울", "봄"],
    waterTempC: "27–29",
    level: "오픈워터+",
    signatureSpecies: ["moray", "lionfish", "grouper", "seabunny"],
    siteArt: "ferry",
    vibe: "2차대전 일본군 수송선 12척이 가라앉은 거대한 야외 박물관.",
    tip: "렉 안으로 들어가는 포인트는 어드밴스드 이상. 신중히.",
  },
  {
    id: "tubbataha",
    nameKo: "투바타하",
    nameEn: "Tubbataha Reef",
    country: "필리핀",
    countryIso: "PH",
    accessFromKorea: "인천→마닐라→푸에르토 프린세사 환승 + 라이브어보드 6박",
    bestSeasons: ["봄"],
    waterTempC: "28–30",
    level: "어드밴스드",
    signatureSpecies: ["whale", "hammerhead", "whitetip", "trevally"],
    vibe: "유네스코 세계유산. 1년 중 3–6월만 열리는 다이빙계의 성배.",
    tip: "시즌 짧고 배 적어 최소 6개월 전 예약. 비용은 각오.",
  },
  {
    id: "dauin-apo",
    nameKo: "다윈·아포 아일랜드",
    nameEn: "Dauin & Apo Island",
    country: "필리핀",
    countryIso: "PH",
    accessFromKorea: "인천→세부→두마게티 국내선 + 차량 30분",
    bestSeasons: ["가을", "겨울", "봄"],
    waterTempC: "27–29",
    level: "입문",
    signatureSpecies: ["mandarin", "pygmy", "ghostpipe", "lionfish"],
    vibe: "리프 위를 거북이들이 떠다니는 지역. 아닐라오 뺨치는 마크로도 함께.",
    tip: "다윈에 베이스, 아포 아일랜드 트립은 날씨에 따라 취소될 수 있음.",
  },
  {
    id: "tulamben",
    nameKo: "툴람벤",
    nameEn: "Tulamben",
    country: "인도네시아",
    countryIso: "ID",
    accessFromKorea: "인천→덴파사르 7시간 + 차량 북동쪽 3시간",
    bestSeasons: ["봄", "여름", "가을"],
    waterTempC: "26–29",
    level: "입문",
    signatureSpecies: ["trevally", "barracuda", "pygmy", "mandarin"],
    siteArt: "ferry",
    vibe: "해변 그대로 걸어 들어가 USAT 리버티 렉으로. 해 지기 전 두번째 다이빙 추천.",
    tip: "검은 모래 해변에서 비치 엔트리. 다이브 부츠 필수.",
  },
  {
    id: "komodo",
    nameKo: "코모도",
    nameEn: "Komodo",
    country: "인도네시아",
    countryIso: "ID",
    accessFromKorea: "인천→덴파사르 7시간 + 국내선 라부안 바조 1시간",
    bestSeasons: ["봄", "여름", "가을"],
    waterTempC: "25–28",
    level: "어드밴스드",
    signatureSpecies: ["whitetip", "trevally", "moray", "grouper"],
    vibe: "만타 포인트가 하이라이트. 조류 강하지만 그만큼 보상이 커요.",
    tip: "라이브어보드 추천. 수상 코모도 왕도마뱀 투어 묶어서.",
  },
  {
    id: "raja-ampat",
    nameKo: "라자 암팟",
    nameEn: "Raja Ampat",
    country: "인도네시아",
    countryIso: "ID",
    accessFromKorea: "인천→자카르타→소롱→라이브어보드. 2박 이동",
    bestSeasons: ["가을", "겨울"],
    waterTempC: "28–30",
    level: "어드밴스드",
    signatureSpecies: ["epaulette", "pygmy", "harlequin", "ghostpipe"],
    vibe: "지구상 생물다양성 1위. 한번 가면 다른 바다가 심심해진다는 전설의 지역.",
    tip: "성수기 10박 라이브어보드 기본. 1년 전부터 예약하는 사람 많음.",
  },
  {
    id: "dahab",
    nameKo: "다합",
    nameEn: "Dahab",
    country: "이집트",
    countryIso: "EG",
    accessFromKorea: "인천→카이로 13시간 + 샤름 엘 셰이크 경유 차량",
    bestSeasons: ["봄", "여름", "가을"],
    waterTempC: "24–28",
    level: "오픈워터+",
    signatureSpecies: ["moray", "lionfish", "napoleon", "puffer"],
    siteArt: "bluehole",
    vibe: "홍해의 블루홀. 사막 한가운데서 걸어 들어가는 파란 심연.",
    tip: "블루홀 아치는 테크니컬 다이빙 영역. 리크리 다이버는 접근 금지.",
  },
  {
    id: "marsa-alam",
    nameKo: "마르사 알람",
    nameEn: "Marsa Alam",
    country: "이집트",
    countryIso: "EG",
    accessFromKorea: "인천→카이로 13시간 + 국내선 1.5시간",
    bestSeasons: ["가을", "겨울", "봄"],
    waterTempC: "22–27",
    level: "오픈워터+",
    signatureSpecies: ["oceanic", "moray", "grouper", "napoleon"],
    vibe: "홍해 남부. 듀공과 함께 떠다니는 드문 경험이 가능한 곳.",
    tip: "엘핀스톤 리프는 유속 센 편. 플로팅 데코 준비.",
  },
  {
    id: "maldives",
    nameKo: "몰디브",
    nameEn: "Maldives",
    country: "몰디브",
    countryIso: "MV",
    accessFromKorea: "인천→말레 9시간 + 수상비행기 또는 스피드보트",
    bestSeasons: ["겨울", "봄"],
    waterTempC: "27–30",
    level: "오픈워터+",
    signatureSpecies: ["whale", "whitetip", "silvertip", "napoleon"],
    vibe: "하니파루 베이 만타 피딩 어그리게이션은 세계 최대 규모.",
    tip: "아토별로 생물이 달라요. 아리/바/다알루 비교하고 선택.",
  },
  {
    id: "sipadan",
    nameKo: "시파단",
    nameEn: "Sipadan",
    country: "말레이시아",
    countryIso: "MY",
    accessFromKorea: "인천→코타키나발루→타와우 국내선 + 보트 3시간",
    bestSeasons: ["봄", "여름"],
    waterTempC: "27–29",
    level: "어드밴스드",
    signatureSpecies: ["barracuda", "whitetip", "trevally", "nurse"],
    vibe: "하루 다이버 수 120명 제한. 거북 보증수표에 바라쿠다 소용돌이.",
    tip: "퍼밋 선착순. 보통 리조트 체크인 전날에 할당.",
  },
  {
    id: "palau",
    nameKo: "팔라우",
    nameEn: "Palau",
    country: "팔라우",
    countryIso: "PW",
    accessFromKorea: "인천→코로르 직항 4.5시간",
    bestSeasons: ["가을", "겨울", "봄"],
    waterTempC: "27–29",
    level: "어드밴스드",
    signatureSpecies: ["whitetip", "silvertip", "napoleon", "barracuda"],
    vibe: "블루 코너·저먼 채널 조류 다이빙. 상어 벽 보러 가는 길.",
    tip: "록아일랜드 투어 묶으면 수상·수중 둘 다 챙김.",
  },
  {
    id: "okinawa-kerama",
    nameKo: "오키나와 · 케라마",
    nameEn: "Okinawa · Kerama",
    country: "일본",
    countryIso: "JP",
    accessFromKorea: "인천→나하 2시간",
    bestSeasons: ["여름", "가을"],
    waterTempC: "24–28",
    level: "입문",
    signatureSpecies: ["mandarin", "lionfish", "nurse", "pygmy"],
    vibe: "주말치기 가능. 케라마 블루라 불리는 투명도는 한번은 체험해볼 만.",
    tip: "나하→토마리 항구→케라마 고속선 50분. 당일치기 다이빙도 많음.",
  },
  {
    id: "jeju",
    nameKo: "제주 문섬·범섬",
    nameEn: "Jeju · Munseom & Beomseom",
    country: "대한민국",
    countryIso: "KR",
    accessFromKorea: "김포→제주 1시간 + 서귀포 차량 30분",
    bestSeasons: ["여름", "가을"],
    waterTempC: "16–24",
    level: "오픈워터+",
    signatureSpecies: ["moray", "boxfish", "seabunny", "pikachu"],
    vibe: "연산호 군락지. 비행기 1시간이면 열대 아닌 한국 수중을 만나요.",
    tip: "수온 낮으니 5mm 세미드라이 이상. 조류 시간 꼭 확인.",
  },
  {
    id: "great-barrier",
    nameKo: "그레이트 배리어 리프",
    nameEn: "Great Barrier Reef",
    country: "호주",
    countryIso: "AU",
    accessFromKorea: "인천→케언스 경유 10–12시간",
    bestSeasons: ["겨울", "봄"],
    waterTempC: "22–27",
    level: "오픈워터+",
    signatureSpecies: ["whitetip", "napoleon", "grouper", "tawny"],
    vibe: "지구에서 유일하게 우주에서 보이는 산호초. 라이브어보드 추천.",
    tip: "6–11월 혹등고래 이동시즌. 수상 트립 결합 가능.",
  },
];

/**
 * UTC-date-based rotation so every visitor who opens the page on the same
 * day sees the same recommendation (critical for the "오늘은 ○○ 어때요?"
 * share hook to land consistently).
 */
export function pickOfTheDay(now: Date = new Date()): Destination {
  const dayNum = Math.floor(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) /
      86_400_000,
  );
  const idx = Math.abs(dayNum) % DESTINATIONS.length;
  return DESTINATIONS[idx];
}
