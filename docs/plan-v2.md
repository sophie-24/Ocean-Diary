# OCEAN DIARY v2 개발 계획

마지막 갱신: 2026-11-04

v1(MVP)은 "사진 한 장 → AI 후보 확인 → 발견 저장"만 다뤘다. v2는 디자인 캔버스에서 확정한 5개 탭 전체를 iOS 우선으로 출시한다. 이 문서는 v1 문서(`feature-spec-v1.md`, `api-contract-v1.md`)보다 우선한다. 충돌하는 v1 규칙은 아래 "v1에서 바뀌는 것"에 적는다.

## 1. 확정한 결정

| 항목 | 결정 |
|---|---|
| 플랫폼 | iOS 먼저 출시, 같은 코드로 Android 확장 (Expo / React Native 유지) |
| 로그인 | Supabase Auth 유지 (이메일 코드). 서버는 기존 JWKS 검증 코드 재사용 |
| 위치 | GPS 좌표는 저장하지 않음. 지역·포인트 **이름**만 저장 |
| 출시 범위 | 홈 · 도감 · 발견 · 로그북 · 나의 바다 5개 탭 모두 |
| 서버 | FastAPI + PostgreSQL + S3 호환 저장소 + worker 유지 |
| 배포 | AWS (아래 6장) |

### v1에서 바뀌는 것

- 범위 밖이던 **지도·다이브 로그·수족관(바다 꾸미기)** 이 출시 범위에 들어온다.
- 도감이 한국 연안 7종 SVG → **181종 + 명소 40곳**, 일러스트는 WebP로 바뀐다 (`data/species/species-v3.json`, `data/sites/sites-v1.json`).
- 디자인 톤이 연두 그림책 → 네이비/하늘색 필드 가이드로 바뀐다.
- 로그 입력 화면의 GPS 칸은 만들지 않는다 (결정 반영).

## 2. 앱 구조 (apps/mobile)

- 화면 이동: `expo-router` 파일 기반 라우팅. 진입점 `expo-router/entry`.
- 탭: `app/(tabs)/` 아래 `index`(홈) · `dogam` · `discover` · `log` · `sea`. 커스텀 `TabBar`(가운데 발견 버튼, 나의 바다에서 다크).
- 공통 기반: `src/theme/tokens.ts`(색·폰트·간격), `src/components/ui/*`(Txt, ScreenHeader, Chip), `src/components/Critter.tsx`(일러스트 + 미수집 실루엣).
- 에셋: `assets/illustrations/species/*.webp`(32종), `assets/illustrations/sites/*.webp`(8장). 키 목록은 `src/data/illustrations.ts`.
- 기존 v1 화면(`App.tsx`)은 `src/legacy/LegacyApp.tsx`로 옮겨 두었다. 업로드·식별·저장 로직을 발견 탭으로 옮긴 뒤 삭제한다.

### 캔버스 화면 → 라우트

| 캔버스 | 라우트 | 상태 |
|---|---|---|
| 01 홈 | `(tabs)/index` | 자리 표시 |
| 03 도감 그리드 · 명소 스탬프 | `(tabs)/dogam` | **구현 (목업 수집 데이터)** |
| 03 생물 상세 | `species/[no]` | 예정 |
| 02 발견 4단계 | `(tabs)/discover` → `discover/*` | 예정 (v1 로직 이식) |
| 04 로그 목록 / 입력(스쿠버·프리·스노클) / 상세 | `(tabs)/log`, `log/new`, `log/[id]` | 예정 |
| 04 그림일기 글쓰기 · 꾸미기 | `diary/[logId]/write`, `diary/[logId]/decorate` | 예정 |
| 05 수조(산호초·대양·마크로) · 장소 수조 | `(tabs)/sea`, `sea/tank/[id]`, `sea/place/[id]` | 예정 |
| 05 세계 지도 | `sea/map` | 예정 (`data/map/world-map.json` 경로 데이터 사용) |

### 웹 캔버스와 다르게 구현할 것

- 애니메이션(유영·3D 턴·조명): CSS → `react-native-reanimated`.
- 바다 소리: 브라우저 합성 → 녹음된 루프 음원 + `expo-audio` (파도 / 바닷속 고요 / 다이버 숨소리 / 끄기). 음원 확보 필요.
- 지도: 미리 계산한 SVG 경로 + `react-native-svg`, 확대/이동은 제스처로.

## 3. 데이터 모델 v2 (서버)

기존 테이블(species, media_assets, identification_jobs/candidates, observations, rate limit, tombstone)은 유지하고 아래를 더한다.

- `species` 재시드: 181종, `catalog_no`, `group`, `subgroup`, `name_en`, `art_key` 컬럼 추가.
- `dive_sites`: 명소 40곳 (category, 이름, 국가, 지역, art_key).
- `dive_logs`: user_id, `kind`(scuba / free / snorkel), 날짜, 지역명, 포인트명 (필수 3개), 그 외 선택 필드는 종류별 JSON(`details`)으로. 다이브 번호는 scuba/free만, snorkel은 별도 번호(S1…).
- `diary_entries`: dive_log_id 1:1, 본문(500자 제한), 스티커 배치 JSON.
- `site_stamps`: user_id, site_id, 처음 찍은 날짜, 근거 log_id.
- `observations`에 `dive_log_id`(nullable) 추가 → "이 다이빙에서 만난 생물".

## 4. 단계와 완료 기준

1. **정리** — 기준 커밋, 임시 폴더 정리, 이 문서. ✅
2. **UI 기반** — 토큰·폰트·일러스트·5탭 뼈대·도감 화면. ✅ (타입 검사, iOS 번들 export 통과)
3. **프론트엔드** — 홈 → 발견 → 생물 상세 → 로그북·그림일기 → 나의 바다 순서로 화면 구현. 서버 대신 `src/mocks`의 목업 데이터 사용.
4. **서버** — 3장의 테이블·마이그레이션·API, 181종 재시드.
5. **연동** — 목업을 API 호출로 교체, v1 업로드/식별 로직을 발견 탭으로 이식, `LegacyApp` 삭제.
6. **배포** — AWS 구성, EAS로 iOS 빌드 → TestFlight → App Store.

## 5. iOS 출시 준비물

- Apple Developer Program 계정, 번들 ID `com.oceandiary.app` 소유 확인.
- `eas.json`에 iOS 빌드 프로필 추가 (현재 Android만 있음).
- 앱 아이콘·스플래시를 새 브랜드로 교체.
- 개인정보 처리방침 URL, App Privacy 항목(사진, 이메일, 사용 데이터).

## 6. AWS 배포 목표 구성

- API·worker: ECR 이미지 → ECS Fargate (API는 ALB 뒤, worker는 별도 서비스).
- DB: RDS for PostgreSQL. 저장소: S3 (사진은 비공개 + 서명 URL, 일러스트는 CloudFront).
- 비밀값: Secrets Manager (DB, OpenAI 키, Supabase service role 키).
- 필요한 것: API용 Dockerfile, 운영 환경 설정, GitHub Actions(테스트 → 이미지 빌드 → 배포).
