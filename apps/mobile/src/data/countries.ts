/**
 * Dive countries catalog. ISO 3166-1 alpha-2 codes plus Korean / English names,
 * continent, flag emoji, and a short list of notable sub-regions for the
 * 미방문 state's "다이빙 성지" section.
 *
 * `nameKo` MUST match the `country` field in `data/sites/sites-v1.json` so the
 * sites catalog resolves to a country without a separate mapping table.
 */

export type Continent = "아시아" | "오세아니아" | "유럽" | "아메리카" | "아프리카";

export type CountryEntry = {
  iso: string;
  nameKo: string;
  nameEn: string;
  continent: Continent;
  flag: string;
  /** Famous sub-regions / dive sites for the 미방문 recommendation strip. */
  notableSites?: string[];
};

// Sites catalog as of this write covers: 필리핀, 이집트, 호주, 미국, 멕시코, 팔라우,
// 인도네시아, 키프로스, 이탈리아, 바누아투, 미크로네시아, 영국령 버진아일랜드,
// 케이맨 제도, 스페인, 그레나다, 벨리즈, 바하마, 아이슬란드, 러시아, 일본,
// 이스라엘, 그리스. Extending with the diving destinations divers travel to most
// so the "미방문" tier isn't empty for popular targets.
export const COUNTRIES: CountryEntry[] = [
  // ─────── 아시아 ───────
  { iso: "PH", nameKo: "필리핀", nameEn: "Philippines", continent: "아시아", flag: "🇵🇭", notableSites: ["세부", "팔라완", "보홀", "바탕가스"] },
  { iso: "ID", nameKo: "인도네시아", nameEn: "Indonesia", continent: "아시아", flag: "🇮🇩", notableSites: ["발리", "라자 암팟", "코모도", "술라웨시"] },
  { iso: "TH", nameKo: "태국", nameEn: "Thailand", continent: "아시아", flag: "🇹🇭", notableSites: ["시밀란 제도", "꼬따오", "푸켓"] },
  { iso: "MY", nameKo: "말레이시아", nameEn: "Malaysia", continent: "아시아", flag: "🇲🇾", notableSites: ["시파단", "라양라양"] },
  { iso: "JP", nameKo: "일본", nameEn: "Japan", continent: "아시아", flag: "🇯🇵", notableSites: ["오키나와", "이즈 반도"] },
  { iso: "MV", nameKo: "몰디브", nameEn: "Maldives", continent: "아시아", flag: "🇲🇻", notableSites: ["아리환초", "바아환초"] },
  { iso: "IL", nameKo: "이스라엘", nameEn: "Israel", continent: "아시아", flag: "🇮🇱", notableSites: ["에일랏"] },
  { iso: "KR", nameKo: "대한민국", nameEn: "South Korea", continent: "아시아", flag: "🇰🇷", notableSites: ["제주도", "울릉도"] },
  { iso: "SA", nameKo: "사우디아라비아", nameEn: "Saudi Arabia", continent: "아시아", flag: "🇸🇦", notableSites: ["얀부"] },
  { iso: "AE", nameKo: "아랍에미리트", nameEn: "United Arab Emirates", continent: "아시아", flag: "🇦🇪", notableSites: ["푸자이라"] },

  // ─────── 오세아니아 ───────
  { iso: "AU", nameKo: "호주", nameEn: "Australia", continent: "오세아니아", flag: "🇦🇺", notableSites: ["그레이트 베리어 리프", "닝갈루 리프", "로드 하우"] },
  { iso: "FJ", nameKo: "피지", nameEn: "Fiji", continent: "오세아니아", flag: "🇫🇯", notableSites: ["베카 라군", "소모소모 해협"] },
  { iso: "NZ", nameKo: "뉴질랜드", nameEn: "New Zealand", continent: "오세아니아", flag: "🇳🇿", notableSites: ["푸어 나이츠", "밀포드 사운드"] },
  { iso: "PW", nameKo: "팔라우", nameEn: "Palau", continent: "오세아니아", flag: "🇵🇼", notableSites: ["블루 코너", "저먼 채널", "젤리피쉬 레이크"] },
  { iso: "FM", nameKo: "미크로네시아", nameEn: "Micronesia", continent: "오세아니아", flag: "🇫🇲", notableSites: ["축 라군"] },
  { iso: "VU", nameKo: "바누아투", nameEn: "Vanuatu", continent: "오세아니아", flag: "🇻🇺", notableSites: ["SS 쿨리지"] },

  // ─────── 유럽 ───────
  { iso: "IS", nameKo: "아이슬란드", nameEn: "Iceland", continent: "유럽", flag: "🇮🇸", notableSites: ["실프라"] },
  { iso: "GB", nameKo: "영국", nameEn: "United Kingdom", continent: "유럽", flag: "🇬🇧", notableSites: ["스캐퍼 플로우"] },
  { iso: "ES", nameKo: "스페인", nameEn: "Spain", continent: "유럽", flag: "🇪🇸", notableSites: ["카나리아 제도", "카프레라"] },
  { iso: "IT", nameKo: "이탈리아", nameEn: "Italy", continent: "유럽", flag: "🇮🇹", notableSites: ["사르데냐", "포르토피노"] },
  { iso: "GR", nameKo: "그리스", nameEn: "Greece", continent: "유럽", flag: "🇬🇷", notableSites: ["산토리니", "크레타"] },
  { iso: "CY", nameKo: "키프로스", nameEn: "Cyprus", continent: "유럽", flag: "🇨🇾", notableSites: ["제노비아 난파선"] },
  { iso: "HR", nameKo: "크로아티아", nameEn: "Croatia", continent: "유럽", flag: "🇭🇷", notableSites: ["비스 섬"] },
  { iso: "PT", nameKo: "포르투갈", nameEn: "Portugal", continent: "유럽", flag: "🇵🇹", notableSites: ["아조레스"] },
  { iso: "NO", nameKo: "노르웨이", nameEn: "Norway", continent: "유럽", flag: "🇳🇴", notableSites: ["로포텐"] },
  { iso: "RU", nameKo: "러시아", nameEn: "Russia", continent: "유럽", flag: "🇷🇺", notableSites: ["백해"] },
  { iso: "TR", nameKo: "터키", nameEn: "Türkiye", continent: "유럽", flag: "🇹🇷", notableSites: ["카쉬"] },
  { iso: "MT", nameKo: "몰타", nameEn: "Malta", continent: "유럽", flag: "🇲🇹", notableSites: ["고조 섬"] },

  // ─────── 아메리카 ───────
  { iso: "US", nameKo: "미국", nameEn: "United States", continent: "아메리카", flag: "🇺🇸", notableSites: ["하와이", "플로리다 키스", "캘리포니아"] },
  { iso: "MX", nameKo: "멕시코", nameEn: "Mexico", continent: "아메리카", flag: "🇲🇽", notableSites: ["세노테", "코수멜", "소코로"] },
  { iso: "CA", nameKo: "캐나다", nameEn: "Canada", continent: "아메리카", flag: "🇨🇦", notableSites: ["밴쿠버 섬"] },
  { iso: "CU", nameKo: "쿠바", nameEn: "Cuba", continent: "아메리카", flag: "🇨🇺", notableSites: ["하르디네스 데 라 레이나"] },
  { iso: "BS", nameKo: "바하마", nameEn: "Bahamas", continent: "아메리카", flag: "🇧🇸", notableSites: ["안드로스 블루홀", "비미니"] },
  { iso: "KY", nameKo: "케이맨 제도", nameEn: "Cayman Islands", continent: "아메리카", flag: "🇰🇾", notableSites: ["그랜드 케이맨"] },
  { iso: "VG", nameKo: "영국령 버진아일랜드", nameEn: "British Virgin Islands", continent: "아메리카", flag: "🇻🇬", notableSites: ["RMS 로드 로저스"] },
  { iso: "GD", nameKo: "그레나다", nameEn: "Grenada", continent: "아메리카", flag: "🇬🇩", notableSites: ["비앙카 C"] },
  { iso: "BZ", nameKo: "벨리즈", nameEn: "Belize", continent: "아메리카", flag: "🇧🇿", notableSites: ["그레이트 블루홀"] },
  { iso: "CR", nameKo: "코스타리카", nameEn: "Costa Rica", continent: "아메리카", flag: "🇨🇷", notableSites: ["코코 섬"] },
  { iso: "EC", nameKo: "에콰도르", nameEn: "Ecuador", continent: "아메리카", flag: "🇪🇨", notableSites: ["갈라파고스"] },
  { iso: "CO", nameKo: "콜롬비아", nameEn: "Colombia", continent: "아메리카", flag: "🇨🇴", notableSites: ["말펠로"] },

  // ─────── 아프리카 ───────
  { iso: "EG", nameKo: "이집트", nameEn: "Egypt", continent: "아프리카", flag: "🇪🇬", notableSites: ["홍해", "샤름 엘 셰이크", "다합"] },
  { iso: "ZA", nameKo: "남아프리카공화국", nameEn: "South Africa", continent: "아프리카", flag: "🇿🇦", notableSites: ["알리왈 숄", "소다나 베이"] },
  { iso: "SC", nameKo: "세이셸", nameEn: "Seychelles", continent: "아프리카", flag: "🇸🇨", notableSites: ["알다브라"] },
  { iso: "MU", nameKo: "모리셔스", nameEn: "Mauritius", continent: "아프리카", flag: "🇲🇺", notableSites: ["포인트 오 피아망"] },
  { iso: "MG", nameKo: "마다가스카르", nameEn: "Madagascar", continent: "아프리카", flag: "🇲🇬", notableSites: ["노시 비"] },
  { iso: "TZ", nameKo: "탄자니아", nameEn: "Tanzania", continent: "아프리카", flag: "🇹🇿", notableSites: ["펨바", "잔지바르"] },
  { iso: "SD", nameKo: "수단", nameEn: "Sudan", continent: "아프리카", flag: "🇸🇩", notableSites: ["Sha'ab Rumi"] },
];

export const COUNTRY_BY_NAME_KO: Record<string, CountryEntry> = Object.fromEntries(
  COUNTRIES.map((c) => [c.nameKo, c]),
);

export const COUNTRY_BY_ISO: Record<string, CountryEntry> = Object.fromEntries(
  COUNTRIES.map((c) => [c.iso, c]),
);

export const CONTINENTS: readonly Continent[] = [
  "아시아",
  "오세아니아",
  "유럽",
  "아메리카",
  "아프리카",
] as const;

/** Lookup by Korean country name (tolerant to whitespace). Returns undefined when not catalogued. */
export function findCountry(nameKo: string | null | undefined): CountryEntry | undefined {
  if (!nameKo) return undefined;
  return COUNTRY_BY_NAME_KO[nameKo.trim()];
}