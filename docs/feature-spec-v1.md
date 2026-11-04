# OCEAN DIARY 기능명세서 v1

- 상태: MVP 구현 기준 초안
- 대상: 국내 스쿠버다이버, Android 우선 내부 베타(Expo 기반)
- 제품 약속: 사진 한 장을 올리면 AI가 해양생물 후보를 제시하고, 다이버가 확인·수정한 뒤 그림책 느낌의 종 카드와 함께 개인 도감에 발견으로 저장한다.
- 본 문서는 기존 제품 개요/API 계약을 화면 동작 단위까지 구체화한다. 구현 전에 반드시 바꿔야 하는 제품 결정을 미루지 않도록 아래 기본값을 선언한다.

## 1. MVP 목표와 범위

### 1.1 성공 기준

1. 사용자가 사진 선택부터 저장 완료까지 안내를 따라 끝낼 수 있다.
2. AI가 틀렸거나 확신이 낮아도 사용자가 직접 검색하거나 미확인으로 저장할 수 있다.
3. 저장된 발견은 앱을 다시 열어도 개인 도감에 보이며, 다른 사용자는 볼 수 없다.
4. 실패한 업로드·식별·저장은 상태와 복구 행동을 사용자에게 알려준다.

### 1.2 포함 범위

- Android 우선, Expo/React Native 단일 앱. 내부 베타는 Expo 개발 빌드/Expo Go 지원 범위에서 검증한다.
- 사진 보관함에서 사진 1장 선택, 미리보기, 교체/취소.
- JPEG/PNG, 최대 15 MiB. 동영상·HEIC은 MVP에서 거부하거나 명확한 지원 안내를 한다.
- 로그인된 사용자만 업로드/저장. 관리형 인증 공급자를 사용하고 비밀번호는 자체 저장하지 않는다.
- 앱→서버에서 짧은 만료의 업로드 URL 발급, 앱→스토리지 직접 업로드, 서버 완료 확인.
- AI 식별 비동기 처리, 카탈로그 안에서 최대 3개 후보 및 high/medium/low 신뢰 구간 표시.
- 사람이 후보 확인, 다른 종 검색·선택, 또는 종 미확인으로 저장.
- 한국어 이름/학명/설명과 종별 그림책 스타일 카드 표시. 일러스트 없는 종은 우아한 대체 화면.
- 개인 발견 목록과 종 도감 집계, 발견 상세, 수정/삭제.
- 좌표는 수집/표시하지 않는다. 선택적으로 사용자가 입력하는 넓은 지역 텍스트만 제공하며 기본값은 비어 있음.

### 1.3 명시적 비범위

- 동영상/연속 프레임 분석, 실시간 카메라 식별
- 지도, GPS 좌표, 다이빙 사이트 추천
- 다이빙 로그북·수심/시간/장비 기록
- 커뮤니티·피드·공개 프로필·팔로우·공유
- 나만의 바다 꾸미기, 배지/게임화/랭킹
- 오프라인 AI, 사용자 간 데이터 공유, 결제/구독
- 자동으로 종을 확정하거나 사람 검수 없이 생태 정보의 정확성을 보장하는 기능

## 2. 사용자·권한·제품 규칙

### 2.1 역할

- 비로그인 사용자: 공개 종 카탈로그만 열람 가능. 사진 선택 후 기록을 시작하면 로그인 화면으로 이동하고, 로그인 완료 후 기록 흐름으로 돌아온다.
- 로그인 사용자: 자신의 미디어·식별 작업·발견만 생성/조회/수정/삭제 가능.
- 운영자(앱 내부): 종 카탈로그와 일러스트 관리. 일반 MVP 앱에는 운영 도구를 넣지 않는다.

### 2.2 불변 규칙

- 사진 선택이나 후보 탭만으로 저장되지 않는다. 사용자가 최종 저장 버튼을 눌러야 발견이 생성된다.
- 최종 저장은 멱등 키를 사용한다. 네트워크 재시도에도 같은 기록이 중복되지 않는다.
- AI 후보는 참고 자료다. 사용자가 선택한 종은 `ai_confirmed`, 검색으로 직접 고른 종은 `user_selected`, 종을 정하지 않은 경우는 `unidentified`다.
- `unidentified`는 `species_id=null`; 다른 두 방식은 활성 `species_id` 필수다.
- 사진/발견은 소유자만 접근 가능하다. 소유권 불일치는 404로 처리한다.
- 앱의 JSON API 요청과 공개 종 검색은 30초 안에 응답하지 않으면 timeout으로 끝내고 화면별 오류·재시도 또는 오프라인 대체 흐름을 보여준다. 사진 직접 업로드는 180초 안에 완료되지 않으면 중단하며, 재시도는 먼저 같은 intent의 완료 여부를 확인한다.
- 후보가 카탈로그 종으로 매핑되지 않으면 노출하지 않는다. 후보 없음은 실패가 아니며 수동 검색/미확인 저장을 제공한다.
- AI 원점수, 원시 모델 응답, 공급자 내부정보, 저장소 key는 앱에 보내지 않는다.

## 3. 핵심 사용자 흐름 및 상태 전이

### 3.1 성공 흐름

1. 도감 홈에서 `발견 기록`을 탭한다.
2. 권한 확인 후 사진 보관함에서 사진을 고른다.
3. 미리보기에서 사진을 확인하고 `이 사진으로 계속`을 탭한다.
4. 로그인 여부를 확인한다. 비로그인이면 인증 후 이 흐름으로 복귀한다.
5. 업로드 준비 → 직접 업로드 → 서버 처리 완료 확인을 거친다.
6. 식별을 시작하고 진행 화면을 보여준다. 앱이 백그라운드/재시작돼도 job id를 저장해 상태를 다시 읽는다.
7. 후보를 확인하고 AI 후보 선택, 종 검색/수동 선택, 미확인 중 하나를 결정한다.
8. 발견 확인 화면에서 사진·종·신뢰 구간·기록 일시·선택적 지역을 확인한다.
9. 저장 후 종 카드와 개인 도감에 반영한다.

### 3.2 상태 모델

```text
draft_photo → upload_intent → uploading → processing_media → media_ready
media_ready → identification_queued → identification_running
identification_running → candidates_ready | no_candidate | identification_failed | timed_out
candidates_ready | no_candidate | identification_failed | timed_out
  → species_selected | unidentified_selected → saving → saved
모든 단계에서 사용자 취소 가능(서버에 생성된 미완료 자원은 만료/정리 작업이 회수)
```

세션 복구용으로 현재 단계, `media_id`, `job_id`, 선택 사진 로컬 URI를 로컬 앱 상태에 보존한다. 선택 사진은 앱 cache에 복사한다. cache는 운영체제가 저장 공간 확보를 위해 비울 수 있으므로 앱 재시작 뒤에도 항상 복구된다고 보장하지 않는다. 사진 선택 버튼 앞에서 임시 저장·자동 정리 가능성·저장 완료/작성 취소/로그아웃 시 삭제를 안내한다. 실제 Android/iOS에서 cache 정리와 백업 제외 동작은 출시 전 확인한다. 앱 시작 시 cache/문서 폴더에서 manifest가 참조하지 않는 앱 전용 임시 사진(`ocean-diary-photo-*`)을 정리해 사진 복사 뒤 manifest 기록 전에 앱이 종료된 경우에도 잔여 파일을 회수한다. 앱 삭제/기기 변경 복구는 로그인 이후 서버의 저장 완료 기록만 보장한다.

## 4. 화면 명세

공통 UI 규칙: 한국어 우선, 엄지 조작 가능한 하단 주요 버튼, 모든 버튼에 접근성 라벨, 목록 항목의 이름에는 필요한 종·날짜·지역·발견 수 정보를 포함하고, 화면 제목과 구획 제목은 화면 읽기 도구의 제목 탐색 역할을 제공하고, 로딩에는 동작 의미가 있는 문구를 표시한다. 오류는 재시도/다른 방법 등 다음 행동을 함께 제공한다. 만료된 비공개 사진 URL 등으로 목록·홈·저장 카드 사진을 불러오지 못하면 빈 이미지 대신 접근성 이름이 있는 오류 대체 화면을 표시한다. 상세 화면은 사진 URL 재발급 재시도를 제공한다.

### S01 도감 홈

- 목적: 서비스의 첫 진입점, 이미 발견한 종을 돌아보고 새 기록 시작.
- 주요 요소: 상단 브랜드/인사, `발견 기록` 주 CTA, 진행 중인 사진 초안이 있으면 미리보기/식별/저장 이어하기 카드, 도감 종 카드 그리드, 검색 입력, 발견 없는 시작 안내, 미확인 발견이 있으면 별도 개수 카드와 바로가기.
- 상태: 로딩 스켈레톤 / 기록 0건 / 기록 있음 / 검색 결과 / 검색 결과 없음 / 네트워크 오류(재시도).
- 동작: CTA→S03; 카드→S02; 검색은 국문명·학명 검색. 로그인 전 카탈로그 탐색 가능.
- 사진 초안 이어하기 카드는 S04 또는 S07/S08의 현재 단계로 돌아간다. `사진 바꾸기`를 누르면 현재 사진·식별 진행이 교체될 수 있음을 확인하고, 새 사진 선택기를 취소하면 기존 초안을 유지한다.
- 표시 규칙: 개인 발견 횟수와 미발견 상태를 종 카드에 표시. 발견 집계는 서버 기준.

### S02 종 상세 카드

- 진입: S01 종 카드 탭, 저장 완료 직후.
- 요소: 종 대표 일러스트 또는 대체 이미지, 국명, 학명, 검수된 한 문단 설명, 사용자 발견 횟수/첫·최근 발견 날짜(있을 때), 닫기.
- 상태: 정상 / 일러스트 없음 / 카탈로그 로딩 오류.
- MVP에서 상세 카드 안에 공개 공유·지도·다이빙 로그 버튼 없음.

### S03 사진 선택

- 요소: 선택 안내, 사진 선택 버튼, 형식/용량 안내(JPEG/PNG, 최대 15 MiB), 취소.
- 상태/동작: 권한 미요청→시스템 권한 요청; 권한 거부→설정 이동/나중에; 제한 접근→선택 가능한 사진만 허용; 선택기 취소→이 화면 유지; 잘못된 형식/용량→사진을 바꾸라는 설명; 정상 선택→S04.
- 파일 메타데이터가 없을 수 있으므로 UI 사전 검사는 보조이며 서버 검증이 최종 기준.

### S04 사진 미리보기

- 요소: 큰 사진, 해상도·파일 크기(있는 경우), 외부 AI 사용 시 provider·사진 처리 안내, `다시 선택`, `이 사진으로 계속`, `이 기록 취소하기`.
- 상태: 사진 로드 중 / 정상 / 기기 cache에서 임시 사진을 읽을 수 없음.
- `다시 선택`은 사진 선택기를 바로 연다. 사용자가 선택기를 취소하면 현재 미리보기 사진과 업로드 초안을 보존한다.
- cache 사진을 읽지 못하면 오류를 숨기지 않고 이유와 재선택 동작을 안내한다. 아직 업로드하지 않은 초안은 사진이 다시 선택될 때까지 업로드를 막는다. 이미 서버 업로드가 완료된 초안은 기기 사진 표시가 실패해도 해당 서버 사진으로 식별·저장을 이어갈 수 있다.
- `이 기록 취소하기`는 확인 대화상자 뒤 로컬 사진 초안과 미완료 서버 미디어/식별 작업을 정리하고 홈으로 돌아간다.
- 규칙: 사진을 서버에 올리기 전임을 알린다. 서버 설정에 따라 OpenAI 등 외부 AI에 사진이 전송되는 경우 제공자를 명시하고, 버튼도 `안내에 동의하고 업로드`로 표시한다. 서버는 업로드 시 provider·고지 버전·동의 시각을 미디어에 기록한다. 식별을 시작할 때 현재 provider가 기록된 동의와 다르면 사진을 전송하지 않고 재동의를 요구한다. 앱이 지원하지 않는 고지 버전이거나 설정을 확인할 수 없으면 업로드를 막는다. 계속 시 비로그인은 S05, 로그인은 S06.

### S05 로그인/인증

- 목적: 업로드 전 사용자 소유권을 확보.
- 기본값: Supabase 이메일 일회용 코드(OTP). 자체 비밀번호 저장·회원 프로필 입력은 만들지 않는다.
- 요소: 비공개 기록 안내, 이메일 입력, 코드 발송, 코드 입력, 취소. 인증 SDK 세션은 Android Keystore/iOS Keychain 기반 보호 저장소에 보존한다. 기존 일반 로컬 저장소에 남은 Supabase 세션은 보호 저장소 기록에 성공한 뒤 제거한다.
- 상태: 이메일 입력 / 코드 발송 중 / 코드 입력 / 로그인 중 / 성공 / 취소 / 만료·오류(재발급 가능).
- 성공 시 선택해 둔 사진 흐름으로 돌아가 업로드를 이어간다. API에는 Supabase access token을 Bearer로 전달하며, 만료·갱신은 SDK 세션 처리에 맡긴다.

### S06 업로드 진행

- 요소: 사진 축소 미리보기, 단계 상태(업로드 준비/전송/이미지 확인), 진행 표시, 닫기/다시 선택, `이 기록 취소하기`.
- 상태: intent 발급 / 업로드 중 / 서버 처리 / 성공 / 만료·네트워크 오류 / 형식·용량 거부 / OS cache 정리로 사진 복구 불가. 앱은 서명 URL은 저장하지 않고 idempotency key를 intent 요청 전에 로컬에 보존한다. 서버는 같은 사용자·키로 재요청하면 같은 media ID와 intent를 반환한다. 서버 응답 후 앱은 media ID도 PUT 전에 저장해 강제 종료 뒤 완료 여부를 확인하거나 같은 업로드를 이어간다.
- 동작: 전송 실패 재시도, 만료된 URL은 새 intent 발급, 완료 확인 전 AI 요청 금지. 중복 PUT은 동일 media id에 안전해야 한다. 서버가 이미지 객체를 정제한 뒤 DB 완료 커밋에 실패해도 complete 재시도에서 서버 서명 정제본을 확인해 ready 상태 복구를 이어간다.
- 닫기/뒤로 가기: 미완료 로컬 초안을 보존하고 S01의 이어하기 카드로 돌아간다. 다른 사진을 선택해 교체할 때만 기존 미완료 자원을 삭제 요청한다. 업로드된 고아 객체는 서버 정리 정책으로 제거.
- 업로드 중에는 사진 교체·기록 취소를 막는다. 기록 저장 요청의 응답이 불확실한 동안은 같은 payload 재시도 경로를 보존하고 사진 교체/취소를 막는다.

### S07 식별 진행

- 요소: 사진 미리보기, “사진 속 생물을 살펴보고 있어요”, 닫기/나중에 보기, `이 기록 취소하기`.
- 닫기/나중에 보기: job과 사진 초안을 보존하고 S01 이어하기 카드로 돌아간다. 카드로 현재 상태를 다시 연다.
- `이 기록 취소하기`는 확인 뒤 로컬 사진을 지우고 서버 미디어 및 연결된 식별 작업·후보를 삭제 요청한다. 이미 외부 AI 분석이 시작됐다면 해당 요청은 취소할 수 없고 결과만 폐기한다.
- 상태: queued / running / timeout / failed.
- 폴링: 초깃값 1.5초, 최대 60초까지 지수 간격; 앱 복귀 시 상태 조회. 작업 중 버튼 연타로 job을 중복 생성하지 않는다.
- job 생성 POST는 30초 안에 응답하지 않으면 중단하고 재시도/수동 선택을 안내한다. 요청 전 멱등 키와 pending 상태를 기기에 저장하므로 앱 재시작 또는 네트워크 응답 유실 후 같은 키로 재전송해 기존 job을 복구한다. 서버가 명시적으로 4xx를 반환하면 자동 재전송 대기 상태를 해제한다.
- timeout/실패: “식별이 아직 끝나지 않았어요”와 `다시 시도`, `이름을 직접 찾기`, `미확인으로 기록` 제공. AI 실패를 저장 실패와 혼동하지 않는다. 외부 AI 일일 사용 한도 소진 시 한도와 초기화 시점을 알리고 AI 재시도만 막으며, 직접 검색·미확인 저장은 계속 허용한다.

### S08 후보 확인 및 종 선택

- 요소: 업로드 사진, 최대 3개 후보 카드(국명·학명·종 그림·신뢰 문구), 직접 검색 입력, `잘 모르겠어요`.
- 상태: 후보 있음 / 후보 없음 / 검색 중 / 검색 결과 없음 / 네트워크 오류.
- 신뢰 문구: high “가능성이 높아요”, medium “가능성이 있어요”, low “후보 중 하나예요”. 퍼센트 점수는 표시하지 않는다.
- 동작: AI 후보 탭→확인 단계에서 AI 제안 종으로 표시; 검색 결과 탭→사용자 선택 종으로 표시; 미확인→species null.
- AI 후보가 낮은 신뢰여도 숨기지 않고 불확실성을 표현하며, 다른 종 선택을 동등한 경로로 둔다.

### S09 발견 확인 및 저장

- 요소: 사진, 최종 종명 또는 미확인, 선택 방식 표시, 관찰 날짜(YYYY-MM-DD)와 시간(24시간 HH:MM, 기본: 현재 시각), 선택적 넓은 지역명, `도감에 저장`.
- 날짜와 시간은 기기 현지 시각으로 입력하고 서버에는 UTC RFC3339로 저장한다. 존재하지 않는 날짜·시간은 오류 안내 후 저장을 막는다. 저장 요청 실패 후에는 중복 방지를 위해 입력을 잠그고 같은 멱등 키로 재시도한다. 사진 재업로드나 식별 재시도, 앱 재시작 복구 중에도 관찰 날짜·시간을 보존한다. 식별 생성 요청을 보내기 전에 사용자 범위 멱등 키를 기기에 저장하며, 응답 유실 후에는 같은 키로 기존 job을 조회/복구한다. 새 사진을 선택해 새 기록을 시작할 때만 현재 시각으로 초기화한다.
- 지역 기본값은 비어 있다. GPS/EXIF 위치 자동 입력 및 지도 핀 없음. 작성/수정 화면은 GPS 좌표를 기록하지 않고 넓은 지역명만 사용자가 직접 입력한다는 점을 안내한다.
- 저장 중 중복 탭 비활성화. 요청 시작 직전에 같은 멱등 키와 payload를 로컬 초안에 먼저 기록한다. 응답 전 앱이 종료되면 같은 내용을 잠근 상태로 복구해 같은 키로 재시도하며, 서버에서 이미 저장했다면 최초 결과를 돌려받는다.
- 로컬 초안 기록에 실패하면 서버 저장 요청을 보내지 않는다. 저장 공간 확인과 재시도를 안내하고, 입력과 멱등 키를 유지한다.
- 저장 후 S10. 취소하면 확인 화면으로 돌아간다.

### S10 저장 완료

- 요소: 저장된 종 그림책 카드, “도감에 담았어요”, 새 종 여부/발견 횟수, `도감 보기`, `한 번 더 기록`.
- 상태: 정상 / 응답 유실 후 재조회 / 서버 반영 지연(재조회 버튼).
- 완료 후 홈·도감 캐시 무효화. `한 번 더 기록`은 새 사진 선택으로 이동.

### S11 내 발견 목록 및 상세

- 목록 요소: 전체/미확인 필터, 최신 순 사진 썸네일, 종명/미확인, 관찰 날짜·지역(입력된 경우), 필터별 빈 상태와 발견 CTA.
- 상세 요소: 사진, 종 카드, 관찰일, 지역 텍스트, 수정, 삭제.
- 목록에서 상세를 열었다면 닫기/삭제 후 같은 필터 목록으로 돌아간다. 홈의 최근 발견 카드에서 열었다면 닫기/삭제 후 홈으로 돌아간다.
- 상태: 로딩 / 빈 목록 / 목록 있음 / 더 불러오기 / 오류. 목록 오류에는 실패한 커서·필터 조건을 유지한 재시도 동작을 제공한다. 상세 사진의 로드 오류에는 서명 URL 재발급을 포함한 `사진 다시 불러오기`를 제공한다.
- 수정: 종을 바꾸면 `user_selected`; 종 해제는 미확인으로 변경. 지역/관찰일은 선택적으로 편집.
- 상세 수정에서 관찰일이 바뀌면 홈 최근 발견을 갱신하고, 목록에서 진입한 경우 현재 필터의 첫 페이지를 다시 불러 날짜순과 커서를 최신 상태로 맞춘다.
- 삭제: 확인 대화상자 후 즉시 목록에서 숨기고 API soft delete. 사진은 다른 발견에서 사용 중이지 않을 때 비동기 삭제. 복구/중복 요청 창을 위해 삭제 행은 기본 30일간 보관한 뒤 worker가 영구 삭제하며 `DELETED_OBSERVATION_RETENTION_DAYS`로 조정한다. 연결된 media row는 스토리지 삭제 확인, 참조 기록 제거, 활성 job 없음이 모두 확인된 후에만 삭제한다.

### S12 설정/계정·데이터

- 요소: 로그인 상태/이메일, 사진·발견의 비공개 안내, 사진 초안의 기기 임시 보관/백업 가능성/정리 시점, 서버 보관 전 GPS 촬영 위치 정보 제거와 지역명 직접 입력 안내, 로그아웃, `계정과 모든 기록 삭제`.
- 삭제는 명확한 되돌릴 수 없음 확인 후 본인 계정의 발견·식별 작업·후보·사진 객체를 제거하고 Supabase Auth 계정을 삭제한다. 정리 중 실패하면 `pending` tombstone이 stale token의 새 쓰기를 막는다. 아직 유효한 사진 업로드 URL은 취소할 수 없어 `ACCOUNT_DELETE_UPLOAD_URL_ACTIVE`로 후처리를 보류하고, URL 만료 뒤 worker가 재시도한다. 이 응답을 받은 앱은 로컬 비공개 데이터와 세션을 지우고 삭제 진행 상태를 안내한다. 앱의 삭제 요청 재시도와 worker의 60초 주기 자동 재시도가 같은 멱등 정리 함수를 사용한다. 완료 후에는 허용된 최대 access-token 수명 동안 subject만 임시 보유해 이미 발급된 JWT를 차단하고, 기간이 지나면 worker가 tombstone을 제거한다. 다른 기기에서 삭제가 시작/완료되어 `410 ACCOUNT_DELETED`를 받으면 앱은 해당 기기의 세션과 진행 중 초안을 지우고 로그아웃을 안내한다. 삭제 요청한 기기도 성공 응답 후 같은 처리를 한다.
- 서버는 Supabase 관리자 키를 사용하며 앱 번들에는 관리자 키를 절대 포함하지 않는다. 스토리지 정리가 실패하면 DB 삭제를 진행하지 않고 재시도 가능한 오류를 반환한다. Auth 삭제가 실패한 경우 개인 기록은 이미 제거됐을 수 있으며 같은 요청 재시도로 계정 삭제를 마칠 수 있다.
- 실제 사진 보유 기간/백업 보유 기간과 개인정보 처리방침은 베타 공개 전 확정해야 하며, 삭제 UI/API가 구성·실기기에서 확인되지 않으면 베타를 공개하지 않는다.

## 5. 기능 요구사항 및 인수 기준

### F-01 카탈로그

- 활성 종의 목록·국문/학명 검색·상세를 제공한다.
- 페이지네이션은 커서 기반, 기본 20·최대 50. 검색 입력은 300ms 디바운스, 이전 요청 결과가 늦게 도착해 현재 입력을 덮지 않도록 요청 키를 확인한다.
- 일러스트 부재·원격 asset 로드 실패 시에도 이름/학명/설명과 카드 레이아웃이 깨지지 않는다. 서버 그림 URL을 읽지 못하면 앱 번들의 종별 SVG 초안을 대신 표시한다.

### F-02 사진 입력

- 사진 한 장, JPEG/PNG, ≤15 MiB. 사용자 동의 없이 카메라/마이크 권한을 요청하지 않는다.
- GPS 등 위치 메타데이터를 제거한 처리 이미지를 식별/보관한다. EXIF 제거 결과를 서버에서 검증한다.
- 원본이 긴 변 2,560px보다 크면 비율을 유지해 줄인 뒤 파생본만 저장·식별에 사용한다. 저장된 크기와 체크섬은 파생 이미지 기준으로 기록한다.
- 앱이 서명 URL로 쓴 원본 객체와 서버가 저장하는 EXIF 제거 파생본은 별도 storage key를 사용한다. 원본 key는 URL 만료 후 15분의 완료 유예를 두고 worker가 삭제하며, 파생본 key는 원본 업로드 URL이 쓸 수 없어 재전송으로 덮어쓸 수 없다. 0010 이전의 미완료 업로드는 0012 migration에서 폐기하고 다시 시작하게 한다. 기존 완료 사진의 옛 업로드 URL이 아직 유효하면 migration을 중단하고, 이전 API 종료 후 URL 만료와 15분 유예가 지난 뒤 적용한다. 초안 사진은 앱 cache에 저장하며 운영체제가 공간을 확보할 때 삭제할 수 있음을 안내한다. 저장/취소/로그아웃 시 삭제하고, 시작 시 manifest에 연결되지 않은 앱 전용 사진 파일도 정리한다.

### F-03 업로드

- API가 사용자 소유의 pending media와 만료 URL을 발급한다.
- 앱은 서명된 URL에 지정 헤더와 함께 PUT한다. 업로드 URL/스토리지 키는 로그/분석 이벤트에 기록하지 않는다.
- complete는 실제 객체 존재·크기·MIME·소유자를 확인한 뒤 ready 처리한다. 정제 이미지 저장 직후 DB 커밋이 실패한 재시도는 서버 서명 메타데이터와 객체 체크섬을 확인해 안전하게 ready로 복구한다.
- 만료/실패/불일치 객체는 명확한 오류와 정리 기준을 가진다.

### F-04 AI 식별

- 작업은 비동기이며 queued→running→succeeded/failed만 허용한다.
- 성공 결과는 0~3개의 활성 카탈로그 후보. 후보마다 rank와 신뢰 구간을 갖는다.
- 낮은 신뢰, 후보 없음, 매핑 실패, 공급자 오류, 시간 초과를 구분하고 수동 기록은 항상 가능해야 한다.
- 서버는 AI 공급자 어댑터 뒤에서 모델을 호출해 교체 가능하게 한다. MVP 시작 시 공급자 하나, 사용자별 일일 job 한도(기본 20회, Asia/Seoul 자정 초기화), 공급자 호출 시간 제한(기본 45초), 안전한 처리 시간/token 사용 로그, 짧은 구간 호출 제한, 최근 실패 3회/5분 후 공유 회로 차단을 둔다.
- 라벨이 검수된 실제 수중 사진 평가셋 없이 식별 정확도를 마케팅하거나 임계값을 확정하지 않는다.

### F-05 발견 저장/도감

- ready 미디어와 같은 사용자 소유의 종/job만 참조 가능하다.
- 저장은 멱등. 사용자 확인 후에만 기록 생성.
- 발견은 매회 별도 기록. 도감 종 개수는 고유 종 수, 종별 발견 수는 활성 발견 수를 의미한다.
- 미확인 기록도 사진과 날짜를 보존하고 `미확인 발견` 묶음에 나타난다.
- 삭제는 soft delete 후 미디어 참조를 확인해 실제 사진 제거를 예약한다.

### F-06 개인정보·보안

- GPS 좌표를 수집하지 않고, 업로드 시 EXIF 위치 제거.
- 관측 지역은 사용자가 직접 입력하는 일반 텍스트 선택 항목이며 공개 공유하지 않는다.
- 비밀키는 앱 번들에 넣지 않고 서버 환경변수/secret manager에 둔다.
- 개발용 MinIO 기본 자격증명은 비개발 환경에서 API 시작을 거부한다.
- 인증 토큰 검증, 사용자별 소유권 검사, 업로드 서명 URL 짧은 만료, 크기/MIME 검증, 호출 속도 제한.
- 계정 삭제 뒤 기존 JWT가 만료될 때까지 데이터 요청을 거부한다. `SUPABASE_ACCESS_TOKEN_MAX_AGE_SECONDS`는 Supabase access token의 최대 수명 이상으로 맞추며, 더 긴 토큰은 API가 거부한다.
- 오류 응답은 안전한 코드/요청 ID만 포함. 개인 사진 URL, 토큰, 공급자 원문을 로그에서 제거.
- 정책/보유기간/계정 삭제와 원본 삭제는 베타 전 체크리스트로 검증.

## 6. API 계약 보강(화면 기준)

기존 `api-contract-v1.md`의 경로를 유지하고 화면과 다음 입력을 연결한다.

| 화면 흐름 | API |
|---|---|
| S01/S02 카탈로그 | `GET /v1/species`, `GET /v1/species/{id}`, `GET /v1/collection` |
| S04→S06 업로드 | `POST /v1/media/upload-intents`, 서명 URL `PUT`, `POST /v1/media/{id}/complete` |
| S07/S08 AI | `POST /v1/identification-jobs`, `GET /v1/identification-jobs/{id}` |
| S08 검색 | `GET /v1/species?query=...` |
| S09/S10 저장 | `POST /v1/observations` (`Idempotency-Key`) |
| S11 기록 | `GET /v1/observations`, `GET /v1/observations/{id}`, `PATCH`, `DELETE` |

공통 요구: 인증된 사용자 API에 Bearer 토큰, 모든 날짜 RFC3339 UTC, JSON UTF-8, 오류 `{error:{code,message,request_id}}`. API는 UI 문구를 강제하지 않으며 앱은 `code`별 한국어 메시지와 복구 버튼을 정의한다.

### 오류 코드와 화면 복구

| 코드 예 | 화면 대응 |
|---|---|
| `AUTH_REQUIRED` / 401 | 인증 화면으로 이동 후 작업 복구 |
| `UNSUPPORTED_MEDIA` / 415 | JPEG/PNG 사진 선택 안내 |
| `FILE_TOO_LARGE` / 413 | 15 MiB 이하 사진으로 변경 |
| `UPLOAD_EXPIRED` / 409 | 새 upload intent 발급 후 재업로드 |
| `EXTERNAL_AI_CONSENT_REQUIRED` / 409 | 현재 provider·고지 버전을 다시 확인하고 동의 후 재업로드 |
| `ACCOUNT_DELETED` / 410 | 세션·진행 중 초안을 이 기기에서 정리하고 로그아웃 안내 |
| `MEDIA_NOT_READY` / 409 | complete 상태 재조회, ready 전 식별 금지 |
| `IDENTIFICATION_FAILED` | 재시도/직접 검색/미확인 저장 |
| `RATE_LIMITED` / 429 | 남은 시간 안내, 재시도 버튼 비활성 |
| `NOT_FOUND` / 404 | 삭제/권한 오류로 정보가 없을 수 있음을 안내하고 목록 복귀 |
| `NETWORK_ERROR` / 5xx | 입력 보존, 재시도, 멱등 저장 키 유지 |

## 7. 데이터 모델 초안 및 관계

기존 `species`, `species_artworks`를 유지한다. 아래는 MVP 전체 흐름의 논리 스키마다. 실제 적용 revision과 진행 상태는 `docs/todo.md`를 기준으로 한다.

```text
auth.users 1 ─ N media_assets
auth.users 1 ─ N identification_jobs
auth.users 1 ─ N observations
media_assets 1 ─ N identification_jobs
identification_jobs 1 ─ N identification_candidates N ─ 0..1 species
species 1 ─ 0..1 species_artworks
species 1 ─ N observations
media_assets 1 ─ N observations (MVP 앱에서는 기본 1개 기록/사진을 권장하되 스키마는 재사용 허용)
```

### 필드 초안

- `species`: `id uuid PK`, `slug varchar(100) UNIQUE`, `common_name_ko varchar(100)`, `scientific_name varchar(200)`, `description_ko text`, `taxonomy_json jsonb`, `is_active bool`, timestamps.
- `species_artworks`: `id uuid PK`, `species_id uuid FK UNIQUE`, `asset_key`, `thumbnail_key nullable`, `style_name='storybook'`, `license_source`, `created_at`.
- `media_assets`: `id uuid PK`, `owner_user_id uuid`, `storage_key UNIQUE` (서버 처리 후 앱/AI가 읽는 최종 객체), `upload_storage_key UNIQUE nullable` (서명 URL이 쓸 수 있는 원본 키), `upload_intent_key nullable`, `mime_type`, `byte_size`, `upload_byte_size nullable`, `upload_sha256 nullable`, `width/height nullable`, `sha256 nullable`, `status(pending_upload|processing|ready|deleted|rejected)`, `captured_at nullable`, `created_at`, `expires_at`, `deleted_at nullable`, `storage_deleted_at nullable`. ready 상태의 크기·해상도·체크섬은 EXIF 제거 및 긴 변 2,560px 축소 후 처리 이미지 기준이며, 원본 크기/해시는 완료된 intent 멱등 재요청 비교를 위해 별도로 보존한다. 업로드 URL이 만료된 뒤 worker가 원본 키를 지우므로 재전송된 원본은 최종 이미지 객체를 덮어쓸 수 없다. `deleted_at`은 사용자 기록/미디어를 즉시 숨긴 시각이고, 객체 스토리지 삭제 성공 시 `storage_deleted_at`을 기록해 실패한 정리를 worker가 재시도한다. storage key는 서버 전용.
- `identification_jobs`: `id uuid PK`, `user_id uuid`, `media_asset_id uuid FK`, `status(queued|running|succeeded|failed)`, `provider/model_version nullable`, `error_code nullable`, timestamps, `idempotency_key nullable`. `(user_id, media_asset_id, created_at)` 인덱스.
- `identification_candidates`: `id uuid PK`, `job_id uuid FK`, `species_id uuid FK nullable`, `rank smallint 1..3`, `confidence_band(high|medium|low)`, `score real internal nullable`, `label_raw nullable`; unique `(job_id, rank)`.
- `observations`: `id uuid PK`, `user_id uuid`, `species_id uuid nullable FK`, `media_asset_id uuid FK`, `identification_job_id uuid nullable FK`, `identified_by(ai_confirmed|user_selected|unidentified)`, `region_label varchar(100) nullable`, `observed_at timestamptz`, `created_at`, `updated_at`, `deleted_at nullable`, `idempotency_key`. unique `(user_id, idempotency_key)`.
- `users`: 인증 공급자의 user id를 참조한다. 별도 프로필 테이블은 앱 설정에 필요한 최소값이 생길 때만 추가한다. 인증 공급자 id에 FK를 직접 둘 수 없는 경우 DB UUID와 provider subject 매핑 테이블을 사용한다.

무결성: 미확인이면 종 ID null, 나머지는 종 ID 필수. job은 같은 사용자와 미디어 소유자에 일치해야 한다. 사진/기록 접근에서 소유자 일치를 강제한다. 도감은 삭제되지 않은 observation을 종별 group by로 집계한다.

## 8. 기술 구성 기본값

- 앱: 현재 Expo + React Native + TypeScript를 유지. React Navigation 또는 Expo Router 중 이미 정착하지 않았다면 Expo Router로 단순 구성. 서버 개발자에게는 화면, API 호출, 로딩/오류 상태를 각 화면 파일 근처에 모으고 복잡한 전역 상태 라이브러리는 초기에 도입하지 않는다.
- API: 현재 FastAPI + SQLAlchemy + Alembic + PostgreSQL을 유지. OpenAPI가 앱 API 타입의 기준.
- DB: PostgreSQL 관리형 서비스 또는 로컬 Docker. 사용자 데이터는 인증 provider subject로 소유권 매핑.
- 이미지: S3 호환 오브젝트 스토리지 + 짧은 presigned URL. DB에는 key만 저장하고 이미지 byte는 DB에 넣지 않는다.
- 비동기 작업: MVP 규모에는 PostgreSQL 기반 job 큐/worker 폴링으로 시작해 서비스 수를 줄인다. 트래픽/처리량이 커질 때 Redis/Celery 등으로 분리.
- AI: 백엔드에 `IdentificationProvider` 인터페이스, 설정 가능한 공급자 한 개. AI는 카탈로그 후보 매핑을 반환하고 저장 결정을 내리지 않는다.
- 관측성: request id, job id, 처리시간, provider 사용량/비용만 수집. 사진 자체·토큰·정확 좌표는 로그 금지.
- 환경: 로컬 `.env`는 커밋 금지, `.env.example`만 유지. 개발/베타/운영 설정 분리.

## 9. 저장소 구성 제안

```text
ocean-diary/
  apps/mobile/                 # Expo 화면, 컴포넌트, API 클라이언트
    app/                       # route 단위 화면
    src/features/catalog/      # 도감 화면/쿼리/타입
    src/features/observations/ # 기록 플로우
    src/features/auth/
    src/shared/                 # 버튼, 오류, 테마, 네트워크
  services/api/app/             # FastAPI routes, schemas, services, models
  services/api/migrations/      # Alembic
  services/worker/              # 식별 job 소비자/이미지 처리
  data/species/                 # 검수한 카탈로그 원천 JSON
  infra/                        # 로컬 compose, 배포 템플릿
  docs/                         # 기능 명세, API 계약, TODO, 운영·개인정보 결정
```

현재 앱은 `App.tsx`가 화면 흐름을 조정하는 단일 파일 중심이므로 한 번에 구조를 크게 갈아엎지 않는다. 공통 사진·그림 렌더러와 종 타입은 `src/components/ObservationImages.tsx`, `src/types/species.ts`로 분리했고, 홈 S01의 소개·계정 진입·초안 이어하기·발견 요약·최근 발견은 `src/features/home/HomeDiscoverySection.tsx`, 하단 사진 선택·초안 재시도 버튼은 `src/features/home/PhotoCaptureAction.tsx`, 홈의 종 검색·오프라인 안내·카드 그리드는 `src/features/catalog/CatalogCollectionSection.tsx`, 종 상세 S02는 `src/features/catalog/SpeciesDetailModal.tsx`, 이메일 코드 로그인 모달은 `src/features/auth/AuthModal.tsx`, 계정·개인정보 설정 S12는 `src/features/account/AccountSettingsModal.tsx`, 사진 미리보기·업로드 고지 S04는 `src/features/observations/PhotoPreviewModal.tsx`, S08의 AI 후보/직접 검색/미확인 선택은 `src/features/observations/SpeciesSelectionSection.tsx`로 옮겼다. 후보·선택 출처·식별 상태 타입은 `src/types/identification.ts`에 둔다. S07/S08의 사진 식별·후보 확인·관찰 정보 입력·저장 UI는 `src/features/observations/IdentificationFlowModal.tsx`, S10 저장 완료 그림책 카드는 `src/features/observations/ObservationSavedModal.tsx`로 옮겼고, 발견 요약 타입은 `src/types/observation.ts`에서 공유한다. 개인 발견 목록 S09와 상세/수정 S10은 각각 `src/features/observations/ObservationListModal.tsx`, `ObservationDetailModal.tsx`로 옮겼다. API·초안·재시도 상태와 화면 전환은 기존 App 상위 로직이 계속 소유한다. 다음 화면 변경 때 화면 UI와 API 상태를 `features/`로 점진적으로 옮기며 기존 DB/API/Expo 실행 기반을 보존한다.

## 10. 개발 실행 체크리스트(의존성 순서)

기능 구현은 아래의 MVP 뼈대까지 진행됐다. 정확한 코드 완료와 외부 검증 상태는 `docs/todo.md`를 단일 실행 추적표로 사용한다.

- [x] 제품 범위·화면 상태·데이터 규칙·API 계약을 v1로 기록.
- [x] 사진 선택/업로드, 비동기 식별, 후보 확인·수동 검색·미확인 선택, 발견 저장과 개인 도감 조회를 앱/API에 연결.
- [x] 인증 경계, 사용자 소유권, rate limit, 멱등성, 외부 AI 동의, 계정 삭제 tombstone, 사진/계정 정리 worker를 구현. 사용자 DB는 2026-11-03에 migration `0012_retire_legacy_upload_intents`까지 적용했고 `/v1/ready`가 `ready`를 반환함을 확인.
- [x] 로컬 API·PostgreSQL·MinIO 준비 상태 및 7종 카탈로그 목록/검색을 사용자 환경에서 확인. 모바일 TypeScript와 Android 정적 export도 통과.
- [ ] Android 실기기에서 전체 흐름, 권한 거부, TalkBack, 네트워크 복구, 앱 재시작을 확인. Android SDK `adb.exe`는 있지만 이 실행 환경에서 ADB server가 시작되지 않아 현재 기기 확인이 불가능하다.
- [ ] worker 자동 재시도와 Supabase Auth 실제 계정 삭제, 외부 AI 동의 차단 등 환경 의존 서버 동작을 확인.
- [ ] 종 일러스트 생물 검수, 라벨 수중 사진 AI 평가, 개인정보/보유기간/비용 검토 후 소수 다이버 베타와 스토어 제출을 준비.

## 11. 첫 주 실행 순서와 완료 기준

첫 주 목표는 전체 AI를 서두르지 않고 실제 폰에서 사진 입력부터 기록 생성까지 흐름 뼈대가 동작하며, 위험한 외부 의존을 빨리 확인하는 것이다.

- 1일차: 저장소 이전 확인, 명세/기존 API·앱 대조, 실행 환경·포트·기동 절차 README 갱신. 완료: 새 경로에서 API 및 앱 시작 명령이 재현됨.
- 2일차: 화면 흐름을 연결하고 인증 공급자/스토리지 선택을 코드 경계 뒤에 둔다. 완료: 홈→사진 선택→미리보기→취소/복귀 동작.
- 3일차: 인증 연결과 media DB/API 설계 및 마이그레이션. 완료: 테스트 사용자 소유권과 pending media 발급이 확인됨.
- 4일차: presigned 업로드와 complete, 이미지 검증/EXIF 제거. 완료: 실제 폰 사진 1장이 저장소에 올라가 ready가 됨.
- 5일차: AI worker/provider 연결 초안과 mock provider. 완료: 비동기 job이 후보/후보 없음/실패 상태를 내고 앱이 복구함.
- 주말/잔여: 발견 저장/개인 도감 연결, 엣지 케이스 정리.

첫 주의 출시 가능 완료 기준은 앱스토어 출시가 아니다. 새 프로젝트 위치에서 개발 서버/앱이 재현되고, 실제 Android 기기에서 사진을 선택해 개발용 식별 결과(초기에는 mock 허용)를 확인한 다음, 종 또는 미확인을 선택해 DB 기록을 남기고 앱 재시작 뒤에도 조회되는 것이다. 실제 AI 정확도·비용·개인정보 보유정책 검증은 베타 공개 전 별도 완료해야 한다.

## 12. 출시 전 위험과 검증 게이트

| 위험 | 왜 중요한가 | 출시 전 검증/완화 |
|---|---|---|
| 종 식별 정확도 | 수중 사진은 색 편향·흐림·가림·유사종 때문에 오답 가능성이 높음 | 국내 수중 이미지의 종 라벨 평가셋 구성, top-1/top-3 적합성·미등록 종 비율 측정, 불확실성 표현과 수동 선택 제공 |
| 저신뢰 처리 | 자신감 과장 시 잘못된 생물 정보가 기록됨 | 숫자 점수 비노출, 검수 임계값 전까지 후보를 보수적으로 구분, 낮은 신뢰/후보 없음에서 검색·미확인 경로 노출 |
| 이미지 저장/비용 | 원본 대용량과 AI 반복 호출은 비용·보안 위험 | 리사이즈/EXIF 제거, 파일·해상도·요청 제한, presigned URL 만료, 보유기간·삭제 작업, 사용자별/일별 호출 제한 및 비용 알람 |
| 개인정보/위치 공개 | 원본 EXIF나 사진 자체에 다이빙 위치/사람이 포함될 수 있음 | GPS 제거를 서버에서 검증, 좌표 미수집, 지역은 선택 입력/비공개, 보유·삭제 안내와 계정 삭제 경로 완성 |
| 콘텐츠 권리/생물 오류 | 그림책 카드와 종 설명이 틀리거나 권리를 침해할 수 있음 | 자체 제작/허가된 그림만 배포, 라이선스 기록, 국명·학명·설명 전문가/공식자료 대조 |

## 13. 완료 정의(기능 단위)

- API 계약과 타입/오류 코드가 일치하고 OpenAPI에 반영됨.
- 주요 화면의 로딩·빈 화면·성공·실패·재시도 상태를 구현.
- 사용자 소유권과 멱등성을 서버에서 강제.
- 사진/식별/발견의 상태 전이가 문서와 일치하고 중간 실패에서 복구 가능.
- 접근성 라벨·한국어 문구·실제 Android 화면 크기/권한 흐름 확인.
- 테스트/수동 검증 증거와 미해결 위험을 `docs/todo.md`에 갱신.
