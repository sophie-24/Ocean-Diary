# OCEAN DIARY MVP — 작업 현황

한 번에 한 사용자 흐름씩 구현한다. 현재 완료된 것은 실행 가능한 기반이며, 아직 출시 가능한 앱은 아니다.

## TODO

- [x] 제품 범위·사용자 흐름·화면·초기 데이터/API 초안 작성
- [x] 화면 상태·인수 기준·개인정보/오류 복구까지 포함한 기능명세서 v1 작성 (`docs/feature-spec-v1.md`)
- [x] 모바일 주요 버튼 접근성 역할/이름과 선택 상태를 제공하고 모든 모달에 명시적 닫기 동작 추가; 비동기 로딩/오류 상태의 TalkBack 안내 추가
- [x] 홈·도감·종 상세·발견 목록/상세·로그인 화면 제목과 발견 편집 섹션에 화면 읽기 도구가 탐색할 수 있는 제목 역할 추가
- [x] 도감 종 카드와 최근/전체 발견 카드의 접근성 이름에 종·관찰 날짜·지역·발견 횟수를 읽어 현재 항목을 구분할 수 있게 함
- [x] 발견 작성·수정 화면에서 GPS 좌표는 기록하지 않으며 넓은 지역명만 직접 입력하도록 시각·보조기술 안내 추가
- [x] 계정·개인정보 설정 S12 UI를 독립된 `AccountSettingsModal` 컴포넌트로 분리하고 상태/API 제어는 화면 상위에서 유지
- [x] 사진 미리보기·업로드 고지 S04 UI를 `PhotoPreviewModal`로 분리; 사진 다시 선택 동작에서 선택 중 flag를 중복 설정해 picker guard가 조기 반환하던 경로도 수정
- [x] S08의 AI 후보·직접 검색·미확인 선택 UI를 `SpeciesSelectionSection`으로 분리하고 종/후보/선택 출처 타입을 공유 파일로 이동
- [x] S10 저장 완료 그림책 카드 UI를 `ObservationSavedModal`로 분리하고 발견 요약 타입을 공유 타입으로 이동
- [x] React Native 모달 콘텐츠를 접근성 모달로 표시해 TalkBack/VoiceOver 탐색 범위를 현재 대화상자 안으로 제한
- [x] 업로드·로그인·종 검색·기록 저장/목록/수정/삭제·계정 삭제 진행 상태를 polite live region으로 추가 안내
- [x] 사진 미리보기·식별·저장 완료·발견 상세 이미지에 목적과 종을 읽는 접근성 이름 제공; 목록/홈 이미지는 상위 버튼 이름에 포함해 중복 포커스 방지
- [x] S08 AI 후보 카드에 종별 그림책 썸네일을 표시하고, 서버 artwork URL 실패/누락 시 해당 종 앱 번들 SVG를 사용
- [ ] Android TalkBack으로 사진 기록, 후보 선택, 저장, 편집 화면을 실제 기기에서 탐색하며 읽기 순서와 알림 확인
- [x] 업로드 intent의 사용자 범위 멱등 키를 DB 고유 제약과 advisory lock으로 보호하고, 같은 요청 재시도에 기존 media id/서명 주소 또는 ready 상태를 돌려줌 (`0010_separate_media_upload_objects`)
- [x] 정제 후 바뀌는 media `byte_size`와 원본 업로드 크기를 분리 저장해 완료된 intent의 재시도도 원본 요청과 비교 (`0011_upload_request_fingerprints`)
- [x] 빈 `Idempotency-Key`를 DB 저장 전에 `400 INVALID_IDEMPOTENCY_KEY`로 거부해 중복 제약 오류를 방지
- [x] 발견 삭제 행을 기본 30일 후 worker에서 영구 정리하고, 객체 삭제 확인/참조 제거 후 삭제된 미디어 DB row도 정리
- [x] 모바일에서 intent 키를 사전 보존하고 충돌/만료 시 복구 상태를 초기화해 새 업로드로 다시 시작하도록 안내
- [x] 모바일 개발 서버 시작 helper가 API `/v1/ready`를 먼저 확인하고, API/DB schema 미준비 시 실행 방법을 안내
- [x] 앱/서버 공통 데이터 및 API 계약 v1 작성
- [x] API 오류 응답에 안전한 공통 코드·request ID·응답 헤더 추가 및 검증 입력값 비노출
- [x] 비개발 환경에서 `.env.example`의 MinIO 샘플 자격증명 사용 시 API 시작을 거부
- [x] 발견 기록 PATCH에서 미확인 전환 시 `species_id=null`과 `identified_by=unidentified`를 함께 요구
- [x] 도감 홈에서 미확인 발견 건수를 별도 표시하고 API 필터로 전체/미확인 기록 묶음을 전환
- [x] 업로드/AI 시작/기록 저장/계정 삭제 API에 PostgreSQL 공유 sliding-window 제한과 Retry-After 응답 추가
- [x] 앱에서 429 Retry-After 초를 카운트다운하고 해당 재시도 버튼을 대기 중 비활성화
- [x] 모바일 JSON API 요청에 30초 timeout을 적용해 서버 무응답 때 무한 로딩을 막고 각 화면의 기존 재시도/오프라인 fallback으로 복귀
- [x] 사진 직접 PUT을 180초 timeout으로 제한하고 중단 뒤 재시도에서 기존 intent의 완료 여부를 먼저 확인
- [x] 다중 worker도 공유하는 rate-limit event 테이블과 잠금 기반 동시성 제어 구현
- [x] 사진 complete 처리와 미디어 삭제에도 사용자 단위 호출 제한 적용; media UUID가 바뀌어도 bucket이 동일하게 정규화
- [x] 인증 토큰 문자열 대신 검증된 사용자 UUID로 호출 제한 bucket을 정해 토큰 갱신 뒤에도 사용자 한도를 유지하고, 제한 대상 요청의 JWT 중복 검증을 제거; 인증 실패 결과도 재사용해 JWKS 장애 때 중복 대기 방지
- [x] 식별 job의 동시 멱등 재시도에서 unique 충돌을 기존 job 응답으로 복구하고, 키 충돌/공백 키 동작을 계약에 명시
- [x] 외부 AI 식별을 사용자별 하루 20회 기본 한도로 제한하고 PostgreSQL 사용자 잠금으로 동시 우회 방지; 앱은 한도 소진 시 수동 종 선택 경로 유지
- [x] 외부 AI 최근 실패 3회/5분을 PostgreSQL에 공유 저장하고 API·worker 회로 차단으로 일시 중단; 성공 시 실패 기록 초기화
- [x] AI provider timeout을 설정값으로 관리하고, 사진/URL 없이 안전한 처리 시간·input/output token 수를 worker/API 운영 로그에서 확인
- [x] 사용자 DB에 Alembic head(`0007_ai_provider_circuit_breaker`) 적용 확인 (2026-11-01 호스트 PowerShell에서 `alembic current` 반환)
- [ ] 적용된 DB에서 호출 제한, 사진 삭제 재시도, AI 장애 차단 동작 확인
- [x] 계정 삭제 도중/완료 후 아직 유효한 JWT로 새 자료가 생성되지 않도록 advisory lock과 pending/complete tombstone 적용
- [x] pending 계정 삭제를 API 재요청 또는 worker 60초 자동 재시도로 마무리하고, 스토리지/Auth 실패 시 pending tombstone과 안전한 재시도 로그 유지
- [x] 삭제가 진행/완료된 다른 기기에서 `410 ACCOUNT_DELETED` 응답을 받으면 해당 기기의 세션과 로컬 초안을 정리하고 로그아웃 안내
- [x] 사용자 DB에 `0009_account_deletion_tombstones` 적용 (2026-11-01 호스트 시작 로그에서 `0008 -> 0009` 완료 확인)
- [x] 사용자 PostgreSQL에 `0010`~`0012` migration 적용 (`2026-11-02` 사용자 PowerShell `alembic current`가 `0012_retire_legacy_upload_intents (head)` 반환)
- [x] 최신 API에서 `/v1/ready`가 `ready`이며 database schema `0012_retire_legacy_upload_intents`, media storage `ok` 반환 확인 (2026-11-03 사용자 환경 read-only GET)
- [ ] worker를 실행한 상태에서 `pending` 삭제 자동 재시도, 토큰 차단, 부분 삭제 복구, 만료 뒤 tombstone 정리를 실제 DB/스토리지/Auth로 확인
- [x] 계정 전환/로그아웃 때 이전 계정 UI·편집 입력값·관찰 날짜/시간·인증 코드·로컬 임시 사진 초안을 지우고, 이전 계정 요청·초기 세션 조회·초안 복구·계정 삭제 응답 경합이 새 화면에 반영되지 않도록 차단
- [x] 앱 시작 시 cache/문서 폴더를 살펴 강제 종료 뒤 manifest에 연결되지 않은 앱 전용 사진을 정리; 초안 복구 중에는 선택 입력을 막아 새 사진을 잘못 지우지 않도록 보호
- [x] 사진 선택 전, 미완성 초안 사진은 앱 임시 공간(cache)에 저장되며 저장 공간이 부족할 때 사라질 수 있음을 안내
- [x] 사진 미리보기·식별 화면에서 명시적 발견 취소 제공; 서버 media 삭제 시 연결된 식별 job/candidate를 제거하고, 이미 시작된 외부 분석 결과는 폐기한다고 안내
- [x] 앱 사용 중 OS가 미완성 cache 사진을 제거하면 미리보기 오류와 재선택 동작을 안내하고 업로드를 막으며, 이미 업로드된 사진은 계속 식별/저장할 수 있게 처리
- [x] 홈의 진행 중 초안 카드도 임시 사진 로드 실패 대체 화면을 표시하고, 상위 초안 버튼에 접근성 이름을 맡겨 중복 이미지 포커스를 방지
- [x] 홈 진행 중 초안 버튼은 식별 상태를 접근성 이름으로 안내하고, queued/running 동안 보조기술에 busy 상태 제공
- [x] 로컬 파일 존재 사전 확인 직후 cache 정리 경합으로 사진 읽기가 실패해도 네트워크 오류로 오인하지 않고 재선택 상태로 복구
- [x] 발견 초안 재개 시 현재 업로드/식별 단계에 해당하는 모달만 열고 이전 단계를 닫아 중첩 모달을 방지
- [x] 발견 상세 사진 로드 실패 시 오류 상태와 서명 URL을 다시 발급하는 재시도 동작 제공
- [x] 홈 최근 발견·발견 목록·저장 완료 카드에서 사진 URL 로드 실패 시 깨진 이미지 대신 접근성 오류 대체 화면 표시
- [x] 종별 그림 원격 asset URL 로드 실패 시 앱 내 종별 SVG로 대체
- [x] 발견 상세 사진 URL 갱신이 동시에 일어날 때 최신 요청만 화면에 반영하고, 닫혔거나 바뀐 상세의 늦은 응답은 무시
- [ ] Android/iOS 기기 백업 및 복원 동작을 확인하고 실제 사진 보유/삭제 문구 확정
- [x] 저장소·Expo 앱·FastAPI 기본 실행 기반 구성
- [x] 프로젝트 루트에서 Docker 준비·DB health 대기·Alembic head·종 시드·API 실행을 순서대로 처리하는 PowerShell 개발 시작 스크립트 추가 (사용 중인 포트는 종료하지 않고 안내)
- [x] API 시작 스크립트가 루트 `.env`가 없을 때 `.env.example`에서 로컬 개발 설정을 만들고 실기기 스토리지 설정 안내
- [x] API/DB/MinIO 준비 상태를 확인한 뒤 식별 및 정리 worker를 시작하는 `scripts/start-worker.ps1` 추가
- [x] `scripts/start-mobile.ps1 -ApiUrl` 주소를 API 준비 확인뿐 아니라 Expo 앱 번들에도 전달하고, 실기기 사진 업로드용 MinIO LAN 주소 설정 안내 추가
- [x] Expo Go 실행 시 앱 API 주소가 기본 loopback이면 Windows 기본 경로의 LAN IPv4를 사용하고, 자동 선택이 안 될 때 명시적 오류/`-ApiUrl` 재정의 안내 제공
- [x] Expo Go 실행 전에 MinIO `S3_PUBLIC_ENDPOINT_URL`이 loopback인지 검사해 실기기의 presigned 사진 업로드가 실패할 설정을 발견하고 수정 방법 표시
- [x] API 준비 상태 경로에서 PostgreSQL·MinIO 상태를 확인하고 DB 연결 timeout을 API/Alembic에 적용해 의존 서비스 장애가 무한 대기처럼 보이지 않도록 처리
- [x] 초기 국내 해양생물 카탈로그와 그림책 카드 이미지 메타데이터 초안
- [x] 국립수산과학원 공식 생물종 정보로 감성돔·참문어 2종을 카탈로그에 추가하고 그림 초안은 생물학 검수 전까지 draft로 표시
- [x] 확장 카탈로그를 사용자 PostgreSQL에 재시드하고 실제 목록·검색 API 확인 (`GET /v1/species?limit=50`가 7종 반환, `query=자리돔`이 Chromis notata 반환, 2026-11-03)
- [x] 7종의 따뜻한 그림책 스타일 SVG 일러스트 초안 제작 및 도감 목록/상세 화면 연결
- [x] 카탈로그 illustration path/variant/status를 앱 코드의 실제 SVG 초안 상태와 일치시킴
- [x] 일러스트 컴포넌트가 알 수 없는 종을 자리돔 그림으로 오인해 표시하지 않도록 `그림 준비 중` 중립 바다 배경으로 대체하고 보조기술에는 장식 이미지로 처리
- [ ] 일러스트의 종별 형태·색상 생물학 검수 및 실제 다이버 대상 시각 피드백 (현재는 원본 벡터 초안)
- [x] 도감 화면 v0: 카탈로그 종 목록·검색·종 상세·첫 방문 빈 컬렉션 안내
- [x] 도감 서버 연결 실패를 기본 종 목록으로 복구하고 오프라인 안내/검색 재시도 제공
- [x] 개인 발견 API 연결 실패를 빈 도감으로 오인하지 않도록 기존 기록 유지·오류 안내·재시도 연결
- [x] 전체/미확인 발견 목록에서 첫 페이지와 더 불러오기 실패를 구분해 실패한 커서·필터 조건으로 재시도
- [x] 발견 상세를 연 위치(홈 최근 카드/전체·미확인 목록)를 기억하고 상세 닫기·삭제 후 해당 화면으로 복귀
- [x] 목록에서 발견 날짜를 수정한 뒤 현재 필터 첫 페이지와 커서를 서버 정렬 기준으로 다시 조회
- [x] 서버 종별 집계의 첫 발견일·최근 발견일을 종 상세 그림책 카드에 표시
- [x] 새 발견 확인 화면에서 날짜·시간을 기기 현지 시각으로 수정하고 유효한 값만 UTC로 저장
- [x] 사진 재업로드·식별 재시도·앱 재시작 복구에서 기존 관찰 날짜·시간을 보존하고 새 사진으로 시작할 때만 현재 시각으로 초기화
- [x] 발견 저장/수정 API가 시간대 없는 `observed_at`을 조용히 UTC로 오인하지 않고, 명시된 시간대만 UTC로 정규화
- [x] 앱 복귀 시 개인 발견 목록을 새로 읽어 만료된 비공개 사진 URL을 갱신하고, 열려 있는 발견 상세 사진 URL도 새로 발급받음
- [x] 홈/목록에서 발견 상세를 열 때 상세 API를 다시 읽어 만료된 사진 서명 URL을 갱신
- [x] 도감/기록 종 검색을 서버 카탈로그 검색으로 연결하고 300ms 디바운스와 이전 요청 결과 차단 적용
- [x] 도감 데이터 영속화: PostgreSQL 실행·마이그레이션/시드·목록/검색/상세 API 왕복
- [x] 발견 기록 기능 구현: 사진 선택→업로드→식별/수동 선택→저장·조회·수정·삭제 (실기기·스토리지 왕복은 아래 출시 전 확인)
  - [x] 사진 선택 UI 구현: 사진 보관함 권한·이미지 선택·미리보기·선택 취소; 미리보기에서 바로 재선택하며 선택기 취소 시 기존 초안 보존
  - [x] 홈의 진행 중 사진 카드는 업로드/식별/종 확인 단계로 복귀하고, `사진 바꾸기` 전에 기존 초안 교체 확인을 띄움; 사진 업로드 중에는 교체 버튼을 막음
  - [x] 사용자가 확인 후 진행 중 발견 기록을 취소하면 로컬 사진/초안과 서버 미디어 및 연결된 식별 작업·후보를 정리
  - [x] 선택된 사진의 MIME/용량 메타데이터를 즉시 검사하고 미리보기에 JPEG/PNG·15 MiB 제한 안내 표시
  - [ ] Android 기기/Expo Go에서 허용·거부·취소 수동 확인
  - [x] 개발용 인증 경계 및 사용자 소유 미디어 테이블/마이그레이션 작성
  - [x] JPEG/PNG 업로드 URL 발급·업로드 완료 확인·EXIF 제거·개발 저장소 삭제 API 작성
  - [x] 서버 저장 전 사진 긴 변을 최대 2,560px로 축소하고 저장된 크기·체크섬을 처리 이미지 기준으로 기록해 저장/AI 비용 제한
  - [x] 이미지 정제 객체 저장 뒤 DB 커밋이 실패해도 다음 complete 요청에서 서버 서명 메타데이터와 바이트 해시를 검증해 `ready` 상태 완료를 재개
  - [x] 업로드 원본 key와 정제 완료 key를 분리해 만료 전 presigned PUT 재전송이 `ready` 사진을 덮어쓰지 못하게 하고, URL 만료 뒤 worker/계정 삭제에서 두 객체를 모두 정리 (`0010_separate_media_upload_objects`)
  - [x] 앱이 완료 응답을 잃은 뒤 재시도할 때 기존 intent의 `complete` 상태를 먼저 확인해 ready 사진에 presigned PUT을 다시 보내지 않음
  - [x] 앱이 intent 멱등 키를 요청 전에 로컬에 저장하고 서버가 같은 키에 기존 media id/URL을 돌려줘 응답 유실·강제 종료로 intent가 중복 생성되지 않게 복구
  - [x] media id와 intent key를 PUT 전에 draft에 보존하고 앱 재시작 뒤 complete 확인 또는 오래된 pending intent 정리 후 재시도
  - [x] worker가 만료된 미완료/거부 업로드를 URL 만료 + 15분 뒤 정리하고, ready 원본 키도 URL 만료 뒤 재정리; 미발견 ready 최종 사진은 7일 후 정리
  - [x] PostgreSQL 마이그레이션 `0004_observations` 적용 확인 (2026-11-01 호스트 PowerShell에서 `alembic current`가 head 반환)
  - [x] 사용자 환경에서 MinIO 컨테이너·초기화 bucket 확인; 최신 API readiness에서 media storage `ok` 확인
  - [ ] MinIO 객체를 사용한 실제 사진 PUT/complete 왕복 확인
  - [x] `minio-init` 셸 스크립트를 YAML literal block으로 수정하고 `docker compose ... config --quiet` 통과
  - [x] 호스트에서 초기화 컨테이너 `Exited (0)` 및 `Bucket created successfully` 로그 확인
  - [ ] 앱에서 실제 사진 PUT/complete 왕복 확인
  - [ ] 운영 인증(Supabase) 설정과 실제 기기 로그인 왕복 확인
  - [x] Supabase 이메일 코드 로그인 UI·보호 저장소 세션 영속화·API Bearer 토큰 연결 구현 (JWKS 조회 기본 5초 timeout; 네트워크 장애/누락 설정은 명시적 503, 잘못된 토큰은 401로 구분; 실제 로그인 왕복은 별도 확인)
  - [x] 미완료 업로드 초안을 계정 ID에 묶고 로그아웃 시 개인 화면 상태를 비운 뒤 재로그인에서만 복구
  - [ ] 프로젝트 URL/공개 키·이메일 코드 템플릿 설정 후 Android에서 코드 발급/로그인 확인
  - [x] 모바일에서 개발용 토큰으로 presigned PUT·완료 확인 연결
  - [x] 서버가 만료/거부한 업로드 intent를 재사용하지 않고 다음 재시도에서 새 intent를 발급하도록 처리
  - [x] 외부 AI provider·고지 버전·동의 시각을 미디어에 기록하고 명시적 동의 버튼을 제공하며 upload API·식별 API·worker에서 불일치 시 사진 전송 차단
  - [x] `0008_external_ai_consent`, `0009_account_deletion_tombstones` 마이그레이션을 사용자 DB에 적용 (2026-11-01 호스트 시작 로그에서 적용 확인)
  - [x] `/v1/client-config`에서 외부 AI 미사용 설정 응답 확인 (2026-11-01 사용자 API)
  - [ ] 동의 없는 외부 provider 업로드 거부와 삭제된 JWT 접근 차단을 실제 API로 확인
  - [ ] 새 경로 환경에서 dependency 설치 후 실제 Android 폰 업로드 왕복 확인 및 오류/재시도 다듬기
  - [ ] Android에서 앱 강제 종료 후 사진·식별 상태·선택·저장 재시도 복구를 수동 확인
  - [x] 진행 중인 사진/식별/종 선택/저장 멱등성 상태를 앱 문서 저장소에 보존하고 재실행 시 복구
- [x] 저장 요청 시작 전에 멱등 키/payload와 요청 진행 표시를 로컬 초안에 기록하고, 앱 재실행 시 동일 payload 재시도를 강제; 로컬 기록 실패 시 서버 요청 차단
  - [x] 미저장 사진이 7일 뒤 서버에서 정리된 후 저장을 시도하면 기기에 남은 사진을 재업로드하도록 안내·복구
- [x] 종 확인 기능 구현: 검색/수동 지정·미확인 저장 (실기기 왕복 검증은 아래 출시 전 확인)
  - [x] 사람 선택/AI 확인/미확인 상태 규칙을 강제하는 발견 저장 API·멱등성 (동시 재시도도 최초 결과 반환, 키 재사용 충돌은 409)
  - [x] 개인 발견 목록·상세·수정·삭제·도감 집계 API (revision `0004`)
  - [x] 모바일 후보·수동 검색·미확인·기록 저장 화면 연결 (실제 Android 기기 왕복은 아래 수동 확인 항목에서 추적)
- [x] AI 식별 기능 구현: 비동기 작업·최대 3개 후보·저신뢰/실패 복구 (실제 사진 정확도와 실기기 검증은 아래 출시 전 확인)
  - [x] 사용자 소유 비동기 job API·PostgreSQL 큐 worker·후보 스키마 (revision `0003`)
  - [x] 식별 POST 직전 멱등 키와 요청 진행 상태를 초안에 보존하고, 응답 유실 뒤 앱 재시작 시 같은 키를 재전송해 기존 job을 복구 (일반 요청·사용자 재시도 포함); 요청 30초 timeout으로 무한 대기 해제
  - [x] 작업 중 worker가 중단된 경우 재시작 시 실패로 복구
  - [x] 업로드 만료/거부 객체와 7일 이상 미저장 ready 사진 정리를 worker에서 60초 간격으로 실행
  - [x] OpenAI 비전 provider 연결 및 카탈로그 후보 구조화 저장 (키 설정과 외부 API 실호출은 사용자 환경에서 미확인)
  - [x] provider 응답의 output/content 구조를 검증하고 형식 오류를 `AI_INVALID_RESPONSE`로 분류해 회로 차단 및 사용자 복구 흐름에 전달
  - [ ] 실제 한국 수중 사진으로 종별 정확도 평가·저신뢰 기준 보정 (현재 confidence는 모델의 정성 라벨)
  - [x] 앱에서 job 폴링/후보·실패·시간 초과와 수동 검색/미확인 fallback 연결
  - [x] 업로드 전 공개 설정 API로 외부 AI 전송 여부를 고지하고 설정 조회 실패 시 사진 전송 차단; mock 설정에서는 AI 후보가 생성되지 않아 직접 검색/미확인 저장이 가능함을 함께 안내
  - [x] 식별 상태 폴링을 1.5초 시작·최대 8초 간격으로 점진 증가시키고 총 대기 60초로 제한
  - [x] 실패한 식별 작업을 재시도할 때 새 멱등성 키로 새 작업을 생성하도록 연결
  - [ ] 실제 기기에서 worker 실행·후보 없음·오류 복구 확인
- [x] 저장 흐름 구현: 후보 확인·발견 생성·도감 재조회 (Android 전체 왕복은 아래 출시 전 확인)
  - [x] 사용자 소유 발견 데이터/API와 종별 발견 횟수 집계
  - [x] 앱의 후보 확인/직접 선택/미확인 저장과 홈 도감 새로고침 연결
  - [x] 저장 응답의 종별 횟수와 발견 데이터를 이용한 그림책 스타일 저장 완료 카드 연결
  - [x] 최근 발견 카드, 전체 커서 목록, 상세 진입, 날짜/지역/종 수정 및 삭제 확인 대화상자 연결
  - [ ] Android 기기에서 업로드→식별/수동 선택→저장→앱 재시작 뒤 조회 확인
- [ ] 소수 다이버 베타: 개인정보/삭제/비용 점검과 피드백 반영
  - [x] 로그인 설정 화면에서 계정과 모든 개인 데이터 삭제를 요청하고 서버에서 발견/식별/사진/Auth 계정 삭제 연결
  - [x] 계정 화면에 미저장 사진 7일 정리와 발견/계정 삭제 시 사진 처리 기준 안내
  - [x] 계정 설정에서 로그아웃을 제공하고 기기 임시 사진 보관/백업 가능성, 서버 보관 전 GPS 촬영 위치 정보 제거, 직접 입력한 지역명만 기록됨을 안내
  - [ ] Supabase 서비스 역할 키 설정 후 계정 삭제 성공·스토리지 오류·재시도 동작을 실제 환경에서 확인
  - [ ] 개인정보 처리방침에 사진/AI 처리/보유기간/백업 삭제 기간을 명시하고 베타 전 검토
- [x] 실제 코드 동작을 기준으로 처리방침 내부 초안 작성; 운영자·수탁사·리전·처리 근거·연락처 법률 검토 전 공개 금지 (`docs/privacy-policy-draft.md`)
- [ ] 사용자 삭제 후 30일 만료, 공유 미디어 보존, 객체 삭제 성공 뒤 DB row 정리를 PostgreSQL/MinIO에서 실제 확인
- [ ] 실제 개인정보처리자/수탁자/국외 이전과 법적 근거 확정 후 처리방침 검토 및 앱 설정/로그인 화면에 연결
  - [x] Expo SDK 58 패치 업데이트 후 모바일 의존성 보안 재점검: high 2/low 1 → high 0/low 0
  - [x] Expo 58 CLI 간접 `glob`/`minimatch` 취약점을 `14.0.2`/`11.0.1` override로 해결; SDK 다운그레이드 없이 설치·정적 Android export 확인
  - [x] 현재 lockfile `npm audit` 0 vulnerabilities 및 Expo 58 override dependency tree 확인
  - [x] 2026-11-03 모바일 lockfile 기준 최신 advisory 재확인: `npm audit` 0 vulnerabilities
  - [x] 2026-11-03 실제 서비스 화면을 데스크톱 브라우저에서 열 수 있도록 Expo Web 프리뷰 명령(`npm run preview:web`)과 README 사용법을 추가했다. `npx expo export --platform web --output-dir .tmp-web-preview`가 322개 모듈로 번들 생성 완료; 임시 출력 폴더는 Git에서 제외했다. 브라우저 시각 확인과 실기기 확인은 별도다.
  - [ ] 실제 Android release build 생성 및 설치 확인
- [ ] 앱스토어 제출 준비 및 출시 (현재 임시 application ID `com.oceandiary.app`의 게시자 소유/사용 가능 여부 확인 필요)
  - [x] EAS preview APK 및 production AAB build profile 정의; 배포 빌드에 공개 HTTPS API/Supabase origin과 publishable/anon key를 요구하고 dev token 및 secret/service-role key를 거부
  - [ ] EAS project/API HTTPS 환경 변수 생성 후 preview APK 원격 생성·설치 확인 및 production AAB 빌드 확인
  - [ ] 임시 물고기·도감 앱 아이콘의 실제 단말 마스크/런처 크기 시각 검토; 게시 전 브랜드 확정

## 완료한 작업과 확인 결과

> 아래의 날짜가 있는 초기 환경 설정 기록은 당시의 상황을 보존한 이력이다. 현재 구현 상태와 미완료 작업은 문서 상단 TODO를 기준으로 한다.

- 2026-11-03 S12 계정 설정 화면에 기기 임시 사진 보관과 백업 가능성, 서버 보관 전 GPS 촬영 위치 정보 제거, 지역명 직접 입력 기준을 안내하고 로그아웃 동작을 추가했다. `npm run typecheck`와 `npx expo export --platform web --output-dir .tmp-web-preview`(322 modules)가 통과했다. 실제 브라우저/기기 로그인·로그아웃은 미확인이다.
- 2026-11-03 주요 화면 제목과 발견 편집 구획에 React Native `accessibilityRole="header"`를 추가해 TalkBack/VoiceOver 제목 탐색 의미를 제공했다. 모바일 `npm run typecheck` 통과; 실제 기기 읽기 순서/낭독은 TalkBack·VoiceOver 검증 항목에 남겼다.
- 2026-11-03 도감 종과 발견 카드의 접근성 이름이 화면에 보이는 주요 맥락(종명·학명/발견 수, 관찰 날짜·지역)을 포함하도록 보완했다. 모바일 `npm run typecheck` 통과; TalkBack/VoiceOver 실제 낭독 검증은 기기 항목에 남겼다.
- 2026-11-03 발견 작성·수정 화면에 GPS 좌표 비수집과 넓은 지역명 직접 입력 안내를 추가했다. 모바일 `npm run typecheck` 통과; 실제 화면 가독성과 낭독은 기기 검증 항목이다.
- 2026-11-03 계정·개인정보 설정 S12 화면을 `src/features/account/AccountSettingsModal.tsx`로 분리했다. controlled props로만 연결하고 계정 삭제 확인, 로그아웃 실패 복구, rate-limit 표시 동작을 유지한다. 모바일 `npm run typecheck` 및 Expo Web 정적 번들(323 modules) 생성 통과; 실제 화면 왕복은 미확인이다.
- 2026-11-03 사진 미리보기·업로드 동의 S04를 `src/features/observations/PhotoPreviewModal.tsx`로 분리하고 client config/photo selection 타입을 공유 타입 모듈로 이동했다. 재선택 버튼이 이미 `isPickingPhoto=true`로 만든 뒤 picker를 호출해 중복 실행 guard에 걸리던 순서를 바로잡았다. 모바일 `npm run typecheck` 통과 및 Expo Web 정적 번들(324 modules) 생성 확인; 실제 사진 선택기 왕복은 기기에서 확인해야 한다.
- 2026-11-03 S08의 AI 후보 카드, 카탈로그 검색, 미확인 선택 UI를 `src/features/observations/SpeciesSelectionSection.tsx`로 분리했다. 검색/선택 상태와 멱등 저장 연결은 상위 화면에 남기고 controlled props로 연결했으며, 후보 접근성 이름에 학명·신뢰 문구를 포함하고 수동 선택과 AI 확인의 선택 상태를 분리한다. 모바일 typecheck 통과 및 Expo Web 정적 번들(325 modules) 생성 확인; 실제 검색·저장 왕복은 기기 확인 항목이다.
- 2026-11-03 S10 저장 완료 그림책 카드를 `src/features/observations/ObservationSavedModal.tsx`로 분리하고 `ObservationSummary` 응답 타입을 공유했다. 저장 상태와 다음 행동은 상위 화면이 제어한다. 모바일 `npm run typecheck` 통과 및 Expo Web 정적 번들(326 modules) 생성 확인; 저장 UI 실기기 왕복은 출시 전 확인 항목이다.
- 2026-11-01 호스트 PowerShell에서 `GET /v1/client-config` 왕복 성공을 확인했다. 반환값 `external_ai_processing=false`는 현재 API가 `mock` 식별 provider로 설정되어 외부 AI에 사진을 전송하지 않는다는 뜻이다. 이 확인은 DB revision `0005` 적용이나 사진 업로드/worker/저장 전체 흐름을 증명하지 않으므로 관련 TODO는 미완료 상태로 둔다.
- 2026-11-01 호스트 PowerShell의 `alembic current`가 `0005_api_rate_limit_events (head)`를 반환했다. 이후 사진 삭제 재시도(`0006`)와 AI provider 회로 차단(`0007`) 마이그레이션을 추가했으므로 최신 head 적용이 필요하다.
- 2026-11-01 사용자 확인: 호스트 PowerShell `alembic current`가 `0007_ai_provider_circuit_breaker (head)`를 반환했다. DB 마이그레이션 적용은 완료됐으며 rate limit/스토리지 재시도/AI 회로 차단의 런타임 확인은 별도다.
- 발견 저장 전 로컬 초안 파일 쓰기를 반드시 기다리고, 해당 쓰기가 실패하면 API POST를 보내지 않도록 변경했다. 파일 저장 오류는 사용자가 저장 공간을 확인하고 동일 payload로 재시도하도록 안내하며, 실패 후 재시도를 위해 요청 queue는 복구된다. 관련 기능명세의 S09 규칙도 추가했다. 실제 기기 저장 공간 부족 상황 재현은 수동 확인 전이다.
- 2026-11-01 `scripts/start-api.ps1`은 기존 API 프로세스(PID 12964)가 포트 8765를 사용 중임을 감지해 정상적으로 중단했다. Windows PowerShell 5.1이 UTF-8 한국어 오류 문구를 깨뜨려 스크립트에 UTF-8 BOM을 추가했고, 기존 API를 재사용하거나 종료하도록 안내를 명확히 했다.
- 2026-11-01 시작 스크립트가 포트 8765의 기존 API를 `/v1/health`와 `/v1/ready`로 확인하도록 개선했다. 기존 API가 정상이어도 Docker 준비·마이그레이션·시드를 마친 뒤 중복 API 프로세스만 건너뛴다. PowerShell 파서와 UTF-8 BOM을 정적으로 확인했고, 사용자 PC에서의 실제 스크립트 왕복은 아직 확인 전이다.
- 사용자 실행 로그에서 `minio-init`이 one-shot 컨테이너라 이미 종료된 뒤 `docker compose ps -q`가 빈 문자열을 반환하는 경우를 확인했다. 시작 스크립트가 종료 컨테이너를 포함해 조회(`ps --all --quiet`)하고, 빈 외부 명령 결과도 안전한 문자열로 처리하도록 수정했다. PowerShell 파서 오류는 없음을 확인했으며 사용자 환경 왕복 확인은 남아 있다.
- Codex 실행 환경에서 수정된 시작 스크립트를 직접 실행했지만 Docker Desktop named pipe 접근이 `permission denied`로 거부됐다. 이 결과는 사용자의 호스트 PowerShell Docker 접근 상태를 나타내지 않는다. 수정 반영 후 호스트 실행은 아직 미확인이다.
- `0008_external_ai_consent`를 추가해 외부 AI 동의 provider/버전/시각을 미디어 row에 기록한다. 앱은 명시적 동의 문구가 있는 업로드 버튼을 표시한다. 사용자가 본 provider와 API 현재 설정이 다르면 업로드 또는 job 생성을 거부하고, worker도 이미지 객체를 읽기 전에 다시 동의를 확인한다. 앱은 동의 설정 변경 시 로컬 사진으로 돌아와 안내를 새로 확인하게 한다. API 계약/기능명세/시작 문서에도 반영했다. DB 적용 및 실제 외부 AI 차단 왕복은 미확인이다.
- `0009_account_deletion_tombstones`를 추가했다. 사용자 API와 worker가 per-user advisory lock을 공유해 삭제와 쓰기/AI 처리를 직렬화한다. 삭제 도중 실패한 pending tombstone은 일반 API를 차단한 채 삭제 요청 재시도를 허용한다. 삭제 완료 후 기존 JWT 최대 수명 동안 subject만 유지하고, worker가 만료 marker를 지운다. API가 설정된 최대 수명을 넘는 Supabase JWT는 거부한다. 다른 기기에서 `410 ACCOUNT_DELETED`가 오면 앱은 로컬 세션·초안을 비운다.
- 변경 후 모바일 `npm run typecheck`, API 변경 파일 및 migration `py_compile`, `alembic heads`를 확인했다. 모바일 타입 검사와 Python 컴파일이 성공했고 Alembic 단일 head는 `0009_account_deletion_tombstones`다. 당시 DB 적용은 미확인이었으나 2026-11-01 사용자 호스트 로그에서 `0008 -> 0009` 적용과 API 기동을 확인했다. 단위/통합 테스트는 실행하지 않았다.
- 2026-11-01 계정 삭제 후처리를 보강했다. API와 worker가 같은 멱등 정리 함수를 쓰며 worker가 60초마다 pending tombstone을 최대 10건까지 이어서 처리한다. Python compile, `app.account`/`app.worker` import, `alembic heads`(단일 head `0009_account_deletion_tombstones`)를 확인했다. 사용자 API의 `/v1/health`, `/v1/ready`, `/v1/client-config`도 실제 응답을 확인했다. 실제 worker·스토리지·Supabase Auth 재시도 왕복은 미검증이다.
- 2026-11-01 모바일 `npm run typecheck` 통과. 이 개발 환경에는 `adb`가 없어 Android 실기기 연결은 확인할 수 없었다. 기기 흐름·권한·재시작 검증은 출시 체크리스트에 남겨둔다.
- 2026-11-01 빠져 있던 비동기 진행 안내를 사진 업로드, 로그인, 수동 종 검색, 발견 저장/목록/수정/삭제, 계정 삭제에 추가했다. TypeScript 검사가 통과했다. 실제 음성 출력·읽기 순서는 Android TalkBack 기기 확인이 남아 있다.
- 2026-11-01 `SpeciesArtwork`에서 지원하지 않는 slug가 자리돔 그림으로 대체되던 문제를 고쳤다. 미지원 종에는 `그림 준비 중` 문구가 있는 중립 바다 배경을 표시하고 SVG는 screen reader에서 장식으로 처리한다. `npm run typecheck` 통과; 종별 사실성 검수는 여전히 미완료다.
- 2026-11-01 업로드 완료 API가 정제 이미지를 객체에 덮어쓴 뒤 DB 커밋이 실패하는 경우, 서버 HMAC 서명 메타데이터와 실제 객체 해시를 재검증해 후속 요청에서 `ready` 처리를 재개하도록 보강했다. Python compile 및 API 모듈 import 통과; 실제 스토리지 왕복과 강제 DB 커밋 실패 재현은 남아 있다.
- 2026-11-01 비개발 환경의 기본 MinIO 샘플 자격증명 차단을 추가했다. settings Python compile/import 및 실행 중 API `/v1/ready`에서 DB·MinIO `ok`를 확인했다. 비개발 환경의 실제 시작 차단은 외부 production 설정이 없어 별도 확인 전이다.
- 2026-11-01 `scripts/start-worker.ps1`을 추가해 `/v1/ready` 확인 뒤 API 가상환경에서 worker를 실행하게 했다. PowerShell 파싱을 확인했다. 실제 실행은 pending cleanup이나 식별 job을 처리할 수 있으므로 사용자 개발 창에서 수행한다.
- 프로젝트 전체를 `C:\Users\20231\Ocean Diary`로 이동했다. 실행 중인 API가 기존 경로를 점유해 기존 폴더에는 빈 `services\api` 디렉터리만 남아 있다. API 파일과 로컬 개발 환경은 새 경로에 있으며, 다음 실행부터 새 경로를 사용한다.
- 이 명세는 MVP의 제품 기준이다. 실제 구현 상태는 아래 체크리스트대로 별도 추적한다.
- 사진 업로드 서버 1차 구현 당시에는 개발환경 bearer 인증(고정 개발 사용자), presigned PUT, 소유권·크기/MIME/메타데이터/체크섬·이미지 포맷·픽셀 수 검증, EXIF 제거와 미디어 삭제 경로를 추가했다. 초기에는 원본 key를 처리 이미지로 덮어썼으나, `0010_separate_media_upload_objects`에서 서명 PUT 전용 키와 정제 완료 키를 분리했다. 실제 이미지 PUT/완료 왕복은 사용자의 새 경로에서 의존성 설치와 마이그레이션을 한 뒤 확인해야 한다.
- 앱 사진 미리보기의 `사진 업로드` 버튼을 API intent→MinIO PUT→complete에 연결했다. 서버 주소/개발 토큰은 `apps/mobile/.env`에서 주입하고, 사용자에게 업로드 상태와 한국어 오류를 보여준다. 실제 기기 왕복은 아직 실행 전이다.
- 개발 인증 토큰은 로컬 전용이며 실제 사용자 로그인 기능이 아니다. 프로덕션 모드에서는 Supabase 설정과 저장소 자격증명을 요구하고 개발 인증이 켜져 있으면 서버 시작을 거부한다.
- AI job backend는 `queued→running→succeeded|failed`, media 소유권, Idempotency-Key 및 후보 rank/confidence 제약을 구현했다. `python -m app.worker`로 실행하는 개발 worker의 `mock` 모드는 후보를 지어내지 않고 빈 후보로 성공한다. OpenAI provider는 Responses API 이미지 입력/JSON Schema 출력을 사용하고, 예기치 않은 output/content 구조를 `AI_INVALID_RESPONSE`로 분류한다. 공식 모델 문서에서 `gpt-6-luna`가 이미지 입력과 structured outputs를 지원하는 것을 2026-11-01 재확인했다. 실제 OpenAI API 호출과 수중 사진 정확도 평가는 미완료다.
- 발견 저장 API는 ready 사진·활성 종·같은 소유자의 식별 작업을 검증하며 `ai_confirmed/user_selected/unidentified` 규칙, 멱등성, 지역/관찰 일시 수정, soft delete와 사진 정리, 비공개 사진 URL, 발견 목록 커서와 종별 집계를 구현했다. 앱은 식별 job을 폴링하고 후보/수동 카탈로그 검색/미확인 중 선택해 저장한 뒤 개인 도감 데이터를 다시 읽는다. 최신 DB revision은 `0004_observations`이며 2026-11-01 호스트 PowerShell에서 적용을 확인했다. 실제 휴대폰 왕복은 아직 확인 전이다.
- 발견/미디어 삭제는 DB에 즉시 삭제 상태를 기록하고 MinIO 객체 정리는 worker가 재시도하도록 변경했다. `storage_deleted_at`으로 객체 삭제 완료를 추적하며, 삭제 요청 재전송은 `204`로 끝난다. 이를 위해 Alembic revision `0006_async_media_deletion`을 추가했다. 실제 사용자 DB 적용과 스토리지 오류 복구는 미확인이다.

- 제품 개요와 API 계약 문서를 `docs/`에 저장했다.
- Expo 모바일 앱에 따뜻한 톤의 첫 화면과 도감 카드 목업을 만들었다.
- Expo SDK 호환성 검사와 TypeScript 검사가 통과했다.
- Android JavaScript 번들 생성이 `--no-bytecode --no-minify` 옵션으로 통과했다. Hermes bytecode 생성은 로컬 도구 경고 때문에 현재 확인 범위에서 제외했다.
- FastAPI health handler는 정상 JSON을 반환하고 Uvicorn도 시작된다. 이 환경에서는 loopback HTTP 왕복까지 검증하지 못했다.
- PostgreSQL 준비는 Docker 엔진 pipe 접근 거부와 로컬 `initdb` 초기화 정지로 대기 중이다. DB 연결을 완료했다고 간주하지 않는다.
- SQLAlchemy/Alembic/psycopg 의존성을 설치했다. 종/일러스트 스키마와 마이그레이션, 공통 카탈로그에서 UUID를 기준으로 반복 시드하는 명령, 목록/검색/상세 API를 작성했다. `alembic upgrade head --sql`로 PostgreSQL 마이그레이션 SQL을 생성했고, FastAPI OpenAPI 경로 및 커서 인코딩/디코딩 구조 확인을 마쳤다.
- 실제 PostgreSQL 적용/시드는 아직 미완료다. Docker 엔진은 `dockerDesktopLinuxEngine` pipe 접근이 거부됐고, 로컬 PostgreSQL `initdb`는 기본 `max_connections` 선택 단계에서 멈춰 중단했다. 이 환경에서 DB 왕복을 완료했다고 표시하지 않는다.
- `initdb --set=max_connections=20 --set=shared_buffers=128MB`로도 동일한 초기화 단계에서 멈췄다. 재개 기준은 `docker info`가 서버 버전을 반환하거나 `pg_isready -h localhost -p 5432`가 정상 응답하는 것이다.
- 사용자가 Docker를 띄운 뒤 재확인했지만, 이 작업 실행 환경에서는 `desktop-linux`와 `default` 양쪽 named pipe 모두 `permission denied`였고 `pg_isready`도 `localhost:5432`, `host.docker.internal:5432` 양쪽에서 응답하지 않았다. 따라서 사용자의 Docker Desktop 화면 상태와 이 작업 환경의 엔진 접근 권한이 다를 수 있다.
- 사용자의 호스트 PowerShell에서는 `docker info --format '{{.ServerVersion}}'`가 `29.5.3`을 반환했다. 다만 compose 명령은 현재 디렉터리가 `C:\Users\20231`인 상태에서 상대 경로가 잘못되어 실행되지 않았다. 올바른 compose 경로에서 컨테이너를 시작한 뒤 이 작업 환경의 `localhost:5432` 접근도 재확인해야 한다.
- 사용자가 올바른 프로젝트 폴더에서 `docker compose -f infra\docker-compose.yml up -d`를 실행해 `infra-postgres-1`이 시작됐다. 호스트 쪽 `docker compose ps`는 `-f`를 생략해 실행되지 않았다. 이 작업 환경에서는 named pipe 권한이 여전히 거부되고, 네트워크 권한 요청 후에도 `localhost`, `127.0.0.1`, `host.docker.internal`의 5432 포트에 응답이 없다. 호스트에서 `docker compose -f infra\docker-compose.yml ps`로 컨테이너 health를 확인해야 한다.
- 호스트에서 올바른 compose 명령을 실행한 결과 컨테이너가 `Up (healthy)`이고 `0.0.0.0:5432->5432/tcp`로 공개된 것을 확인했다. 그래도 이 작업 환경에서 `127.0.0.1:5432`는 응답하지 않고 Docker named pipe도 거부된다. 따라서 마이그레이션/시드 실행을 호스트 PowerShell에서 수행하거나 작업 실행 환경의 연결 경로를 제공해야 한다.
- 사용자는 호스트 PowerShell에서 `alembic upgrade head`를 실행했고 오류 없이 프롬프트로 돌아왔다. revision 조회와 종 시드 결과는 아직 확인 전이다. 이 작업 환경의 `127.0.0.1:5432`도 재시도했지만 계속 응답하지 않는다.

## 완료 단계: 도감 화면 v0

초기 카탈로그는 국내 연안 어류 5종으로 시작했고, 2026-11-02 감성돔과 참문어를 추가해 현재 7종이다. 국명·학명은 국립수산과학원 e-연구바다에서 대조했으며 설명은 서비스용 짧은 초안이다. 일러스트는 7종 모두 자체 SVG 초안으로 연결했으며 감성돔·참문어 그림도 생물학 검수 전 상태다. NIFS 사진을 앱에 복사하지 않는다. 공개 전에는 생물학적 문구와 그림의 종 특징을 검수한다.

**이번 단계의 완료 기준:** JSON 파싱 가능, 필수 필드 일관성, 중복 slug 없음, 모든 종에 출처 URL과 그림 상태가 기록됨.

카탈로그는 7종이며 기존 5종의 출처는 [자리돔](https://www.nifs.go.kr/portal/bt/frctA/actionSpeciesSearchView.do?taxonId=10001), [쥐노래미](https://www.nifs.go.kr/portal/bt/frctA/actionSpeciesSearchView.do?taxonId=10538), [돌돔](https://www.nifs.go.kr/portal/bt/frctA/actionSpeciesSearchView.do?taxonId=11116), [볼락](https://www.nifs.go.kr/portal/bt/frctA/actionSpeciesSearchView.do?taxonId=11748), [조피볼락](https://www.nifs.go.kr/portal/bt/frctA/actionSpeciesSearchView.do?taxonId=11759)이다. 확장 종은 [감성돔](https://www.nifs.go.kr/portal/bt/frctA/actionSpeciesSearchView.do?taxonId=9541)과 [참문어](https://www.nifs.go.kr/portal/bt/frctA/actionSpeciesSearchView.do?taxonId=11082)의 국명·학명·분포/서식지 설명을 대조했다. 사용자 DB 재시드와 검색 API 왕복은 2026-11-03에 확인했고, 생물학적 문구/그림 검수는 남아 있다.

도감 화면 v0는 공통 JSON 카탈로그를 읽도록 연결했다. 이름/학명 검색, 검색 결과 없음, 생물 상세 시트, 아직 발견 기록이 없는 첫 화면 상태를 구현했다. `npm run typecheck`와 `npx expo export --platform android --no-bytecode --no-minify`가 통과했다. 카드 그림과 발견 기록 버튼은 목업이며, 아직 기록을 실제로 생성하지 않는다.

## 완료 단계: PostgreSQL과 도감 API 통합

호스트 PowerShell에서 DB 컨테이너 `Up (healthy)`를 확인했다. Alembic revision은 `0001_species_catalog (head)`, 시드 결과는 `Seeded 5 species`. 실제 HTTP에서 목록 5건, 자리돔 검색, UUID 종 상세 응답을 확인했다. PowerShell의 첫 응답에서 한글 디코딩이 깨져 `charset=utf-8` 응답 헤더를 추가했고, 이후 한국어가 포함된 JSON이 정상 표시되는 것을 확인했다.

## 초기 단계 이력: 사진 선택 및 미리보기

당시 앱의 발견 사진 버튼에 Expo ImagePicker를 연결했고 사진은 로컬 URI로 미리보기만 했다. 업로드·식별·기록 저장 구현은 상단 TODO에서 후속 완료로 추적한다. Android 권한 허용·거부·선택 취소의 실제 기기 확인은 여전히 상단의 수동 확인 항목으로 남아 있다.





- 2026-11-01 호스트 확인: `alembic upgrade head`가 `0003_identification_jobs -> 0004_observations`를 실행했고, `alembic current`가 `0004_observations (head)`를 반환했다.
- 2026-11-01 호스트 확인 당시 `alembic current`는 `0005_api_rate_limit_events (head)`였다. 최신 사용자 확인에서는 `0007_ai_provider_circuit_breaker (head)`까지 적용됐다.
- 2026-11-02 사용자가 붙여넣은 `scripts/start-api.ps1` 실행 로그에서 `0008_external_ai_consent`와 `0009_account_deletion_tombstones` 적용, 종 5종 시드, Uvicorn startup complete를 확인했다. 사진 업로드/worker/모바일 전체 왕복까지 확인한 것은 아니다.
- 2026-11-02 업로드 재전송 경합을 막기 위해 `0010_separate_media_upload_objects`를 추가했다. presigned PUT은 전용 원본 키만 쓰고, 서버 정제 이미지/AI/앱 조회는 별도 최종 키를 사용한다. 원본 객체는 서명 만료 뒤 worker가 정리하며, 거부/삭제/계정 삭제 시 두 키 모두 정리한다. 계정 삭제는 아직 유효한 업로드 URL이 있으면 tombstone을 유지해 URL 만료 후 worker가 자동 완료한다. migration은 코드에 추가됐지만 사용자 DB 적용 및 실제 MinIO PUT/complete 경합은 아직 확인 전이다. API migration head·Python compile·offline SQL 생성과 모바일 `npm run typecheck`는 통과했다.
- 2026-11-02 Expo Android 정적 번들 생성도 성공했다: 806개 모듈, JS bundle 약 3.9 MB. 이는 Metro 번들링 확인이며 Android 기기 실행이나 네이티브 사진 선택 동작 검증은 아니다.
- 2026-11-02 사용자 API의 `/v1/health`는 `ok`였고 `/v1/client-config`는 외부 AI 비활성으로 응답했다. 이후 readiness에 스키마 검사를 추가한 최신 서버에서 `GET /v1/ready`가 `503 database_schema`, `expected_revision=0010_separate_media_upload_objects`, `current_revision=0009_account_deletion_tombstones`를 반환해 0010 미적용을 직접 확인했다. 작업 프로세스의 직접 Alembic 연결은 `localhost:5432` timeout, Docker CLI는 named pipe permission denied여서 이 환경에서는 마이그레이션을 적용할 수 없다.
- 2026-11-02 계정 삭제 worker가 활성 presigned URL을 가진 가장 오래된 pending 사용자에서 매 주기 멈추지 않도록, 미만료 `upload_storage_key`가 있는 tombstone을 선택 쿼리에서 제외했다. Python compile 및 PostgreSQL dialect SQL compile에서 `NOT EXISTS`와 `FOR UPDATE SKIP LOCKED`를 확인했다. DB/스토리지 실행은 건드리지 않았다.
- 2026-11-02 사진 업로드 복구를 보강했다. intent idempotency key를 서버/앱에 추가하고 키·media ID를 각 네트워크 단계 전에 draft에 저장한다. 앱 재시작 뒤 complete를 확인해 ready 업로드는 이어가고, 업로드가 없거나 만료된 경우 이전 pending media를 삭제 요청한 뒤 새 intent를 만든다. 저장 성공 뒤에는 `completedObservationId` marker를 먼저 저장/삭제해 stale save draft가 다시 화면에 나오지 않게 하고, 이미 쓴 idempotency key는 마지막 중복 방지로 남는다. `ACCOUNT_DELETE_UPLOAD_URL_ACTIVE` 응답이면 앱이 비공개 화면 상태를 비우고 Supabase 세션을 로컬 로그아웃한다. 모바일 typecheck는 통과했다; 실기기/서버 왕복은 미검증이다.
- 2026-11-02 API readiness가 PostgreSQL/MinIO뿐 아니라 최신 코드의 필수 Alembic revision `0010_separate_media_upload_objects`도 확인하도록 했다. schema 불일치는 `/v1/ready` 503과 expected/current revision으로 표시하고 worker 시작 helper도 ready가 아니면 중단된다. Python compile과 Alembic head 확인은 통과했다.
- 2026-11-02 최신 사용자 API에서 위 readiness 동작을 실제 확인했다: `/v1/ready`는 `503 database_schema`, 기대 `0010`, 현재 `0009`를 반환했고, PowerShell `ErrorDetails.Message` parsing도 같은 필드를 읽었다. `start-api.ps1`와 `start-worker.ps1`가 이 경우 현재/필요 revision과 먼저 실행할 조치를 안내하도록 보강했다. PowerShell parser 검증에 통과했다.
- 2026-11-02 업로드 intent 멱등성 모델/마이그레이션/서버 경로와 앱 복구 처리를 최종 점검했다. Python compile, Alembic `heads`(0010), offline SQL 생성, 모바일 `npm run typecheck`, PowerShell parser, `git diff --check` 통과. 모바일은 `IDEMPOTENCY_KEY_REUSED` 때 로컬 복구 상태를 초기화하고 새 업로드를 안내한다. 사용자 DB는 마지막 확인에서 0009이므로 0010 적용 및 MinIO/앱 왕복은 미검증이다.
- 2026-11-02 `scripts/start-mobile.ps1`을 추가해 앱 실행 전에 설정된 API의 `/v1/ready`를 확인하고 DB schema 불일치를 시작 방법과 함께 안내한다. Expo를 LAN 모드로 시작해 실제 Android 기기 연결의 첫 절차를 단축했다. 실행/QR 왕복은 사용자 PC·기기에서 확인 전이다.
- 2026-11-02 모든 React Native 모달의 콘텐츠 컨테이너에 modal accessibility scope를 지정해 화면 낭독기가 배경 화면으로 포커스를 이동하지 않도록 했다. TypeScript typecheck 및 Android 정적 export(806 modules, 약 3.9 MB) 통과. TalkBack/VoiceOver에서 실제 포커스 이동과 읽기 순서는 기기 확인 미완료다.
- 2026-11-02 완료된 upload intent 재요청에서 정제 후 크기와 최초 요청 크기를 비교하던 문제를 수정했다. `upload_byte_size`와 `upload_sha256`을 별도 보존하는 `0011_upload_request_fingerprints`를 추가했고, readiness 필수 revision과 API/기능명세 DB 필드를 갱신했다. 미적용 legacy ready row는 지문을 null로 유지해 완료 당시 없어진 원본 크기를 허위로 backfill하지 않는다. Python compile/Alembic head·offline SQL과 DB 적용은 아직 확인 전이다.
- 2026-11-02 코드 리뷰에서 발견한 빈 `Idempotency-Key`로 unique constraint 500이 날 수 있는 입력 경계를 막았다. API 계약에 `0010` ready legacy row fingerprint의 한계를 문서화했다.
- 2026-11-02 처리방침 초안을 작성하며 개별 발견 삭제 row가 무기한 남는 점을 확인해 기본 30일 보유 후 worker가 정리하도록 구현했다. 정리 순서는 오래된 soft-deleted observation 제거, 스토리지 삭제 완료·모든 참조 제거 확인 후 media row 삭제다. `DELETED_OBSERVATION_RETENTION_DAYS` 설정을 추가했고 TODO/기능명세/API 계약/README에 반영했다. 실제 DB/worker 실행 검증은 미완료다.
- 2026-11-02 별도 리뷰에서 soft-deleted observation → 확인된 media object deletion → 참조/활성 job 확인 후 media row 삭제 순서와 FK cascade/restrict 정합성을 점검했고 구체 결함은 발견되지 않았다. 실제 PostgreSQL/MinIO 경합·재시도는 미검증이다.
- 2026-11-02 도감/AI 초기 카탈로그를 5종에서 7종으로 넓혔다. NIFS 공식 e-연구바다에서 감성돔·참문어 국명/학명과 관련 연안·서식지 설명을 대조하고, 새 종의 생물학적 그림을 그리지 않은 채 중립 대체 화면 상태로 추가했다. JSON/UUID/slug/출처 필드 검증, 모바일 typecheck, Android export(806 modules, 3.9 MB) 통과. 사용자 DB 시드와 실제 검색 API는 미확인이다.
- 2026-11-02 현재 작업환경에서 API 전체 Python 모듈 `compileall`, Alembic `heads`, `upgrade head --sql` 생성이 통과했고 최신 revision은 `0012_retire_legacy_upload_intents`다. 모바일 `npm run typecheck`와 Android 정적 export(806 modules, 3.9 MB)도 통과했다. 이 결과는 코드/번들 정적 검증이며 사용자 DB 적용, API/worker 실행, Android 실기기 동작을 대신하지 않는다.
- 2026-11-02 코드 리뷰에서 삭제된 미디어의 presigned 업로드 URL이 아직 유효한 동안 worker가 객체 삭제를 확정해 늦은 PUT 객체를 남길 수 있는 경합을 발견했다. worker는 `expires_at + 15분` 이후에만 삭제 row를 최종 정리하고, 두 객체 삭제가 성공한 뒤 upload key를 비우도록 보완했다. Python compile은 통과했으며 실제 MinIO 지연 PUT 재현은 사용자 환경에서 확인해야 한다.
- 2026-11-02 `0010` 이전의 pending 업로드는 서명 URL과 정제본이 같은 object key를 쓸 수 있음을 확인했다. 새 `0012_retire_legacy_upload_intents` migration은 key 분리가 안 된 기존 pending row를 삭제 대기 상태로 전환하고, 옛 서명 URL 만료 뒤 worker가 기존 객체를 정리하도록 키를 보존한다. readiness gate도 `0012`를 요구하도록 올렸다. 실제 데이터 영향은 migration 적용 전 DB 확인이 필요하며, 진행 중이던 임시 업로드는 다시 시작해야 한다.
- 2026-11-02 계정 삭제 worker/API도 서명 업로드 URL의 만료 후 15분까지 tombstone과 media key를 유지하도록 맞췄다. 만료 직후에도 이미 진행 중인 PUT이 끝날 시간을 둔 뒤 worker가 객체를 제거한다. Python compile과 Alembic `0012` head 및 전체 offline SQL 생성은 통과했다.
- 2026-11-02 `0012` migration은 legacy `ready` 사진의 아직 유효한 URL이 있으면 적용을 중단하고 URL 만료+15분 뒤 재시도하도록 추가했다. 과거 pending/processing 업로드는 삭제 대기 상태로 바꾸고 원래 key를 보존하며, rejected/deleted row도 만료 유예 뒤 객체 정리와 계정 삭제가 이어지도록 한다. Offline SQL 생성 및 Python compile에서 새 revision까지 통과했다.
- 2026-11-02 같은 업로드 멱등 키 재시도 때 새 URL의 TTL과 DB `expires_at`이 어긋나 worker가 먼저 지울 수 있는 상태를 수정했다. 매 URL 발급 시각을 만료에 저장하고 서명 생성 성공 후 커밋하도록 바꿨다. 서명 생성 실패는 트랜잭션 rollback으로 만료 연장/신규 intent 생성을 남기지 않는다. API Python compile과 전체 Alembic offline SQL 생성 통과; 실제 MinIO 재발급/지연 PUT은 미검증이다.
- 2026-11-02 업로드 재시도 API의 idempotency 행 조회에 `FOR UPDATE`를 추가해 worker가 만료 객체를 삭제하는 동안 완료된 행에 새 URL을 잘못 발급하지 않도록 직렬화했다.
- 2026-11-02 기존 코드에서 URL 재발급 때 만료시각이 낡을 수 있음을 고려해 migration 0012의 안전 가드를 현재 `UPLOAD_INTENT_TTL_SECONDS`만큼 더 보수적으로 잡고, retire 대상의 만료시각도 migration 시점부터 TTL 전체를 보장하도록 연장했다. 적용 안내에는 old TTL 유지와 최대 `2 × TTL + 15분` 대기를 명시했다. Python compile 및 offline SQL 생성 통과.
- 2026-11-02 오프라인으로 내보낸 SQL을 직접 적용해도 migration 0012의 기존 ready URL 보호를 건너뛰지 않게 PostgreSQL `DO` 검사문을 SQL 파일에 포함했다. 생성된 SQL에서 검사문과 기본 설정 기준 2100초 대기 안내를 확인했다.
- 2026-11-02 병렬 코드 검토에서 계정 삭제/worker 지연 정리와 0012 이후 모바일 구버전 업로드 복구를 확인했다. 두 경로 모두 기존 만료 유예·자동 재시도와 `UPLOAD_INTENT_NOT_REUSABLE` 후 새 키 생성으로 연결되며 추가 재현 결함은 나오지 않았다. 실DB·MinIO·기기 실행 확인은 아니다.
- 2026-11-02 네이티브 development build를 만들 수 있도록 Expo에 Android package와 iOS bundle ID를 임시 `com.oceandiary.app`으로 설정하고 Android/iOS 초기 build number를 지정했다. Expo public config, TypeScript typecheck, Android static export(806 modules, 3.9 MB)가 통과했다. 실제 앱 설치/기기 구동은 아니며 스토어 제출 전 게시자 고유 ID 사용 가능 여부를 확인해야 한다.
- 2026-11-02 따뜻한 색의 물고기·현장 노트 아이콘을 1024×1024 PNG로 제작해 Expo app icon과 시작 화면에 연결했다. Expo config가 아이콘/스플래시 경로와 임시 앱 ID를 읽었고 Android static export(806 modules, 3.9 MB)가 통과했다. Android 런처 마스크와 실제 기기 스플래시 표시 검토는 남아 있다.
- 2026-11-02 Android adaptive icon 마스크에서 그림이 잘리지 않도록 중앙 안전 영역에 놓인 투명 foreground 자산을 별도 제작하고 `android.adaptiveIcon`에 연결했다. Expo public config와 Android static export(806 modules, 3.9 MB)가 통과했다; 실제 launcher mask는 단말에서 확인해야 한다.
- 2026-11-02 NIFS 종 설명에 맞춰 감성돔(타원형의 어두운 몸색, 등지느러미 가시)과 참문어(둥근 외투막, 8개 팔, 반점)의 따뜻한 그림책 SVG 초안을 추가하고 카탈로그 variant를 연결했다. 종별로 검증된 완성 삽화가 아니라 생물학 검수 전 초안이며 실제 다이버 피드백은 남아 있다. 모바일 TypeScript typecheck 통과, 카탈로그 7종/신규 variant 확인, Android export 806 modules/2.6 MB 통과. 기본 Windows temp 경로 쓰기 권한 문제는 프로젝트 내 임시 경로를 지정해 해결했다.
- 2026-11-02 `start-mobile.ps1 -ApiUrl`이 준비 확인에만 인자를 쓰고 Expo 앱 번들에는 전달하지 않아 실기기에서 앱이 기존 `127.0.0.1`로 요청할 수 있던 경로를 수정했다. 인자를 `EXPO_PUBLIC_API_URL`로 Expo 프로세스에 전달하고 실행 종료 후 환경값을 복구한다. README에 PC LAN 주소와 MinIO signed URL host 설정도 명시했다. PowerShell parser와 `git diff --check`가 통과했다.
- 2026-11-02 `.env.example`의 loopback API 기본값은 실제 폰이 PC에 접속할 수 없으므로, `start-mobile.ps1`이 기본값을 읽은 경우 Windows 기본 경로의 IPv4를 자동 선택하도록 보완했다. URL 형식 검증과 네트워크 주소 탐지 실패 시 `-ApiUrl` 사용 안내를 추가했다. 명시적으로 loopback URL을 넘기면 Expo Go에서 접근 불가하다는 오류를 바로 표시한다. PowerShell parser 검증을 통과했다. 현재 실행 환경에는 LAN 기본 경로가 없어 자동 IP 적용 상태는 확인하지 못했으며 명시적 주소 전달 경로가 대안이다.
- 2026-11-02 실기기 앱이 API뿐 아니라 MinIO의 presigned 주소에도 직접 접근해야 하는 조건을 반영해 시작 helper가 API의 LAN 주소 사용 시 `S3_PUBLIC_ENDPOINT_URL`의 loopback 기본값을 검사하도록 했다. `.env`에서 해당 설정만 읽고 다른 값은 출력하지 않으며, 미설정/loopback이면 API를 재시작해야 할 구체 설정과 Docker 내부용 `S3_ENDPOINT_URL`은 유지하라는 안내로 중단한다. PowerShell parser 검증을 통과했다.
- 2026-11-02 모바일 화면의 인터랙션을 TSX 소스에서 정적으로 훑었다. 사용자가 조작하는 Pressable 40개와 TextInput 10개에 명시적 역할/접근성 이름이 존재하며, 바깥 모달 닫기·콘텐츠 컨테이너 Pressable은 접근성 트리에서 제외되어 있음을 확인했다. 실제 TalkBack 읽기 순서/알림 동작은 기기 확인 항목으로 유지한다.
- 2026-11-02 `npm audit`와 `npm ls`로 모바일 lockfile을 확인했다. 11 moderate 항목은 `glob`의 AbortSignal 취소 뒤 탐색 지속과 `minimatch` 입력 패턴 증폭 DoS 두 advisories가 Expo 58 CLI 하위에 전파된 결과였다. Expo SDK 58을 내리지 않고 `glob@14.0.2`, `minimatch@11.0.1` overrides를 추가했다. 고정된 API는 Expo 58 설정/CLI 코드에서 사용하는 sync glob 호출 형태를 보존하고, Node 엔진 요구도 프로젝트 Node 22와 맞는다. 설치 후 `npm audit` 0건, Expo 58 CLI 의존성 트리에서 두 패치 버전 적용, TypeScript typecheck, Android 정적 export(806 modules, 2.6 MB)가 통과했다. 실제 native Android release build/기기 실행은 아직 검증하지 않았으며 출시 직전 재감사한다. [glob advisory](https://github.com/advisories/GHSA-3g3m-2fjr-6pw4), [minimatch advisory](https://github.com/advisories/GHSA-g3hv-75wg-m249).
- 2026-11-02 로컬 환경에서 JDK 17은 있으나 Android SDK, `adb`, Gradle은 없어 네이티브 APK 생성은 불가능한 것을 확인했다. EAS `preview` internal APK 및 `production` app-bundle profile을 추가하고, 배포 빌드에서 실제 HTTPS API origin이 없거나 loopback/자격증명을 포함하면 config resolution이 중단되도록 했다. 앱 config syntax, EAS profile JSON 및 `npx expo config --type public --json`이 통과했다. Expo/EAS 원격 빌드는 프로젝트 소스 업로드와 EAS 로그인/실서비스 URL을 요구하므로 시작하지 않았다.
- 2026-11-02 현재 작업 경로에 프로젝트 루트 `.env`가 없는 것을 확인했다. `start-api.ps1`이 누락된 경우에만 `.env.example`을 복사해 로컬 개발용 설정을 준비하고, 기존 사용자 설정은 덮어쓰지 않으며 실기기 MinIO 주소 변경 안내를 출력하도록 했다.
- 2026-11-02 Android 원격 빌드 직전 단계의 모호함을 줄이기 위해 README에 EAS 로그인/프로젝트 연결과 preview·production 환경별 `EXPO_PUBLIC_API_URL` 등록 명령을 추가했다. 예시 도메인은 배포 시 실제 HTTPS API 주소로 교체해야 한다. 외부 EAS 프로젝트 생성/환경 변수 등록/소스 업로드는 계정 및 실제 운영 API가 아직 준비되지 않아 실행하지 않았다.
- 2026-11-02 현재 실행 중인 로컬 API의 `/v1/health`는 빠르게 `200 OK`를 반환하지만 `/v1/ready`는 `503 database_schema`(`current_revision=0009`, `expected_revision=0012`)를 즉시 반환했다. 이는 API 응답 지연이 아니라 사용자 DB에 최신 schema migration이 미적용된 상태다. `0012`는 유효 기간 내 구버전 사진 URL이 완료 사진을 덮어쓸 수 있는 경우 안전하게 중단되도록 되어 있다. 실행 중 API를 먼저 종료한 뒤 프로젝트 루트 `scripts/start-api.ps1`로 마이그레이션해야 한다. migration이 업로드 URL 대기 시간을 요구하면 `.env` TTL을 바꾸지 않고 안내된 시간(기본 35분) 후 재시도한다.
- 2026-11-02 멀티 에이전트 코드 리뷰로 사진 선택→업로드 완료→식별→후보/수동/미확인 선택→발견 저장→개인 도감 갱신 핵심 흐름을 현재 소스와 API 경로에서 대조했다. 해당 코드 흐름을 막는 재현 가능한 코드 결함은 발견되지 않았다. 이 검토는 앱/DB/MinIO 실기기 왕복이나 실제 AI 정확도를 검증한 것은 아니며 해당 TODO는 미완료로 유지한다.
- 2026-11-02 강제 종료가 사진 파일 복사와 초안 manifest 저장 사이에 일어나면 앱 내부에 고아 임시 사진이 남을 수 있어, 앱 시작 시 manifest가 참조하는 사진 하나만 보존하고 `ocean-diary-photo-*` 파일을 정리하도록 추가했다. 다른 앱 문서나 사용자가 선택하지 않은 사진은 탐색/삭제하지 않는다. 기능명세에 반영하고 모바일 TypeScript typecheck를 통과했다. Android에서 실제 강제 종료 후 복구 동작은 기기 확인이 남아 있다.
- 2026-11-02 개인정보 처리방침 내부 초안에도 미완성 발견 작성 중 기기 내 임시 사진 보유와 종료/로그아웃/시작 시 정리 경로를 설명하고, 출시 전에 Android/iOS OS 백업 동작을 확인하도록 추가했다. 운영자·수탁자·리전·법률 근거 검토 전 공개 금지 상태는 유지한다.
- 2026-11-02 사진 초안이 Android Auto Backup/iOS 기기 백업에 섞이지 않도록 앱 private Documents 대신 OS cache에 복사하도록 바꿨다. Expo 문서상 cache는 purgeable이므로 복구 시 사진이 사라진 경우 서버 초안을 정리하고 새 사진 선택 안내를 표시한다. manifest에 연결되지 않은 앱 전용 cache 사진을 시작 때 정리한다. 기능명세와 개인정보 초안을 갱신했으며 모바일 TypeScript 검사 통과; 실제 Android/iOS 백업 제외 및 cache purge 재현은 단말 확인 전이다. [Expo](https://docs.expo.dev/versions/v58.0.0/sdk/filesystem/), [Android](https://developer.android.com/identity/data/autobackup), [Apple](https://developer.apple.com/documentation/foundation/using-the-file-system-effectively)
- 2026-11-02 cache 기반 사진 초안 변경 뒤 모바일 `npm run typecheck`와 Android 정적 export가 통과했다(806 modules, 3.9 MB). export는 JS bundle resolution만 확인하며 native 빌드/기기 cache purge는 검증하지 않는다. 같은 시점 `/v1/ready`는 `503 database_schema`(`current_revision=0009`, `expected_revision=0012`)를 반환했다. `0012` migration은 코드상 준비됐고 단일 head이나 사용자 DB 적용은 아직 미완료다.
- 2026-11-02 초안 복구가 계정 전환으로 다시 실행될 때, 이전 계정의 hydration 완료 상태가 새 계정 복구 완료 전에 남을 수 있는 틈을 닫았다. 복구 effect 시작 시 hydration/login-wait 상태를 즉시 초기화한다. 모바일 `npm run typecheck` 통과; Android 정적 export도 806 modules, 3.9 MB로 완료했다. 이는 TypeScript/Metro 정적 확인이며 실제 앱·계정 전환·백업 동작 확인은 아니다.
- 2026-11-02 `0012` 적용 순서를 명확히 했다. 마이그레이션 중 오래된 worker가 media row를 갱신하지 않도록 API와 worker를 모두 정지한 뒤 API 시작 스크립트를 실행하고, `/v1/ready=ready`를 확인한 다음 worker를 재개하도록 README와 시작 스크립트 안내를 보완했다. PowerShell parser, migration `py_compile`, Alembic 단일 head(`0012_retire_legacy_upload_intents`), 전체 offline SQL 생성 및 `git diff --check` 통과. 사용자 DB migration과 storage 요청 경합은 아직 실행하지 않았다.
- 2026-11-02 API/worker/mobile 시작 helper가 `/v1/ready`의 `database_schema`가 현재 필수 revision `0012_retire_legacy_upload_intents`와 일치하는지도 확인하도록 했다. schema field가 없는 구버전 API에 앱/worker가 연결되거나 시작 스크립트가 새 API 실행을 건너뛰지 않도록 중단 메시지를 추가했다. 세 PowerShell 스크립트 parser와 `git diff --check` 통과; 실제 실행은 하지 않았다.
- 2026-11-02 앱 전용 초안 사진 삭제 경로 검사를 디렉터리 경계 기준으로 정규화해 `DocumentsX` 같은 접두 경로를 내부 폴더로 잘못 인정하지 않게 했다. 로컬 파일 삭제 실패는 서버 삭제/화면 정리를 막지 않도록 최선 노력으로 처리한다. 모바일 `npm run typecheck`와 `git diff --check` 통과; 기기 파일 시스템 동작은 미확인이다.
- 2026-11-02 사용자가 사진을 고르기 전에 선택 사진 사본이 앱 문서 폴더에 임시 저장되고 OS 기기 백업 설정에 따라 백업될 수 있음을 홈 화면에 안내한다. 저장 완료·취소·로그아웃 뒤 삭제된다고 함께 표시하며, 기능명세와 TODO를 실제 앱 문구에 맞췄다. 모바일 `npm run typecheck` 통과; 실제 Android/iOS 백업 동작은 출시 전 확인 항목으로 남긴다.
- 2026-11-02 사용자 migration 로그에서 `0010` revision 이름을 `alembic_version.version_num VARCHAR(32)`에 쓸 수 없어 `StringDataRightTruncation`이 난 것을 확인했다. 사용자 로그의 후속 `alembic current`는 `0009_account_deletion_tombstones`여서 migration 트랜잭션 rollback 상태임을 확인했다. `0010` upgrade 시작 시 version 칼럼을 `VARCHAR(128)`로 확장하도록 수정했다. Migration `py_compile`과 전체 offline SQL 생성 통과; 출력에서 칼럼 확장이 0010 revision UPDATE보다 먼저임을 확인했다. 사용자는 기존 API/worker를 종료한 뒤 `services/api`에서 `python -m alembic upgrade head`를 재시도할 수 있다.
- 2026-11-02 read-only migration review에서 표준 `upgrade head` 경로는 PostgreSQL 트랜잭션 안에서 칼럼 확장을 수행한 뒤 0010/0011/0012 revision을 기록하므로 새 DB와 0009 이하 DB 모두 이 수정이 적용됨을 확인했다. 수동 `alembic stamp` 경로는 이 upgrade 함수를 건너뛰므로 배포 명령으로 사용하지 않는다. DB 변경을 직접 실행한 검증은 아니다.
- 2026-11-02 사용자 PowerShell 로그에서 수정된 migration을 재실행해 `0009 -> 0010 -> 0011 -> 0012` 모두 적용했고 `alembic current`가 `0012_retire_legacy_upload_intents (head)`임을 확인했다. API 재기동 후 `/v1/ready` 응답 확인은 아직 남아 있다.
- 2026-11-02 사진 초안 카드가 화면을 닫은 뒤 업로드/식별을 재개하는 경로를 확인했다. 다만 `사진 바꾸기`를 탭하면 초안을 교체할 수 있어, 기존 초안 삭제 의도를 확인하는 대화상자를 추가했다. 새 사진 선택기를 취소하면 이전 초안을 보존한다. 발견 상세 진입 때 상세 API를 재조회해 10분 만료 사진 URL을 갱신하도록 연결했다. 모바일 `npm run typecheck` 및 Android 정적 export(806 modules, 3.9 MB) 통과; 기기 동작은 미확인이다.
- 2026-11-02 사진 업로드 요청 중에는 홈 CTA를 비활성화하고 `pickPhoto()` 및 CTA handler 양쪽에서 상태를 확인해 모달/화면 경로와 무관하게 현재 업로드와 다른 사진 선택이 경쟁하지 않도록 했다. 모바일 `npm run typecheck` 통과.
- 2026-11-02 사진 미리보기, 식별, 저장 완료, 발견 상세의 독립 이미지에 화면 낭독기가 용도를 알 수 있는 대체 이름을 붙였다. 카드 안 이미지들은 상위 접근성 버튼 이름에 종/기록 목적이 들어 있어 중복 포커스는 만들지 않았다. 모바일 TypeScript 검사 통과; TalkBack/VoiceOver 기기 검증은 남아 있다.
- 2026-11-02 사진 백업 안내 UI를 포함한 Android 정적 export가 806 modules, 3.9 MB bundle로 완료됐다. Metro bundle 생성 확인이며 native 앱 설치/기기 동작은 검증하지 않았다.
- 2026-11-02 사진 초안의 명시적 취소 동작을 사진 미리보기와 식별 화면에 연결했다. 확인 후 앱 cache 사진/초안 상태를 지우고 서버 미디어 삭제를 요청하며, 서버는 해당 미디어의 식별 작업과 후보를 함께 제거한다. 이미 외부 AI 요청이 시작된 경우 요청 자체는 취소되지 않고 결과만 폐기된다는 안내를 추가했다. 기존 복구 규칙에 맞춰 화면을 닫는 동작은 초안을 보존한다. 앱 안내·기능명세·개인정보 초안에서 이전 Documents/OS 백업 문구를 cache purge 가능성에 맞게 정리했다. `npm run typecheck`, `python -m py_compile app/media.py`, `git diff --check` 모두 통과했다. 실기기·DB·스토리지 확인은 하지 않았다.
- 2026-11-02 사용자가 첨부한 이전 PowerShell 기록은 수정 전 `0010` 실패와 `0009` rollback 상태를 보여준다. 이후 별도 사용자 로그에서 수정 migration으로 `0010`~`0012` 적용 및 `0012_retire_legacy_upload_intents (head)` 확인을 받았으므로 DB migration 완료로 추적한다. 최신 API `/v1/ready` 점검은 아직 사용자 환경에서 남아 있다.
- 2026-11-02 앱 실행 중 운영체제가 초안 cache 사진을 정리한 경우를 보강했다. 사진 미리보기와 식별 화면에서 이미지 오류를 설명하는 대체 UI를 표시하고, 아직 업로드되지 않은 사진은 재선택 전까지 업로드할 수 없게 했다. 서버 업로드 완료 상태는 기기 사본이 없어도 기존 서버 사진으로 계속 기록하도록 구분했다. 기능명세의 S04/S06 상태에 동작을 반영했다. 모바일 `npm run typecheck`와 수정 세 파일의 후행 공백 검사를 통과했다. 프로젝트 파일이 아직 Git 미추적 상태라 `git diff --check`는 신규 파일을 검사하지 않는다. 실제 cache 정리·기기 UI는 미확인이다.
- 2026-11-02 초안의 `계속 기록` 동작이 사진 미리보기 모달에서 확인 대화상자로 실행될 때 다른 모달을 닫지 않고 식별 화면을 열 수 있음을 코드 검토에서 발견했다. 현재 media 업로드 상태에 맞는 모달만 노출하도록 `resumeCurrentDraft`의 두 분기를 보완했다. 모바일 `npm run typecheck`와 변경 파일 후행 공백 검사 통과; 모달 스택은 실제 기기에서 확인하지 않았다.
- 2026-11-02 발견 상세의 만료/실패 사진 URL 복구를 보강했다. 상세 이미지는 로드 실패를 화면 상태로 표시하고 `사진 다시 불러오기`가 관찰 상세 API를 다시 조회해 새 서명 URL을 받는다. 인증 계정/현재 상세가 바뀌거나 갱신 요청이 겹친 뒤 늦게 온 결과가 최신 URL을 덮지 않도록 ID·요청 epoch·최신 상세 갱신 순번을 확인하고, 이전 URL의 늦은 이미지 오류가 새 URL 표시를 가리지 않도록 실패 상태를 발견 ID와 해당 URL 쌍에 묶었다. 기능명세 S11에 반영했다. 모바일 `npm run typecheck`와 수정 파일 후행 공백 검사 통과; 실제 presigned URL 만료·이미지 로드 실패는 실기기에서 확인하지 않았다.
- 2026-11-02 홈 최근 발견, 전체 발견 목록, 저장 완료 카드에도 공통 사진 컴포넌트를 연결했다. 각 사진 URL 로드 실패 때 작은 오류 대체 화면을 표시하고 새 URL에서는 다시 이미지를 시도한다. 목록 사진은 이미 이름이 있는 부모 버튼과 중복 포커스를 만들지 않게 하고, 저장 완료 카드에서만 사진 자체에 접근성 이름을 준다. 기능명세 공통 화면 규칙에 반영했다. 실제 만료 URL·기기 화면 확인은 남아 있다.
- 2026-11-03 공통 사진 오류 컴포넌트에서 최근/목록 카드의 부모 버튼과 중복 접근성 포커스를 만들지 않게 조정하고, 독립 사진인 저장 완료 카드에만 이미지 이름을 제공했다. cache 사진 업로드 전 실제 파일 존재 여부를 확인해 이미지 이벤트가 아직 실패를 보고하지 않아도 네트워크 요청 전에 재선택 상태로 안내한다. TypeScript 검사, worker Python 문법 검사, 변경 파일 후행 공백 검사를 통과했다. 실제 스토리지/폰 동작은 미검증이다.
- 2026-11-03 현재 실행 API의 read-only 확인에서 `/v1/ready`가 `200 ready` (`database_schema=0012_retire_legacy_upload_intents`, `media_storage=ok`)를 반환했다. `/v1/species?limit=50`은 7종을 반환했고 `query=자리돔`은 `Chromis notata` 1종을 반환했다. API 최신 코드 동작 전체, worker, 사진 업로드/정리 왕복은 이 조회로 검증되지 않았다.
- 2026-11-03 cache 사진 존재 검사를 `localPhotoExists` 함수로 통합해 잘못되었거나 사라진 URI의 파일 검사 예외가 업로드/재업로드 버튼 이벤트 밖으로 새지 않게 했다. 모바일 `npm run typecheck`, worker `py_compile`, 수정 파일 후행 공백 검사를 모두 통과했다.
- 2026-11-03 upload preflight 통과 직후 운영체제가 cache 사진을 지우는 경쟁 조건을 처리했다. 실제 `fetch(file URI)` 또는 blob 읽기가 실패하면 네트워크/서버 오류 문구 대신 사진 누락 상태와 재선택 안내를 표시한다. 모바일 `npm run typecheck`와 변경 파일 후행 공백 검사를 통과했다.
- 2026-11-03 API 계약에서 모바일에 연결된 그림책 SVG 초안이 5종으로 표기된 문구를 현재 7종으로 수정했다. 서버 `artwork: null`은 asset이 서버에 등록되지 않았다는 뜻이고 앱 번들 SVG fallback으로 그림을 보여주는 현재 동작을 설명했다. 기능명세의 DB revision/실기기 상태를 최신 확인 시점 기준으로 맞췄다.
- 2026-11-03 카탈로그의 원격 `artwork` URL을 읽지 못할 때 broken image 대신 같은 종의 앱 번들 SVG로 돌아가도록 목록/상세에 공통 연결했다. API asset이 null인 기존 종과 원격 이미지 오류 종이 모두 일관된 그림 fallback을 사용하게 했다. 모바일 `npm run typecheck`, 806-module Android Metro/Hermes static export(2.6 MB), 변경 파일 후행 공백 검사를 통과했다; 원격 artwork 서버 오류 실제 시뮬레이션은 수행하지 않았다.
- 2026-11-03 Expo Android 정적 export가 처음에는 sandbox 사용자 임시 경로에 Hermes bytecode를 쓸 수 없어 실패했다. TMP/TEMP를 프로젝트 내 `.tmp-expo/build-temp`로 지정한 뒤 동일한 export가 성공했고, 806개 모듈에서 2.6 MB Hermes bundle을 생성했다. 이는 Metro/Hermes 번들 생성 확인이며 Android native build·설치·실기기 동작은 검증하지 않았다.
- 2026-11-03 Android SDK의 `adb.exe`는 있지만 이 실행 환경에서 ADB server를 기본 포트 5037 및 대체 5038로 시작하지 못했다(`could not read ok from ADB Server`). 따라서 연결된 휴대폰 목록을 확인하지 못했고 TalkBack/USB 실기기 검증은 미완료로 남긴다. API worker는 시작하지 않았으며 외부 유료 AI도 호출하지 않았다.
- 2026-11-03 초안 취소/사진 교체 직전에 시작된 식별 요청의 늦은 응답이 새 초안에 결과를 덮을 수 있는 경합을 막았다. 식별 요청 세대를 구분해 새 요청이 이전 요청을 대체하고, 취소 및 사진 재업로드 때 진행 중인 create/poll 네트워크 요청도 abort한다. 이전 응답·오류·폴링 결과는 화면 상태에 반영되지 않는다. 모바일 `npm run typecheck`와 `git diff --check` 통과; 취소/교체 경합은 기기에서 재현 검증하지 않았다.
- 2026-11-03 최신 검증: 모바일 `npm run typecheck` 통과, Android Expo 정적 export 성공(806 modules, 3.9 MB; bytecode/minify 비활성화). API `compileall`과 Alembic 단일 head `0012_retire_legacy_upload_intents` 확인, 실행 중 API `GET /v1/ready`도 `ready`/schema `0012`/storage `ok` 반환. Android 실기기, worker, 사진 저장 왕복, 외부 AI는 이 정적/준비 검사로 검증되지 않았다.
- 2026-11-03 식별 요청 중단 처리를 추가한 최종 모바일 변경 뒤 `npm run typecheck`, Android 정적 export(806 modules, 3.9 MB), `git diff --check`가 통과했다. export는 Metro/Hermes bundle 생성만 확인하며 네이티브 앱 실행/AbortController의 단말 동작은 별도 실기기 검증이 필요하다.
- 2026-11-03 배포 앱 설정 검증이 사설 IPv4/IPv6(IPv4-mapped IPv6 포함)·link-local·CGNAT 주소와 `.local`/`.lan`/`.internal`/placeholder 도메인, URL 경로·query·fragment를 허용할 수 있는 점을 보완했다. preview/production은 실제 공개 HTTPS API origin만 받도록 하고, EAS profile과 `OCEAN_DIARY_BUILD_TARGET`이 불일치하면 빌드 설정 오류로 처리한다. README 조건도 맞췄다. `node --check app.config.js`, 모바일 `npm run typecheck`, `git diff --check`, 수정 파일 후행 공백 확인 통과. EAS 설정에 실제 운영 주소를 넣은 원격 build는 수행하지 않았다.
- 2026-11-03 위 앱 설정 변경 뒤 Expo Android 정적 export가 791 modules, 3.9 MB bundle로 성공했다. 이는 Expo 설정 로드와 Metro bundle 생성 확인이며 EAS APK/AAB 빌드·설치 검증은 아니다.
- 2026-11-03 명세 S08 후보 카드에 빠져 있던 종별 그림을 연결했다. 후보는 카탈로그 thumbnail artwork를 쓰고, URL 누락/로드 실패는 해당 종의 앱 번들 SVG로 대체한다. 카드 전체가 기존 종명·학명·신뢰 구간 접근성 이름을 유지하며 이미지는 중복 읽기 포커스에서 제외했다. 모바일 `npm run typecheck`와 Android 정적 export(806 modules, 3.9 MB) 통과; 실제 화면 크기/기기 시각 확인은 미완료다.
- 2026-11-03 홈에서 진행 중인 사진 초안 미리보기도 공통 원격/로컬 사진 오류 대체 컴포넌트를 사용하도록 연결했다. OS가 앱 임시 사진을 지웠을 때 홈 카드에 깨진 이미지를 남기지 않고, 카드의 상위 버튼이 초안 목적을 읽어 이미지가 중복 포커스가 되지 않는다. 모바일 `npm run typecheck`와 Android 정적 export(806 modules, 3.9 MB) 통과; OS cache 정리 UI는 단말에서 재현하지 않았다.
- 2026-11-03 초안 홈 카드의 고정 접근성 이름이 화면에 표시된 식별 진행 상태를 보조기술 사용자에게 알리지 않던 점을 보완했다. queued/running이면 이어하기 이름에 식별 중을 포함하고 `busy` 상태를 노출한다. 모바일 `npm run typecheck`와 Android 정적 export(806 modules, 3.9 MB) 통과; TalkBack 읽기 순서는 실제 기기 검증이 필요하다.
- 2026-11-03 발견 상세의 관찰 날짜 수정 입력을 새 기록 화면과 같은 `YYYY-MM-DD` 10자 제한과 숫자·구두점 키보드로 맞췄다. 실제 달력 날짜 검증과 서버 UTC 변환은 기존 저장 경로에서 계속 적용한다. 모바일 `npm run typecheck`와 Android 정적 export(806 modules, 3.9 MB) 통과.
- 2026-11-03 발견 삭제/미디어 정리 순서를 정적으로 재검토했다. API는 발견·미디어 row를 잠그고 마지막 활성 발견일 때만 미디어 삭제 상태와 대기 job 실패를 같은 트랜잭션에 기록한다. Worker는 미디어 row 잠금, 업로드 URL 만료 유예, 활성 발견/식별 job 부재, 두 객체 삭제 확인 후에만 key와 DB row를 정리한다. `observations.py`/`worker.py` `py_compile` 및 Alembic 단일 head `0012_retire_legacy_upload_intents` 확인. 다중 worker·실제 PostgreSQL/MinIO 재시도 동작은 미검증이다.
- 2026-11-03 pending 계정 삭제 worker에서 오래된 요청 하나가 계속 실패할 때 다른 계정 tombstone까지 굶는 문제를 수정했다. 한 번의 cleanup pass에서 처리했거나 실패한 사용자 ID를 제외하며 최대 `limit`건을 살펴보고, 실패 tombstone은 다음 60초 주기에 다시 시도한다. worker `py_compile`과 Alembic 단일 head `0012_retire_legacy_upload_intents` 확인; worker/runtime DB/Auth 실패 재현은 수행하지 않았다.
- 2026-11-03 EAS preview/production 설정 검증에서 필수 로그인 설정이 빠진 상태로 배포 앱이 만들어질 수 있고, 클라이언트 키 변수에 server secret이 실수로 들어갈 수 있음을 막았다. 두 distribution profile은 이제 공개 HTTPS API origin, Supabase project origin, `sb_publishable_...` 또는 legacy anon JWT를 요구하며 dev token·secret/service-role key를 거부한다. README에 두 EAS 환경 설정 명령을 추가했다. `node --check app.config.js`, 모바일 `npm run typecheck`, Android 정적 export(806 modules, 3.9 MB), 수정 파일 후행 공백 검사를 통과; EAS 원격 환경/실제 키/빌드는 미구성·미실행이다.
- 2026-11-03 실제 자격 증명 없이 공개 테스트 형식 URL/key를 사용해 Expo public config resolution을 preview와 production 둘 다 수행했다. 두 target 모두 `OCEAN DIARY` / `com.oceandiary.app` config를 반환해 새로운 필수 Supabase 설정 검사가 해당 프로필에서 실행됨을 확인했다. 이는 EAS 원격 환경·실제 Supabase 자격 증명·APK/AAB 결과를 검증한 것은 아니다.





- 2026-11-03 모바일 `.env.example`의 Supabase 설정 주석을 로컬 개발과 EAS 배포 기준으로 분리했다. 로컬은 비워 둘 수 있고, preview/production은 공개 project URL과 publishable/legacy anon key가 필요하며 secret/service-role key는 `EXPO_PUBLIC_` 변수에 넣지 않는다고 안내한다. 파일 내용 확인 및 수정 문서 후행 공백 검사를 완료했다; 실제 EAS 환경 값과 배포 빌드는 미확인이다.
- 2026-11-03 Supabase 세션을 일반 AsyncStorage 대신 Expo SecureStore(Android Keystore/iOS Keychain)에 암호화 저장하도록 교체했다. 900 UTF-8 byte 단위 청크와 manifest pointer로 플랫폼 단일 값 크기 제한을 피하고, 기존 AsyncStorage 세션은 보호 저장 성공 후 한 번만 제거한다. SecureStore config plugin을 추가해 Android Auto Backup에서 SecureStore 영역을 제외하도록 구성했다. privacy 초안과 기능명세를 갱신했다. Expo SDK 58 SecureStore `~58.0.2` 설치 시 npm audit 0 vulnerabilities, 모바일 typecheck, Expo config의 plugin 포함 확인, Android 정적 export(809 modules, 2.6 MB), 문서 공백 검사를 통과했다. 실기기 로그인/갱신/로그아웃·기존 세션 migration·Android/iOS 백업 복원 확인은 남아 있다.
- 2026-11-03 세션 이전 helper가 storage object의 암묵적 `this` 바인딩에 의존하지 않도록 분리하고, 보호 저장소 기록 직후 앱이 종료된 경우 다음 실행 때 남아 있는 기존 AsyncStorage 사본도 정리하도록 했다. 변경 후 모바일 TypeScript 검사와 Android 정적 export(809 modules, 2.6 MB)가 다시 통과했다. 네이티브 keychain/keystore 접근은 실제 기기에서 검증하지 않았다.
- 2026-11-03 앱 구조를 한 번에 재작성하지 않는 기능명세 원칙에 따라 공통 종 일러스트·발견 사진 오류 대체 렌더러를 `src/components/ObservationImages.tsx`로, 종 API 타입을 `src/types/species.ts`로 분리했다. 화면 코드 동작은 유지하고 `App.tsx`의 중복 구현·스타일 의존을 제거했다. TypeScript 검사 및 Android 정적 export(810 modules, 2.6 MB) 통과; 실제 화면·TalkBack은 기기 확인이 남아 있다.
- 2026-11-03 홈의 종 도감 섹션(검색, 오프라인 안내/재시도, 빈 결과, 카드·발견 수)을 `src/features/catalog/CatalogCollectionSection.tsx`로 분리했다. 검색 상태, 선택 모달, API retry key는 상위 화면이 계속 소유해 현재 흐름을 유지한다. TypeScript 검사와 Android 정적 export(811 modules, 2.6 MB)가 통과했다; 실기기 화면·TalkBack 확인은 미완료다.
- 2026-11-03 이메일 로그인 모달의 화면·입력 UI를 `src/features/auth/AuthModal.tsx`로 분리했다. 인증 코드 발송/검증, session state, 화면 복귀 동작은 기존 App 상위 로직이 유지하고 controlled props로만 연결했다. TypeScript 검사 및 Android 정적 export(812 modules, 2.6 MB) 통과; 실기기 로그인·TalkBack 동작은 미검증이다.
- 2026-11-03 종 상세 S02를 `src/features/catalog/SpeciesDetailModal.tsx`로 옮겼다. 일러스트 fallback, 종 정보, 발견 횟수·첫/최근 날짜, 모달 닫기 UI를 분리했고 선택된 종/발견 데이터는 기존 App 상태를 사용한다. TypeScript 검사 및 Android 정적 export(813 modules, 2.6 MB) 통과; 화면 치수·접근성은 실기기에서 확인하지 않았다.
- 2026-11-03 개인 발견 목록 S09의 화면을 `src/features/observations/ObservationListModal.tsx`로 분리하고 `ObservationCard`·필터 타입을 공유 타입 파일로 옮겼다. 전체/미확인 필터, 목록·빈/오류/로딩/페이지 추가 UI를 유지하며 조회·재시도·상세 열기 상태는 상위 화면이 계속 제어한다. TypeScript 검사와 Android 정적 export(814 modules, 2.6 MB) 통과; 실제 기기 목록·접근성 동작은 미검증이다.
- 2026-11-03 개인 발견 상세/수정 S10 화면을 `src/features/observations/ObservationDetailModal.tsx`로 옮겼다. 사진 URL 재시도, 날짜·지역 입력, 종 검색·미확인 전환, 저장·삭제 UI는 유지하고 API/선택 상태는 상위 화면에서 제어한다. 초기 TypeScript 검사에서 남은 스타일 참조를 고쳐 최종 `npm run typecheck`가 통과했고, Android 정적 export는 815 modules, 2.6 MB로 생성됐다. 실기기 편집·삭제·접근성은 미검증이다.
- 2026-11-03 사용자에게 진행 상태를 보이기 위해 `docs/progress.md`를 만들고 README 제품 문서 목록에 링크했다. 현재 구현 단계, 최신 정적 검사와 한계, 남은 출시 게이트를 요약하며 milestone마다 갱신한다고 명시했다. S10 변경 후 최종 TypeScript 검사와 직접 공백 검사를 통과했다.
- 2026-11-03 배포 설정 안내 정리 후 모바일 `npm run typecheck`와 API `python -m compileall -q app`가 통과했다. `git diff --check`도 통과했으며, 프로젝트가 현재 Git 미추적 파일로 구성돼 있어 문서 변경의 후행 공백은 `.env.example`·`todo.md`를 직접 검사해 확인했다. 이는 정적 검사이며 단말/worker/운영 배포 검증은 아니다.
- [x] 2026-11-03 S07/S08/S09 식별·후보 확인·관찰 정보·저장 화면 UI를 `apps/mobile/src/features/observations/IdentificationFlowModal.tsx`로 분리했다. 선택/날짜/지역/재시도/저장 데이터와 API 상태는 기존 `App.tsx`에서 제어한다. `npm run typecheck` 및 직접 후행 공백 검사 통과, `App.tsx` 2,552줄. 네이티브 화면과 접근성 동작은 단말 검증이 남아 있다.
- [x] 2026-11-03 홈 S01의 소개/계정 진입/초안 이어하기/발견 요약/최근 발견 UI를 `apps/mobile/src/features/home/HomeDiscoverySection.tsx`로 분리했다. 목록 데이터와 API·화면 전환은 App이 계속 제어한다. `npm run typecheck`와 변경 파일 7개의 직접 후행 공백 검사가 통과했고 `App.tsx`는 2,399줄이다. Android 정적 export와 네이티브 화면·접근성 확인은 이번 변경 뒤 아직 하지 않았다.
- [ ] 웹 미리보기를 사용자 PC에서 확인한다. Codex 실행 환경에서 띄운 `localhost:8081`은 브라우저 네트워크와 분리되어 접속 시간 초과가 났다. `scripts/start-mobile-preview.ps1`을 추가해 프로젝트 루트에서 사용자 PowerShell로 실행하도록 README에 안내했다. PowerShell parser와 직접 공백 검사는 통과했으며, 사용자 PC의 브라우저 렌더 확인은 스크립트 실행 뒤 남아 있다.
- [x] 2026-11-03 S01의 사진 선택/사진 교체/로그인 복귀/저장 재시도 버튼 UI를 `apps/mobile/src/features/home/PhotoCaptureAction.tsx`로 분리했다. 진행 상태·초안 복구·각 동작 콜백은 `App.tsx`에 남겼다. `npm run typecheck` 통과, `App.tsx` 2,280줄. 실기기 접근성·버튼 동작 확인은 미완료다.
- [x] 2026-11-03 Expo Web 시작 시 앱 module scope에서 `new File(Paths.document, ...)`가 실행되어 `this.validatePath is not a function`으로 종료되는 원인을 사용자 Metro 로그에서 확인했다. 웹에서는 Expo 네이티브 파일 시스템을 초기화/호출하지 않도록 분기했고, 임시 사진은 browser URI·메모리 초안으로 처리한다. Supabase 웹 미리보기 저장소는 탭 세션 `sessionStorage`로 분리했다. 모바일 `npm run typecheck` 통과; 사용자의 Metro Fast Refresh 후 실제 웹 렌더 확인은 남아 있다.
- [x] 2026-11-03 사용자가 다시 공유한 Metro 로그가 여전히 `App.tsx:96`의 `Paths.document`에서 실패하는 것을 확인했다. Web 런타임이 `Platform.OS`를 `web`으로 보고하지 않는 경우에도 차단하도록 browser `document` 존재 검사를 추가하고 사진 복사/삭제의 웹 분기도 공통값을 사용한다. `scripts/start-mobile-preview.ps1 -ClearCache`를 추가해 오래된 Metro bundle을 초기화할 수 있게 했다. 모바일 `npm run typecheck` 통과; 새 bundle과 브라우저 화면은 사용자 PC에서 재시작 후 확인해야 한다.
