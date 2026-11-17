# OCEAN DIARY iOS 베타·출시 체크리스트

마지막 확인: 2026-11-09

## 현재 확인된 상태

- 기준 브랜치: `feat/v2-ui`, HEAD `7c1211c` (`5단계 연동: 목업을 API로 교체, 발견 업로드·식별·저장, 내 계정`). 로컬 `origin/feat/v2-ui`보다 커밋 5개 앞서 있다.
- 작업 트리에는 `apps/mobile/tsconfig.json` 수정과 `apps/mobile/.gitignore` 신규 파일이 있다. 이 두 파일은 이번 작업에서 변경하지 않았다. 커밋 전에 의도한 변경인지 검토한다.
- 보고된 검증: 타입 검사, API 테스트 12개, 로컬 웹에서 주요 흐름 확인. 실제 iPhone 검증은 아직이다.
- `com.oceandiary.app`과 iOS `buildNumber: 1`은 앱 설정에 있으나, Apple 계정의 번들 ID 사용 가능 여부, EAS 프로젝트, 배포 서버, 실제 로그인 제공자는 아직 확인/완료하지 않았다.
- 현재 개발 AI 설정은 후보를 반환하지 않는 mock 모드다. 수동 종 검색·저장 흐름 확인용이며 실제 AI 품질 검증은 아니다.

## 진행 순서

### 1. 코드와 로컬 서버를 안전하게 확인

먼저 프로젝트 루트에서 브랜치와 수정 파일을 확인한다. 현재 작업 트리의 내용을 확인하지 않고 초기화하거나 덮어쓰지 않는다.

```powershell
cd "C:\Users\20231\Ocean Diary"
git status --short --branch
git diff -- apps/mobile/tsconfig.json
Get-Content apps/mobile/.gitignore
```

변경 의도를 확인한 뒤 필요한 파일만 커밋한다. 로컬 커밋 5개는 아직 원격에 올라가지 않았다. 원격 백업/공유가 필요하면 검토와 커밋 후 `git push origin feat/v2-ui`를 실행한다.

모바일 의존성을 설치한다.

```powershell
cd "C:\Users\20231\Ocean Diary\apps\mobile"
npm install
npm run typecheck
```

그 다음 README의 로컬 실행 절차로 API, worker, 앱을 켠다. mock AI는 후보를 만들지 않는 것이 정상이다. 테스트 계정과 테스트 사진으로 사진 선택 → 업로드 → 직접 종 검색 → 저장 → 앱 새로 실행 → 홈/도감/로그북/수족관/지도 확인을 진행한다. 계정 삭제는 삭제 전용 테스트 계정에서만 확인한다.

### 2. Apple Developer Program 등록

혼자 개발하고 App Store 판매자에 본인의 법적 이름이 표시되어도 괜찮다면 **Individual(개인)** 로 등록한다. Apple은 개인 또는 개인사업자/1인 사업자의 판매자 이름을 본인의 법적 이름으로 표시한다. `OCEAN DIARY`는 앱 이름으로 사용할 수 있지만, 개인 계정의 판매자 이름을 브랜드로 바꾸지는 않는다.

법인 이름을 판매자로 표시하려면 **Organization(조직)** 으로 등록해야 한다. Apple이 인정하는 법인격, 해당 법인의 D‑U‑N‑S 번호, 조직 도메인 이메일과 정상 작동하는 공개 웹사이트, Apple과 계약을 맺을 권한이 필요하다. 상호나 개인사업자 이름만으로 조직 등록이 되는 것은 아니다. D‑U‑N‑S가 새로 필요하면 Apple 안내상 D&B 발급에 최대 5영업일, Apple에 정보가 전달되기까지 추가 최대 2영업일을 잡는다.

개인 등록 순서:

1. 본인 Apple Account의 법적 이름, 생년월일, 주소, 전화번호를 최신 상태로 맞추고 2단계 인증을 켠다. 다른 사람이나 회사 소유 계정은 사용하지 않는다.
2. [Apple Developer Program 등록](https://developer.apple.com/kr/programs/enroll/)에서 `Enroll`을 시작한다. 웹에서 진행하거나 지원 지역이면 Apple Developer 앱에서 `Account → Enroll Now`로 시작한다.
3. `Individual`을 선택하고 신원 확인 요청을 완료한다. 이름은 별명이나 서비스명이 아닌 신분증의 법적 이름과 일치해야 한다.
4. 약관에 동의하고 결제한다. 기본 연회비는 미화 99달러이며 지역별 결제 금액은 등록 화면에서 확인한다.
5. 확인 완료 메일을 받은 뒤 App Store Connect에 로그인한다.

조직 등록은 법인명이 App Store 판매자로 보이길 원하고, 위 법인·D‑U‑N‑S·웹사이트 요건을 실제로 갖춘 경우에만 선택한다. 조직 등록자는 조직을 Apple과의 계약에 구속할 법적 권한이 있어야 한다.

### 3. App Store Connect 앱 등록과 개인정보 자료

1. App Store Connect에서 새 앱을 만들고 플랫폼 `iOS`, 기본 언어 `한국어`, 앱 이름 `OCEAN DIARY`(사용 가능 여부 확인), 번들 ID `com.oceandiary.app`, 고유 SKU를 지정한다.
2. 번들 ID가 본인 팀에서 사용 가능하고 EAS 설정과 같은지 확인한다. 앱을 공개한 뒤 Bundle ID를 바꾸면 별도 앱으로 취급된다.
3. 공개 HTTPS 개인정보 처리방침 페이지를 준비하고 App Store Connect의 App Privacy에 URL을 입력한다. Apple은 모든 앱에 개인정보 처리방침 URL을 요구한다.
4. `docs/privacy-policy-draft.md`의 대괄호 항목을 채운다. 실제 운영자, Supabase/AWS 리전과 사업자, 사진·로그·AI 데이터 흐름, 보유·삭제 기간, 문의처를 운영 설정과 대조한 뒤 공개한다. 초안은 아직 공개하면 안 된다.
5. App Privacy 응답에는 이메일, 사용자가 올린 사진, 발견/다이브 로그, 지역·포인트 이름, 인증 식별자, 서버 진단 정보와 외부 AI 처리 여부를 실제 설정에 맞춰 신고한다.
6. 심사용 연락처와 로그인 절차를 작성하고, 심사자가 계정 기반 기능을 볼 수 있도록 전용 데모 계정/테스트 방법을 제공한다. 계정 삭제 기능과 API 서버도 심사 중 접근 가능해야 한다.

### 4. 운영 서버와 EAS 빌드 준비

TestFlight에서 실제 사용자 흐름을 검증하려면 PC의 `localhost`가 아닌 공개 HTTPS API가 필요하다. v2 계획은 API/worker를 ECS Fargate, DB를 RDS PostgreSQL, 사진을 비공개 S3로 옮기고 비밀값을 Secrets Manager에 두도록 한다. 배포 전에 비용 한도를 정하고 DB 백업·복구, 운영 로그, 접근 제한, worker 자동 재시작, 데이터 삭제를 확인한다.

운영 인증·API·스토리지·worker가 준비되면 앱의 공개 설정만 EAS에 넣는다. API URL, Supabase URL, publishable key는 클라이언트 공개 설정이다. Supabase service-role, DB, S3, AI 공급자 비밀키는 앱이나 `EXPO_PUBLIC_*`에 넣지 않는다.

`apps/mobile`에서:

```powershell
npx eas-cli login
npx eas-cli init
npx eas-cli build --platform ios --profile production
```

첫 iOS 빌드에서 EAS가 Apple 계정 로그인을 요청하면 본인의 Developer Program 계정으로 서명 자격 증명을 설정한다. 설정된 `ios.bundleIdentifier`를 확인한다. 현재 `eas.json`의 production 프로필은 Android App Bundle 설정이 있지만, iOS 빌드도 같은 profile 이름으로 호출할 수 있다.

빌드가 완료되면 App Store Connect 앱 레코드가 연결됐는지 확인한 뒤:

```powershell
npx eas-cli submit --platform ios
```

EAS Submit은 Windows에서도 업로드할 수 있다. 첫 제출에서 Apple 계정 또는 App Store Connect API 키를 설정하라는 안내가 나오면 안내대로 본인 계정/키를 연결하고, 비밀값을 Git이나 채팅에 저장하지 않는다. 업로드는 출시 승인과 다르다.

### 5. TestFlight 기기 검증

1. 빌드가 App Store Connect에서 처리될 때까지 기다린 뒤 TestFlight 내부 그룹에 본인과 팀 테스터를 추가한다.
2. 실제 iPhone에서 새 설치, 사진 선택 권한, 업로드/AI 동의, 후보 검색·미확인 저장, 로그 수정·삭제, 세션 유지, 계정 삭제, 앱 재실행 복구, 수족관/지도 성능과 접근성을 확인한다.
3. 외부 다이버에게 배포할 때 외부 테스트 그룹과 베타 설명/심사 정보를 채운다. 첫 외부 테스트 빌드는 TestFlight App Review가 필요할 수 있고, Apple은 첫 빌드가 외부 그룹에 추가될 때 심사를 진행한다고 안내한다.
4. 피드백과 충돌을 고친 뒤 새 빌드를 제출한다. TestFlight 빌드는 최대 90일 동안 테스트할 수 있다.

## 로그인 선택에 관한 정정

현재처럼 이메일 코드 로그인만 제공하면 소셜 로그인 때문에 Sign in with Apple이 자동으로 필요한 상황은 아니다. 나중에 Google 또는 Kakao를 기본 계정 로그인으로 추가하면 App Review Guideline 4.8의 동등 로그인 요건을 만족해야 한다. Apple 문구는 특정하게 Apple 로그인을 이름으로 강제하기보다, 이름·이메일만 수집하고 이메일 비공개를 허용하며 광고 목적의 앱 상호작용 추적을 동의 없이 하지 않는 동등 옵션을 요구한다. 실무상 Sign in with Apple을 추가하는 것이 가장 익숙한 선택이다.

Kakao를 추가할 때는 Kakao Developers 앱 등록, Kakao Login 활성화, Supabase 대시보드의 Kakao callback URL 등록, REST API key와 활성화한 client secret의 Supabase provider 입력, 필요한 동의 항목 설정 순으로 진행한다. Kakao 이메일 제공은 필수가 아니며 이메일 동의 항목은 Biz App 전환이 필요할 수 있으므로, 앱 서버가 이메일 없이 Supabase 사용자 UUID만으로 동작하는지 먼저 확인한다. Google은 Google Cloud OAuth client와 Supabase callback URL 설정이 필요하다. 두 소셜 로그인 모두 앱에 OAuth callback/deep link 처리 코드를 추가한 뒤 실제 iPhone에서 테스트해야 한다.

## 공식 참고자료

- [Apple Developer Program 등록 안내](https://developer.apple.com/kr/programs/enroll/)
- [Apple의 D‑U‑N‑S 안내](https://developer.apple.com/kr/help/account/membership/D-U-N-S/)
- [Apple App Review Guidelines 4.8 및 5.1.1(v)](https://developer.apple.com/app-store/review/guidelines/)
- [Apple 개인정보 처리방침 URL 입력 안내](https://developer.apple.com/help/app-store-connect/manage-app-information/manage-app-privacy)
- [TestFlight 개요](https://developer.apple.com/help/app-store-connect/test-a-beta-version/testflight-overview/)
- [Expo iOS 제출 안내](https://docs.expo.dev/submit/ios/)
- [Supabase Kakao 로그인 설정](https://supabase.com/docs/guides/auth/social-sign-in/auth-kakao)
- [Supabase Google 로그인 설정](https://supabase.com/docs/guides/auth/social-sign-in/auth-google)
