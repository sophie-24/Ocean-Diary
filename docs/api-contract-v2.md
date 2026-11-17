# OCEAN DIARY API v2 추가 계약 (로그북 · 명소 · 지도)

마지막 갱신: 2026-11-04 · 기존 `api-contract-v1.md`(업로드·식별·발견·계정)는 그대로 유효하고, 아래가 더해진다.
인증은 v1과 같은 Supabase Bearer 토큰. 오류 형식도 v1과 같다 (`{"error": {"code", "request_id"}}`).

## 위치 원칙
- GPS 좌표는 저장하지 않는다. 지역(`region_label`)·포인트(`point_label`) **이름**만 저장한다.
- `details` 안에 `lat`, `lng`, `latitude`, `longitude`, `gps`, `coords`, `location` 키가 있으면 `422`로 거부한다.

## 다이빙 로그
| 메서드 | 경로 | 설명 |
|---|---|---|
| POST | `/v1/dive-logs` | 생성. `Idempotency-Key` 헤더 필수. 사용자당 시간당 60회 |
| GET | `/v1/dive-logs?kind=&limit=&cursor=` | 최신순 목록 + 종류별 `counts` |
| GET | `/v1/dive-logs/{id}` | 상세 (연결된 발견 생물 `species` 포함) |
| PATCH | `/v1/dive-logs/{id}` | 부분 수정 (그림일기 글·스티커 배치 포함) |
| DELETE | `/v1/dive-logs/{id}` | 숨김 처리. 연결된 발견은 도감에 남고 연결만 끊긴다 |

생성 본문 — 필수는 `kind`, `dive_date`, `region_label`, `point_label` 네 개(종류 + 화면의 필수 3개):
```json
{ "kind": "scuba", "dive_date": "2026-11-01", "region_label": "필리핀 · 세부 말라파스쿠아",
  "point_label": "가토 섬", "title": null, "details": { "maxDepth": "18", "bottom": "52" },
  "site_id": null, "is_draft": false }
```
- `kind`: `scuba` | `free` | `snorkel`. 번호는 종류별로 따로 매긴다 → 응답 `label`: `#39`, `F13`, `S7`.
- `details`: 종류별 선택 항목 (자유 형식 JSON, 8KB 이하).
- `site_id`: 명소를 고르면 처음 방문일로 스탬프가 찍힌다 (더 이른 날짜 로그가 생기면 그 날짜로 바뀜).

PATCH 추가 필드:
- `diary_text`: 500자 이하.
- `sticker_layout`: 최대 60개. `{id, type: "sticker"|"critter", kind, x, y, scale, rot, flip?}` — 좌표는 338×218 그림 칸 기준.
- 필수 필드(`dive_date`, `region_label`, `point_label`)는 `null`로 지울 수 없다.

## 발견 ↔ 로그 연결
- `POST /v1/observations`, `PATCH /v1/observations/{id}`에 `dive_log_id`(선택) 추가. 본인 로그만 연결 가능 (아니면 `404 DIVE_LOG_NOT_FOUND`).

## 명소 · 장소 · 요약
| 메서드 | 경로 | 설명 |
|---|---|---|
| GET | `/v1/dive-sites?category=` | 명소 40곳 (인증 불필요) |
| GET | `/v1/site-stamps` | 내 명소 스탬프 |
| GET | `/v1/places` | 내가 기록한 지역별 묶음 (로그 수, 기간, 포인트, 만난 생물) — 지도·장소 수조용 |
| GET | `/v1/me/summary` | 홈 요약: 수집 종 수 / 전체 181종, 만남 수, 종류별 로그 수, 스탬프 수 |

## 생물 카탈로그
- `GET /v1/species` 응답에 `catalog_no`, `group_ko`, `subgroup_ko`, `common_name_en`, `art_key` 추가.
- v2 도감 181종은 `data/species/species-v3.json`에서 시드된다. id는 도감 번호에서 만든 고정 UUID라 환경이 달라도 같다.
