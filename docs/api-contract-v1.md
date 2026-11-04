# OCEAN DIARY API·데이터 계약 v1

이 문서는 모바일 앱과 서버가 동시에 구현할 때 공통 기준으로 사용한다. 변경은 이 문서와 OpenAPI를 함께 갱신한다.

## 결정 사항

- API prefix: `/v1`; JSON은 UTF-8, 날짜/시간은 RFC 3339 UTC.
- 식별자: UUID 문자열. 목록은 커서 기반 페이지네이션.
- 인증: 관리형 인증을 사용하고 앱은 `Authorization: Bearer <access_token>` 전송. API는 Supabase JWKS 서명을 검증해 `user_id`를 얻으며 키 조회 timeout은 `SUPABASE_JWKS_TIMEOUT_SECONDS`로 설정한다(기본 5초). MVP에서 자체 비밀번호 저장/인증 API는 만들지 않는다.
- 삭제된 계정의 유효 JWT는 `account_deletion_tombstones`로 차단한다. `SUPABASE_ACCESS_TOKEN_MAX_AGE_SECONDS`는 Supabase의 최대 access-token 수명 이상이어야 하며, 그보다 긴 토큰은 API가 거부한다. 완료된 tombstone은 해당 최대 수명이 지난 뒤 worker가 삭제한다.
- 사진 업로드: API가 짧은 만료의 사전 서명 URL 발급 → 앱이 스토리지에 직접 PUT → 앱이 완료 API 호출. 완료 전 미디어는 식별/발견 저장에 사용할 수 없다.
- 같은 사용자 범위 업로드 멱등 키로 pending intent를 재시도하면 새 presigned URL을 발급하고, DB의 intent 만료 시각도 새 URL의 TTL에 맞춰 갱신한다. URL 발급 실패 시 이 갱신은 커밋하지 않는다.
- MVP 입력 매체: 사진 한 장. 동영상은 거부한다. 최초 허용 형식은 JPEG/PNG, 최대 크기 15 MiB. HEIC은 앱 변환과 서버 검증을 확인한 뒤 별도 변경으로 허용한다.
- 사용자에게는 숫자 점수 대신 `high`, `medium`, `low` 구간을 표시한다. 수치 임계값은 라벨된 사진 검증 전까지 확정하지 않는다.
- AI 공급자 이름/버전은 내부 기록이다. 후보가 카탈로그 종에 매핑되지 않으면 사용자 후보 목록에서 제외하고, 후보 없음으로 처리한다.
- 모든 사용자 리소스는 토큰의 `user_id` 소유권을 확인한다. 타 사용자 리소스 존재 여부를 노출하지 않도록 조회 실패는 `404`로 응답한다.

`GET /v1/health`는 API 프로세스 응답을 확인한다. `GET /v1/ready`는 PostgreSQL, API가 요구하는 Alembic revision `0012_retire_legacy_upload_intents`, MinIO를 확인한다. DB schema revision이 부족하면 `503`과 `dependency=database_schema`, `expected_revision`, `current_revision`을 반환하며, 이 상태에서 worker 시작 helper는 중단한다. 이 migration은 아직 유효할 수 있는 이전 버전 업로드 URL이 기존 완료 사진을 덮어쓸 수 있으면 중단하므로, 이전 API를 종료하고 기존 `UPLOAD_INTENT_TTL_SECONDS`의 최대 2배에 15분을 더한 시간이 지난 뒤 재실행한다. 미완료 업로드는 취소되고, migration은 과거 URL의 만료 시각도 보수적으로 연장해 URL 만료와 15분의 완료 유예 뒤 worker가 객체를 지우도록 키를 보존한다. 진행 중이던 임시 업로드는 다시 시작해야 한다.

## 공개 앱 설정

### `GET /v1/client-config`

사진 업로드 전 고지에 사용하는 공개 설정이다. 비밀 키나 모델 세부 설정은 반환하지 않는다.

- 외부 AI 분석이 켜져 있으면 `external_ai_processing=true`와 `external_ai_provider`를 반환한다.
- 사진 업로드 화면의 고지 문안 버전도 `external_ai_consent_version`으로 반환한다. 앱이 지원하지 않는 버전이면 업로드를 막고 앱 업데이트를 안내한다.
- `mock` 모드에서는 `external_ai_processing=false`, `external_ai_provider=null`, `external_ai_consent_version=null`을 반환한다.
- 앱은 이 설정을 확인할 수 없으면 사진 업로드를 시작하지 않는다.

예: `{ "external_ai_processing": true, "external_ai_provider": "openai", "external_ai_consent_version": "v1" }`.

## 공통 형식

### 오류

```json
{
  "error": {
    "code": "MEDIA_NOT_READY",
    "message": "사진 업로드가 완료되지 않았습니다.",
    "request_id": "req_01J..."
  }
}
```

앱은 `code`로 복구 동작을 정하고, 사용자에게 보여줄 구체적인 문구는 앱에서 한국어로 제공한다. 서버의 `message`는 일반 안내만 포함하며 검증 입력값, 토큰, 사진 주소, 스토리지 key, 공급자 원문을 포함하지 않는다. 모든 응답에 `X-Request-ID` 헤더를 제공하고 오류 본문에도 같은 값을 넣어 안전한 서버 진단에 활용한다. 예상 상태 코드는 `400` 잘못된 요청, `401` 토큰 없음/만료/서명 오류, `404` 없음 또는 소유권 불일치, `409` 상태 충돌, `413` 파일 초과, `415` 형식 미지원, `422` 필드 검증 실패, `429` 호출 제한, `503` 일시적인 인증 공급자/저장소 오류 또는 인증 설정 누락을 포함한 재시도 가능 오류다. `429` 응답은 `Retry-After`와 `RATE_LIMITED`를 반환하고, Supabase JWKS 연결이 일시적으로 실패하면 `503 AUTH_PROVIDER_UNAVAILABLE`, Supabase URL이 설정되지 않은 상태에서 Supabase 토큰을 검증하려 하면 `503 AUTH_PROVIDER_NOT_CONFIGURED`를 반환한다.

업로드 intent(20회/10분), 업로드 완료 검증(30회/10분), 미디어 삭제(30회/10분), AI 식별 시작(10회/10분), 발견 생성(60회/시간), 계정 삭제(5회/시간)를 검증된 사용자 UUID별 sliding window로 제한한다. access token이 갱신돼도 같은 사용자의 bucket은 유지된다. 미디어 ID가 다른 complete/delete 요청도 같은 사용자 bucket을 공유한다. 인증에 실패한 요청은 client IP 기준으로 제한한 뒤 인증 단계에서 거부한다. 추가로 외부 AI provider에서는 검증된 사용자별 하루 20회까지 식별 job 생성을 허용하며, 한도는 `MAX_IDENTIFICATION_JOBS_PER_USER_PER_DAY`로 조절하고 Asia/Seoul 자정에 초기화한다. 일일 한도 응답은 `429 IDENTIFICATION_DAILY_LIMIT`와 다음 자정까지의 `Retry-After`를 반환한다. 이 한도에 걸려도 직접 종 검색과 미확인 발견 저장은 계속 가능하다. `mock` provider에는 외부 비용이 없으므로 일일 한도만 적용하지 않는다. 외부 provider에서 최근 5분 동안 연속 3회 실패하면 worker와 API가 공유하는 회로 차단을 열어 실패 구간이 끝날 때까지 새 호출을 중단한다. 기본 임계값/기간은 `AI_PROVIDER_FAILURE_THRESHOLD`와 `AI_PROVIDER_CIRCUIT_WINDOW_SECONDS`로 조정하며, 열린 회로는 `503 AI_PROVIDER_CIRCUIT_OPEN`과 `Retry-After`를 반환한다. provider timeout은 `AI_PROVIDER_TIMEOUT_SECONDS`(기본 45초)로 설정한다. 한 번 성공하면 실패 횟수를 초기화한다. 안전한 worker 로그에는 처리 시간과 응답의 input/output token 수만 남기며 사진, 서명 URL, 키, 공급자 원문은 기록하지 않는다. 호출 제한과 회로 상태는 PostgreSQL advisory lock으로 여러 API/worker 프로세스가 공유한다. DB 제한 저장소를 사용할 수 없을 때는 해당 요청을 `503 RATE_LIMIT_UNAVAILABLE`로 거부한다. 만료된 호출 제한 이벤트는 24시간 후 정리한다.

삭제가 진행 중이거나 완료된 계정의 access token은 `410 ACCOUNT_DELETED`로 차단한다. 계정 삭제 재시도 경로만 이 차단을 건너뛰어 부분 정리를 마칠 수 있다.

### 공통 종 객체

```json
{
  "id": "uuid",
  "slug": "common-octopus",
  "common_name_ko": "예시 국문명",
  "scientific_name": "Example species",
  "description_ko": "짧은 한국어 설명",
  "artwork": null
}
```

대표 일러스트를 등록한 종은 `artwork`을 아래 객체로 반환한다.

```json
{
  "artwork": {
    "url": "https://cdn.example/...",
    "thumbnail_url": "https://cdn.example/...",
    "style_name": "storybook"
  }
}
```

일러스트 URL은 공개 가능하거나 만료가 충분한 URL만 반환한다. 출처/라이선스 정보는 서버 관리용 메타데이터이며 공개 API 응답에는 내부 경로를 노출하지 않는다.

## 데이터 모델 계약

### `species`

- `id UUID PK`
- `slug TEXT UNIQUE NOT NULL`
- `common_name_ko TEXT NOT NULL`
- `scientific_name TEXT NOT NULL`
- `description_ko TEXT NOT NULL`
- `taxonomy_json JSONB NULL`
- `is_active BOOLEAN NOT NULL DEFAULT true`
- `created_at`, `updated_at TIMESTAMPTZ NOT NULL`

### `species_artworks`

- `id UUID PK`, `species_id UUID FK NOT NULL`, `asset_key TEXT NOT NULL`
- `thumbnail_key TEXT NULL`, `style_name TEXT NOT NULL DEFAULT 'storybook'`
- `license_source TEXT NOT NULL`, `created_at TIMESTAMPTZ NOT NULL`
- MVP는 종별 활성 대표 이미지 1개를 사용한다. 이후 버전 관리를 위해 테이블은 분리한다.

### `media_assets`

- `id UUID PK`, `owner_user_id UUID NOT NULL`, `storage_key TEXT UNIQUE NOT NULL` (서버 처리 후 앱/AI가 읽는 최종 객체), `upload_storage_key TEXT UNIQUE NULL` (만료 전 원본 업로드 키; 외부 서명 URL 전용)
- `mime_type TEXT NOT NULL`, `byte_size BIGINT NOT NULL`, `upload_byte_size BIGINT NULL`, `upload_sha256 CHAR(64) NULL`, `width INT NULL`, `height INT NULL`; ready 상태의 `byte_size`, `sha256`, 해상도는 처리 이미지 값이며 `upload_*`는 멱등 재요청 비교를 위한 원본 요청 지문
- `sha256 TEXT NULL`, `status TEXT NOT NULL` (`pending_upload`, `processing`, `ready`, `rejected`, `deleted`); ready 상태의 체크섬은 저장된 처리 이미지 기준
- `external_ai_consent_provider TEXT NULL`, `external_ai_consent_at TIMESTAMPTZ NULL`, `external_ai_consent_version TEXT NULL`; 외부 분석 provider 및 고지 버전과 사용자가 업로드를 눌러 동의한 시각. 외부 AI를 사용하지 않으면 모두 null.
- `captured_at TIMESTAMPTZ NULL`, `created_at TIMESTAMPTZ NOT NULL`, `expires_at TIMESTAMPTZ NOT NULL`
- `deleted_at TIMESTAMPTZ NULL`, `storage_deleted_at TIMESTAMPTZ NULL`; the worker retries object deletion until `storage_deleted_at` is set
- GPS 및 불필요한 EXIF는 파생 이미지 생성 시 제거한다. 클라이언트의 서명 PUT URL은 `upload_storage_key`에만 쓸 수 있고, 정제된 최종 이미지는 별도 `storage_key`에 저장된다. worker는 URL 만료 뒤 원본 객체를 정리한다. 로컬 초안 사진은 사용자가 기록을 끝내거나 취소/로그아웃할 때 앱에서 정리한다.

### `account_deletion_tombstones`

- `user_id UUID PK`, `status TEXT NOT NULL` (`pending`, `complete`), `requested_at TIMESTAMPTZ NOT NULL`, `completed_at TIMESTAMPTZ NULL`, `block_expires_at TIMESTAMPTZ NULL`
- 정리 중 실패하면 `pending` 상태로 남아 일반 API를 계속 차단한다. API의 계정 삭제 재요청과 worker의 60초 주기 자동 재시도가 모두 pending 정리를 이어받는다. 완료되면 최대 access-token 수명 뒤 tombstone을 worker가 제거한다. 이메일 등 프로필 정보는 보관하지 않는다.

### `identification_jobs`

- `id UUID PK`, `user_id UUID NOT NULL`, `media_asset_id UUID FK NOT NULL`
- `status TEXT NOT NULL` (`queued`, `running`, `succeeded`, `failed`)
- `provider TEXT NULL`, `model_version TEXT NULL`, `error_code TEXT NULL`
- `created_at`, `started_at NULL`, `completed_at NULL` (`TIMESTAMPTZ`)
- 사용자별 같은 미디어 재호출을 제어할 수 있도록 `(user_id, media_asset_id, created_at)` 인덱스. 공급자 호출 실패는 `failed`로 끝내고 재시도는 새 job으로 만든다.

### `identification_candidates`

- `id UUID PK`, `job_id UUID FK NOT NULL`, `species_id UUID FK NULL`
- `rank SMALLINT NOT NULL` (1~3), `score REAL NULL` (내부 전용)
- `confidence_band TEXT NOT NULL` (`high`, `medium`, `low`)
- `label_raw TEXT NULL`; `(job_id, rank)` 유니크
- 앱 응답은 저신뢰 정책 적용 후 표시 가능한 후보만 포함한다. 내부 수치 점수는 앱으로 보내지 않는다.

### `observations`

- `id UUID PK`, `user_id UUID NOT NULL`, `species_id UUID FK NULL`
- `media_asset_id UUID FK NOT NULL`, `identification_job_id UUID FK NULL`
- `identified_by TEXT NOT NULL` (`ai_confirmed`, `user_selected`, `unidentified`)
- `region_label TEXT NULL` (사용자 입력 국가/지역 텍스트, 좌표 없음)
- `observed_at TIMESTAMPTZ NOT NULL`, `created_at`, `updated_at TIMESTAMPTZ NOT NULL`
- `deleted_at TIMESTAMPTZ NULL`
- `identified_by='unidentified'`이면 `species_id`는 null이어야 한다. `ai_confirmed/user_selected`이면 species_id 필수.

### 관계와 도감 집계

```text
users 1 ─ N observations N ─ 0..1 species
users 1 ─ N media_assets 1 ─ N identification_jobs 1 ─ N candidates
species 1 ─ N species_artworks
```

발견은 매번 별도 `observation`이다. 도감은 삭제되지 않은 관측을 `user_id, species_id`별로 묶어 계산한다. `species_id IS NULL`인 미확인 발견은 별도 묶음으로 제공한다. MVP에서는 중복 집계 테이블을 두지 않는다.

## 엔드포인트 계약

### 업로드

`POST /v1/media/upload-intents`

앱은 `Idempotency-Key` 헤더를 보내며 같은 사용자·같은 키 재요청은 같은 미디어 intent를 반환한다. 앱은 이 키를 업로드 요청 전에 로컬 초안에 보존하고 signed URL은 로컬에 저장하지 않는다. 이미 완료된 media라면 `status="ready"`, 빈 `upload_url`, 빈 `required_headers`가 반환되며 앱은 재전송하지 않고 식별을 계속한다.

요청:

```json
{"mime_type":"image/jpeg","byte_size":2840192,"sha256":"optional-hex","external_ai_consent_provider":"openai","external_ai_consent_version":"v1"}
```

현재 provider가 `mock`이면 동의 필드는 생략하거나 null로 보낸다. 외부 provider면 앱은 공개 client config에서 확인해 사용자에게 안내한 provider와 고지 버전을 함께 보낸다. 서버는 현재 설정과 둘 다 일치할 때만 동의 시각을 기록하고 업로드 intent를 만든다. 누락·불일치면 `409 EXTERNAL_AI_CONSENT_REQUIRED`를 반환한다. 설정이 사진 업로드 후 또는 worker 실행 전에 바뀌더라도 해당 media의 동의 provider/버전이 현재 외부 provider와 다르면 사진 바이트를 외부로 보내지 않는다.

응답 `201`:

```json
{
  "media_id":"uuid",
  "status":"pending_upload",
  "upload_url":"https://storage.example/signed-url",
  "method":"PUT",
  "required_headers":{
    "Content-Type":"image/jpeg",
    "x-amz-meta-owner-user-id":"uuid",
    "x-amz-meta-media-id":"uuid"
  },
  "expires_at":"2026-10-31T12:10:00Z",
  "max_byte_size":15728640
}
```

같은 사용자와 같은 키에 MIME, 원본 크기, 요청에 포함된 체크섬 또는 외부 AI 동의 조건이 달라지면 `409 IDEMPOTENCY_KEY_REUSED`를 반환한다. 공백 키는 `400 INVALID_IDEMPOTENCY_KEY`다. `0010` 시기에 만들어진 ready row는 원본 크기/해시를 더 이상 알 수 없으므로 `0011` migration에서 해당 지문을 null로 유지하며, 그 레거시 키는 변경 payload 검증 없이 기존 ready 결과를 돌려준다. 새 row와 migration 당시 pending row는 지문 비교를 수행한다. 완료 상태가 아닌 삭제/거부 intent는 `409 UPLOAD_INTENT_NOT_REUSABLE`을 반환하며, 앱은 해당 intent를 정리한 뒤 새 키로 업로드를 시작한다.

검증: 허용 MIME 및 15 MiB 이하. 응답 URL은 만료 후 재사용할 수 없다. 업로드 시 응답의 `required_headers`를 그대로 보내야 한다. 서버는 완료 요청에서 소유 메타데이터, 실제 바이트 수, MIME, 실제 이미지 포맷, 픽셀 수, 선택적 SHA-256(업로드 원본 기준)을 검증한다.

`POST /v1/media/{media_id}/complete` — body 없음, `200` `{ "media_id":"uuid", "status":"ready" }`. 원본 `upload_storage_key` 객체의 실제 크기/MIME 및 서명에 묶인 소유 메타데이터를 확인하고 EXIF를 제거한다. 긴 변이 2,560px보다 크면 비율을 유지해 줄인 파생본을 별도 `storage_key`에 저장한 뒤 파생본의 바이트 수·SHA-256·해상도를 기록하고 `ready`로 만든다. 불일치면 파일을 거부하고 두 객체를 정리 대상으로 둔다. 이미 ready인 완료 요청은 같은 ready 결과를 반환한다. 파생본 쓰기는 성공했으나 DB 커밋에 실패해 재호출된 경우, 서버 서명 메타데이터와 실제 바이트 SHA-256을 확인해 DB 완료 처리를 이어간다. 원본 업로드 메타데이터만으로는 정제본으로 인정하지 않는다.

`DELETE /v1/media/{media_id}` — `204`; 현재 사용자 소유의 미디어를 즉시 사용할 수 없도록 삭제 상태로 바꾸고 객체 삭제는 worker가 재시도 가능하게 처리한다. 이미 삭제가 요청된 미디어에 대한 재요청도 `204`이며 연결된 식별 작업과 후보도 제거한다. 활성 관측에서 참조 중이면 삭제를 거부하며, 마지막 참조가 사라진 뒤에만 실제 객체 삭제를 예약.

개발 로컬에서는 `APP_ENV=development`, `DEV_AUTH_ENABLED=true`일 때만 `.env`의 `DEV_AUTH_TOKEN` bearer 값을 고정 `DEV_AUTH_USER_ID`로 매핑한다. 이 경로는 사용자 로그인 기능이 아니다. 운영 모드는 Supabase JWT 서명 키/issuer/audience 검증을 사용하며 개발 인증이 켜져 있으면 시작을 거부한다.

### 식별

`POST /v1/identification-jobs`

요청 `{"media_id":"uuid"}`. 헤더 `Idempotency-Key` 권장. 같은 사용자·같은 키·같은 미디어 요청은 동시 재시도까지 동일 job을 반환한다. 키를 다른 미디어에 재사용하면 `409 IDEMPOTENCY_KEY_REUSED`; 공백 키는 없는 것으로 처리한다. 같은 사용자의 같은 미디어에서 진행 중인 작업도 기존 job을 반환한다.

응답 `202`:

```json
{"job_id":"uuid","status":"queued","poll_after_ms":1500}
```

같은 사용자가 같은 ready 미디어로 진행 중인 job을 요청하면 기존 job을 반환한다. 미디어가 ready가 아니면 `409 MEDIA_NOT_READY`.

외부 provider를 사용할 때 사용자의 일일 quota가 소진되면 `429 IDENTIFICATION_DAILY_LIMIT`과 `Retry-After`를 반환한다. 앱은 직접 종 검색·미확인 저장을 계속 허용하고 AI 재시도만 다음 한국 시간 자정까지 막는다.

회로 차단이 열리면 `503 AI_PROVIDER_CIRCUIT_OPEN`과 `Retry-After`를 반환한다. 이때 job을 생성하지 않으며 앱은 자동 식별 재시도를 잠시 막고 수동 검색·미확인 저장을 계속 허용한다.

`GET /v1/identification-jobs/{job_id}` 응답 예:

```json
{
  "job_id":"uuid",
  "status":"succeeded",
  "candidates":[
    {"species":{"id":"uuid","common_name_ko":"예시 국문명","scientific_name":"Example species","artwork":{"url":"https://cdn.example/a.webp","thumbnail_url":"https://cdn.example/a-sm.webp","style_name":"storybook"}},"confidence_band":"medium","rank":1}
  ],
  "fallback_available":true,
  "error_code":null
}
```

상태는 `queued → running → succeeded|failed`. `succeeded`인데 후보가 비어 있을 수 있다. 완료된 job은 수정하지 않는다. 앱 폴링은 1.5초 간격, 최대 60초로 시작하고 이후 지수 간격으로 조정 가능하게 한다. 앱이 다시 열리면 job 상태를 재조회한다. 로컬 `mock` worker는 종을 만들어내지 않으며 빈 후보로 성공해 수동 검색/미확인 분기를 검증한다. 실제 provider를 운영하기 전 평가된 사진셋으로 top-1/top-3 적합성을 확인한다.

### 종 카탈로그

- `GET /v1/species?query={text}&limit=20&cursor={opaque}` → `{ "items":[Species], "next_cursor":null }`
- `GET /v1/species/{species_id}` → `Species`
- `query`는 국문명/학명 검색, `limit` 기본 20·최대 50. 공백 검색은 활성 종 첫 페이지 반환 또는 `400`으로 일관되게 정한다. MVP 권장: 빈 query는 `400 QUERY_REQUIRED`.
- 구현 v0는 query를 생략하면 전체 활성 종을 반환한다. 커서는 국문명과 UUID를 기준으로 다음 페이지를 이어간다. 서버에 `species_artworks`로 등록되지 않은 종의 API `artwork`은 null이다. 현재 모바일 앱은 7종 slug의 코드 내 SVG 초안을 표시하고 그 외 종은 `그림 준비 중` 중립 배경을 표시한다. API artwork 객체는 서버가 공개 asset을 등록한 종에만 반환한다. SVG는 아직 생물학 검수를 마치지 않았다.

### 발견 및 도감

`POST /v1/observations` — `Idempotency-Key` 지원. 동일 사용자·동일 키·동일 payload의 재요청(동시 요청 포함)은 최초 기록을 반환하고, 같은 키에 다른 payload를 사용하면 `409 IDEMPOTENCY_KEY_REUSED`를 반환한다.

요청:

```json
{
  "media_id":"uuid",
  "species_id":"uuid-or-null",
  "identification_job_id":"uuid-or-null",
  "identified_by":"user_selected",
  "observed_at":"2026-10-31T02:30:00Z",
  "region_label":"제주도"
}
```

응답 `201`:

```json
{
  "observation":{
    "id":"uuid","species_id":"uuid-or-null","media_id":"uuid",
    "identified_by":"user_selected","observed_at":"2026-10-31T02:30:00Z",
    "region_label":"제주도","created_at":"2026-10-31T02:31:00Z"
  },
  "species_summary":{"discovery_count":2,"is_new_species_for_user":false}
}
```

서버 검증: 미디어 소유권/ready 여부, 종 활성 여부, job이 같은 사용자와 미디어에 속하는지, `identified_by`와 `species_id` 일관성. `observed_at`은 RFC 3339 시간대 정보(`Z` 또는 UTC offset)를 포함해야 하며 서버가 UTC로 정규화한다. 생략 시 서버 현재 UTC 시각. `region_label` 최대 100자, 좌표 필드 없음.

- `GET /v1/observations?limit=20&cursor={opaque}&unidentified_only=true` → `{ "items":[ObservationSummary], "next_cursor":null }`. `unidentified_only=true`이면 `species_id IS NULL`인 활성 발견만 반환해 미확인 묶음을 제공한다. 현재 cursor는 관찰 시각과 UUID를 기준으로 다음 페이지를 이어간다.
- `GET /v1/observations/{id}` → 상세(관측, 종 객체 nullable, 사진 URL)
- `PATCH /v1/observations/{id}` 요청은 `{ "species_id":"uuid-or-null", "identified_by":"user_selected", "region_label":"...", "observed_at":"..." }` 중 변경할 필드만 허용. 종 해제는 `identified_by=unidentified`를 함께 요구.
- `DELETE /v1/observations/{id}` → `204`; 즉시 숨기는 soft delete 후 다른 활성 observation이 미디어를 참조하지 않을 때 비동기 파일 삭제 예약. 기본 30일 뒤 worker가 삭제된 observation row를 영구 정리하며 `DELETED_OBSERVATION_RETENTION_DAYS`로 조정한다. 소유자의 이미 삭제된 기록에 대한 재요청도 30일 보존 기간 안에서는 `204`로 처리한다.
- `GET /v1/collection` → `{ "items":[{"species":Species,"discovery_count":2,"first_seen_at":"...","latest_seen_at":"..."}], "unidentified_count":1, "total_species":4 }`. 정렬은 최근 발견 순. 페이지네이션이 필요해지면 cursor 추가.

- `DELETE /v1/account` → `204`; 인증된 사용자 본인의 발견, 식별 작업/후보, 업로드 사진 객체와 Supabase Auth 계정을 삭제한다. 요청 body는 없으며 사용자 ID는 검증된 Bearer 토큰에서만 가져온다. 삭제 시작 시 pending tombstone을 기록해 stale JWT의 새 요청을 막는다. 운영 환경에서는 서버의 `SUPABASE_SERVICE_ROLE_KEY`가 필요하고 모바일 앱에 이 키를 넣지 않는다. 아직 유효한 사진 PUT 주소가 있으면 취소할 수 없으므로 `503 ACCOUNT_DELETE_UPLOAD_URL_ACTIVE`로 보류하고, URL 만료 뒤 worker가 재시도한다. 스토리지 정리가 실패하면 DB 기록을 유지하고 `503 ACCOUNT_DELETE_MEDIA_CLEANUP_FAILED`; tombstone도 유지돼 앱 재시도 또는 worker의 60초 주기 자동 재시도로 마무리한다. Supabase 삭제가 실패하면 앱 데이터는 이미 제거된 상태일 수 있으며 같은 정리 함수의 재시도가 인증 계정 삭제를 마칠 수 있다. 완료된 tombstone은 최대 토큰 수명 뒤 제거한다.

현재 구현은 위 발견 API를 모두 인증된 사용자 소유로 제공한다. 발견 생성 시 `Idempotency-Key`가 필요하고, 사진은 ready 상태여야 한다. 관측 응답의 `photo_url`은 10분 만료 presigned GET 주소다. 종별 summary는 활성 발견만 집계하며, 미확인 발견은 `species_id=null`로 저장한다. Observation 생성은 실제로 연결된 AI 후보인지 검증하고, 사용자 직접 선택은 활성 카탈로그 종인지 확인한다.

## 앱 구현에 필요한 상태/복구 규칙

1. 업로드 intent 성공 후 파일 PUT 실패: intent 재발급 또는 재시도. 앱이 중복 미디어를 만들어도 사용자에게 중복 발견이 생기지 않도록 저장은 별도 멱등 처리.
2. `complete` 응답을 받기 전 식별을 요청하지 않는다.
3. 식별 job 실패/시간 초과/후보 없음은 종 검색과 미확인 저장으로 이어진다.
4. 후보를 누른 것은 아직 발견 저장이 아니다. 카드 확인 화면에서 저장을 눌러야 observation이 생성된다.
5. 저장 응답이 유실된 경우 같은 `Idempotency-Key`로 재요청해 중복 observation을 방지한다.
6. 삭제 성공 후 목록/도감 캐시를 갱신한다. 사진 파일 삭제가 지연되어도 기록은 즉시 숨긴다.
7. AI 점수/공급자 원문/스토리지 key는 앱 응답이나 사용자 로그에 노출하지 않는다.

## 구현 완료 기준

- 서버가 이 문서의 주요 요청/응답 및 상태/오류 계약을 OpenAPI로 표현한다.
- 앱의 타입과 mock 응답이 계약과 일치한다.
- 로그인 사용자 A가 사용자 B의 media/job/observation ID를 넣어도 읽기·수정·삭제할 수 없다.
- 후보 없음, AI 실패, 미확인 저장, 같은 종 재발견, 재요청 중복 방지가 문서의 규칙대로 동작한다.
- 이 계약의 미정 항목은 출시 게이트로 남긴다: 이미지 원본 보유 기간, 실제 AI 임계값, 지원 이미지 파생 크기 및 일러스트 권리 확인.
