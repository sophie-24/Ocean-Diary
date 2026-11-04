# OCEAN DIARY 개발 현황

마지막 갱신: 2026-11-04 17:40 KST

이 문서는 작업 단위가 끝날 때 현재 코드, 확인 결과, 다음 단계를 갱신합니다. 진행 중인 명령의 초 단위 화면을 스트리밍하지는 않으며, 작업 중간에도 이 채팅에 주요 변경과 검사 상태를 알립니다.

## 현재 단계

### 2026-11-04 · v2 시작 (`feat/v2-ui` 브랜치)

- 결정: Supabase 로그인 유지, GPS 좌표 미저장(지역·포인트 이름만), 5개 탭 모두 출시. 세부는 `docs/plan-v2.md`.
- `main`에 v1 기준 커밋을 남기고, Expo 임시 빌드 폴더를 정리했다.
- 앱 진입점을 `expo-router`로 바꾸고 5탭 뼈대·커스텀 탭 바·디자인 토큰·Noto Sans KR/Gaegu/Gamja Flower 폰트·WebP 일러스트 40장을 넣었다.
- 도감 탭(바다 생물 181종 + 명소 스탬프 40곳)을 캔버스대로 구현했다. 수집 데이터는 아직 목업.
- 확인: `npm run typecheck` 통과, `expo export --platform ios` 번들 생성 통과, 웹 export 화면 캡처로 도감·명소·탭 바 확인. 실제 iPhone 확인 전.

### 2026-11-04 · 3단계 프론트엔드 (목업 데이터)

- 홈, 생물 상세(`species/[no]`), 발견 4단계(선택 → 분석 → 결과 → 수집 도장) 구현.
- 로그북 목록·새 기록(스쿠버/프리/스노클, 필수 3개)·기록 상세, 그림일기 글쓰기(500자, 원고지) 구현.
- 나의 바다: 산호초 수조 — 3D 턴 유영(Reanimated), 실시간 조명 4단계, 만다린 해 질 녘 춤, 밤 사냥, 명판, 감상 모드.
- 추가: 대양 수조(트레발리 소용돌이), 마크로 수조(돋보기 찾기), 말라파스쿠아 장소 수조, 세계 지도(확대·이동·검색·다녀온 나라 색), 크레파스 스티커 44종과 그림일기 꾸미기(끌기·두 손가락 크기/회전·이미지 공유).
- 남은 프론트: 바다 소리(음원 대기). 이후 4단계 서버.
- 확인: 타입 검사 통과, 웹 export 화면 캡처로 흐름 확인. 실제 iPhone 확인 전.

### 2026-11-04 · 5단계 연동

- 목업을 모두 API로 바꿨다(`src/mocks`, v1 `LegacyApp`과 v1 전용 컴포넌트 삭제). 데이터 훅은 `src/api/queries.ts`(TanStack Query).
- 로그인: Supabase 이메일 코드(`app/login.tsx`). Supabase 설정이 없으면 개발용 토큰으로 동작.
- 홈: 요약·도감 진행·최근 만남·오늘의 바다 친구(못 만난 종 중 날마다 바뀜)·배지 과제. 커뮤니티 영역은 출시 범위에서 뺐다.
- 발견: 사진 보관함(최대 10장) → 업로드(presigned PUT) → 식별 작업 폴링 → 후보 확인/이름 검색/이름 없이 저장 → 관찰 저장. 촬영일(EXIF)이 같은 로그에 자동 연결. 외부 AI를 쓰면 처음 한 번 안내·동의.
- 도감·생물 상세(만남 타임라인 `GET /v1/observations?species_id=`), 로그북·그림일기, 수조(만난 종만 등장), 장소 수조·지도(`/v1/places`).
- 내 계정 화면: 로그아웃, 앱 안에서 계정 삭제(App Store 5.1.1(v) 요건).
- 확인: 타입 검사 통과, `pytest` 12개 통과, 로컬 API+worker(mock)+S3 대역으로 웹 화면에서 사진 선택→업로드→식별→저장→도감·상세·수조·지도까지 확인. 실제 iPhone 확인 전.

### 2026-11-04 · 4단계 서버

- 마이그레이션 `0013_v2_logbook`: 생물 카탈로그 v3 컬럼, `dive_sites`, `dive_logs`, `site_stamps`, `observations.dive_log_id`.
- 시드: 기존 7종 + 도감 181종(고정 UUID) + 명소 40곳. 여러 번 실행해도 안전.
- API: 다이빙 로그 CRUD(종류별 번호, 멱등 키, GPS 키 거부, 500자 일기, 스티커 배치), 명소/스탬프, 장소 묶음, 홈 요약. 계약은 `docs/api-contract-v2.md`.
- 계정 삭제 시 로그·스탬프도 함께 삭제.
- 확인: 실제 PostgreSQL 16에서 마이그레이션 up/down/up, 시드 2회, `pytest` 11개 통과.

### 이전 (v1)

- 기능명세 v1에 맞춰 MVP 핵심 흐름을 구현하고, 큰 모바일 화면 파일을 기능별 컴포넌트로 점진적으로 분리하고 있습니다.
- 이번 작업: 사용자 Metro 로그에서 `App.tsx:96`의 `Paths.document` 생성 오류가 여전히 보이는 점을 반영했습니다. 브라우저의 `document` 존재 여부도 확인해, 런타임이 `Platform.OS`를 다르게 보고해도 웹에서는 native File을 만들지 않게 했습니다. 웹 사진/초안 정리 분기도 동일한 감지값을 공유합니다. 미리보기 시작 도우미에 `-ClearCache` 옵션을 추가했습니다.
- 직전 작업: 홈 S01 하단 사진 선택·초안 저장 재시도 버튼 UI를 `apps/mobile/src/features/home/PhotoCaptureAction.tsx`로 분리했습니다. 버튼 동작과 초안/API 상태는 기존 App 상위 로직이 계속 맡습니다.
- 직전 작업: 홈 S01의 소개·계정 진입·초안 이어하기·발견 요약·최근 발견 UI를 `apps/mobile/src/features/home/HomeDiscoverySection.tsx`로 분리했습니다.
- 직전 작업: 사진 식별·후보 확인·관찰 날짜/지역 입력·기록 저장 화면 S07/S08/S09를 `apps/mobile/src/features/observations/IdentificationFlowModal.tsx`로 분리했습니다.
- 세 화면 추출과 화면 전용 스타일 정리 후 `apps/mobile/App.tsx`: 2,280줄입니다.
- 채팅 실행 환경의 `localhost`는 사용자의 브라우저에서 접근할 수 없는 별도 네트워크입니다. 사용자의 Windows PowerShell에서 Expo 미리보기를 직접 실행하도록 `scripts/start-mobile-preview.ps1`을 추가했습니다.

## 최근 확인

- 모바일 `npm run typecheck`: 브라우저 런타임 감지 보강 후 통과
- Android Expo 정적 export: 직전 확인 815 modules, 2.6 MB bundle; 홈 화면 추출 뒤 재생성 전
- 이번 변경 파일 7개의 직접 후행 공백 검사: 통과
- 미리보기 시작 스크립트 PowerShell 구문 검사와 README/스크립트 공백 검사: 통과
- 이 도구 세션의 loopback은 브라우저와 연결되지 않아 실제 화면 렌더는 사용자 PC에서 스크립트를 실행한 뒤 확인해야 합니다.
- Expo Web의 Metro 로그는 JS 번들 생성까지 성공했으나 앱 시작 때 파일 시스템 생성 오류가 있었습니다. 수정 코드는 정적 검사만 완료했습니다. 기존 Metro가 캐시에 든 코드를 계속 쓰지 않도록 사용자 PowerShell에서 `Ctrl+C` 후 `scripts/start-mobile-preview.ps1 -ClearCache`로 재시작하고 브라우저 화면을 확인해야 합니다.
- 위 결과는 TypeScript/정적 번들 확인이며 네이티브 APK, 실제 기기, TalkBack 검증은 아닙니다.

## 남은 큰 출시 게이트

- Android 실제 기기의 사진 업로드·로그인·식별·저장·재시작 복구·TalkBack 확인
- Supabase/MinIO/worker/외부 AI를 사용한 실제 로그인·사진·재시도·삭제·비용 흐름 확인
- 한국 수중 사진 AI 정확도와 생물 일러스트 생물학 검수
- 개인정보처리자·수탁자·리전·법적 근거 확정 및 처리방침 검토
- Android release APK/AAB 생성·설치, EAS 환경 설정과 앱스토어 제출 준비

세부 항목과 사용자 환경에서 실행할 작업은 `docs/todo.md`가 기준입니다.

