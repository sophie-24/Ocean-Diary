# OCEAN DIARY

Monorepo for OCEAN DIARY. **v2 is in progress** (iOS first, then Android): five tabs — 홈 · 도감 · 발견 · 로그북 · 나의 바다 — rebuilt from the design canvas. See `docs/plan-v2.md` for decisions, routes, data model and phases; it supersedes the v1 scope notes below.

## Workspace

- `apps/mobile`: Expo + React Native mobile app (expo-router tabs in `app/`, API hooks in `src/api/`)
- `services/api`: FastAPI backend
- `services/api/app/worker.py`: asynchronous identification and retryable cleanup worker
- `infra`: local PostgreSQL and MinIO setup
- `docs`: product and API contracts

## Product documents

- `docs/plan-v2.md`: v2 decisions, screen-to-route map, data model and delivery phases
- `docs/ios-release-checklist.md`: verified Apple Developer enrollment, local validation, EAS/TestFlight, and release steps
- `docs/feature-spec-v1.md`: MVP implementation baseline with screen behavior, states, data rules, privacy requirements, and completion criteria
- `docs/api-contract-v1.md`: mobile/server request and response contract
- `docs/progress.md`: latest development milestone, static checks, and release gates
- `docs/todo.md`: implementation progress and next concrete tasks
- `docs/privacy-policy-draft.md`: internal privacy notice draft; it must not be published until the controller, vendors, regions, legal bases, contact, and production retention settings are confirmed

## Local development

Prerequisites: Node.js 22 LTS, npm, Python 3.11+, and Docker Desktop.

### Start the API with one command

After creating `services/api/.venv` and installing `services/api/requirements.txt`, open PowerShell in the project root and run:

```powershell
.\scripts\start-api.ps1
```

The script starts PostgreSQL and MinIO, waits for PostgreSQL health, applies all database migrations, and seeds the species catalog before starting the API on port `8765`. If that port is already occupied by a ready API, it still applies migrations and seeds, then exits without starting a duplicate; stop the old API window and rerun the script to load the latest server code. If another process occupies the port or the API is not ready, it explains how to stop the current process or choose another port; it never kills another process. Keep the API window open while using the app. Run the identification worker in a separate PowerShell window as described below. If the project-root .env is missing, it creates one from .env.example and preserves any existing settings.

After changing API or worker code, stop both running processes and restart them so they load the same version. Start the API first; its script applies the latest migration before starting. Then start the worker in a second window.

Migration `0012` safely retires unfinished uploads created before upload and processed images used separate keys. Before applying it, stop both the old API and worker in their PowerShell windows with `Ctrl+C`; this keeps old code from changing media rows while the migration retires legacy uploads. Run `start-api.ps1` again. It waits if an older signed URL could still overwrite a completed photo; keep the same `UPLOAD_INTENT_TTL_SECONDS` setting used by the old API and retry only after the delay it prints (at least twice the TTL plus 15 minutes). Any unfinished upload from the old version must be started again. After API startup, verify `/v1/ready` reports `ready` before starting the worker again.

If Alembic previously failed with `value too long for type character varying(32)` while moving from `0009` to `0010`, the transaction left the schema at `0009`. The `0010` migration now widens Alembic's version column before writing the longer revision name. Stop API and worker, then rerun `cd "C:\Users\20231\Ocean Diary\services\api"` followed by `\.venv\Scripts\python.exe -m alembic upgrade head`; no manual database rollback is needed when `alembic current` still reports `0009`.

Each presigned upload URL can write only to a temporary upload key. After validation, the API writes the EXIF-cleaned image to a different final key used by the app and AI. The worker removes the temporary key after its upload URL expires plus a 15-minute grace period. If account deletion is requested while an upload URL is still active, deletion remains pending and the worker retries after the URL expires.

`GET /v1/health` confirms the API process is responding. `GET /v1/ready` also checks PostgreSQL, the required Alembic schema revision, and MinIO; it returns HTTP 503 with the unavailable dependency when the app cannot yet handle photo workflows. Database connection attempts time out after five seconds by default; adjust `DATABASE_CONNECT_TIMEOUT_SECONDS` in the project-root `.env` if needed.

If `/v1/ready` reports `dependency: "database_schema"`, the API process is reachable but the database is behind the code. Stop the API and worker in their running PowerShell windows with `Ctrl+C`, then run `scripts/start-api.ps1` from the project root. Do not run the migration while older API or worker code is still active. Migration `0012` protects photos from old signed upload URLs: if it reports that a legacy URL may still be active, keep the existing `UPLOAD_INTENT_TTL_SECONDS` value and retry only after the delay printed by the migration (35 minutes with the default 10-minute TTL). After startup, `/v1/ready` should report `ready` before starting the worker or mobile app.

For manual setup or troubleshooting, use the individual commands below.

Use three PowerShell windows. Replace the paths below only if you installed the project in a different folder.

1. **Project setup, once:**

   ```powershell
   cd "C:\Users\20231\Ocean Diary"
   if (-not (Test-Path .env)) { Copy-Item .env.example .env }
   docker compose -f infra\docker-compose.yml up -d
   docker compose -f infra\docker-compose.yml ps -a
   ```

   PostgreSQL should show `healthy`; `minio-init` should finish after creating the bucket. MinIO's local console is at `http://127.0.0.1:9001` (`minioadmin` / `minioadmin`). These credentials are for local development only.

2. **Database and API, second window:**

   ```powershell
   cd "C:\Users\20231\Ocean Diary\services\api"
   .\.venv\Scripts\python.exe -m pip install -r requirements.txt
   .\.venv\Scripts\python.exe -m alembic upgrade head
   .\.venv\Scripts\python.exe -m app.seed_species
   .\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8765
   ```

   If `.venv\Scripts\python.exe` does not exist, create the environment first with `py -3.11 -m venv .venv`. Port `8765` is the local API address.

3. **Identification worker, third window:**

   ```powershell
   cd "C:\Users\20231\Ocean Diary"
   .\scripts\start-worker.ps1
   ```

   The helper checks `/v1/ready` first, which confirms the API, PostgreSQL, and MinIO are reachable. Keep this window open while developing; the worker consumes identification jobs and runs media/account cleanup every 60 seconds. To use another local API address, set `$env:OCEAN_DIARY_API_URL` before launching the script.

By default, the `mock` provider returns no fabricated species. To enable OpenAI vision identification, add `OPENAI_API_KEY` to the project-root `.env`, set `IDENTIFICATION_PROVIDER=openai`, and optionally change `OPENAI_MODEL` to a vision-capable model available to your account. Restart the API and worker after changing `.env`. Photos are sent to the external provider only in this mode. External providers are limited to 20 identification jobs per user per Korea calendar day by default; set `MAX_IDENTIFICATION_JOBS_PER_USER_PER_DAY` in `.env` to change the cap. Provider calls time out after 45 seconds by default (`AI_PROVIDER_TIMEOUT_SECONDS`). After three provider failures within five minutes, a shared circuit breaker pauses calls until the failure window cools down; `AI_PROVIDER_FAILURE_THRESHOLD` and `AI_PROVIDER_CIRCUIT_WINDOW_SECONDS` adjust the defaults. Safe worker logs include elapsed time and provider token usage, never photo data or signed URLs. Candidate labels are suggestions requiring diver confirmation; biological accuracy has not yet been evaluated. The worker removes incomplete or rejected uploads after a 15-minute grace period, removes ready photos that were never saved to a discovery after seven days, retries media object deletion requests, resumes pending account deletions every 60 seconds, and removes completed tombstones after their token-blocking period. User-deleted observations are hidden immediately and their row is purged after 30 days by default (`DELETED_OBSERVATION_RETENTION_DAYS`); deleted media rows are purged only after objects are confirmed deleted and no observations refer to them. The mobile app keeps one active photo draft and its identification/selection state in the app-private document directory so the flow can resume after an app restart; it deletes the local draft photo when the user saves or discards it.

4. **Mobile app, first window after setup:**

   ```powershell
   cd "C:\Users\20231\Ocean Diary\apps\mobile"
   if (-not (Test-Path .env)) { Copy-Item .env.example .env }
   npm install
   npm start
   ```

   For a physical phone, keep `EXPO_PUBLIC_API_URL=http://127.0.0.1:8765` and set `S3_PUBLIC_ENDPOINT_URL=auto` in the project-root `.env`; the app and API then follow whatever PC address the phone used. See "아이폰(Expo Go)으로 앱 실행하기" below.

To view the current service screens in a desktop browser, run the preview on your Windows PC in a separate PowerShell window. A `localhost` URL from a Codex-managed process is private to that process and will not open in the desktop browser.

```powershell
cd "C:\Users\20231\Ocean Diary"
.\scripts\start-mobile-preview.ps1
```

The helper uses `EXPO_PUBLIC_API_URL` from `apps/mobile/.env` (default `http://127.0.0.1:8765`) and opens the web preview at `http://localhost:8081`. Keep this PowerShell window open while viewing the app. If the API uses a different address, pass it directly, for example `.\scripts\start-mobile-preview.ps1 -ApiUrl "http://127.0.0.1:8766"`. If Metro still shows an error from an older bundle, stop it with Ctrl+C and restart once with `.\scripts\start-mobile-preview.ps1 -ClearCache`. In development, the API accepts browser requests only from Expo's HTTP loopback origins on ports 8080–8089 and 19006. This uses the same React Native screens through React Native Web; it is a layout and interaction preview, not a substitute for Android/iOS device checks. Browser-preview photo drafts remain in memory and do not survive a page reload; browser sign-in sessions use tab-scoped `sessionStorage`. Native mobile drafts and sign-in sessions continue to use the device's private temporary and secure storage. Without Supabase configuration the public catalog can be previewed, while account-only actions require authentication settings.

   To enable real email-code login, set `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in `apps/mobile/.env`, and set the matching `SUPABASE_URL` in the project-root `.env`. In the Supabase email template, include the one-time code variable `{{ .Token }}`; the app verifies that code and stores the session for later launches. Set `SUPABASE_ACCESS_TOKEN_MAX_AGE_SECONDS` to the project's maximum JWT lifetime; longer-lived access tokens are rejected, and completed account-deletion tombstones are kept until that lifetime has passed. The mobile publishable/anon key is intended for client use; never put a service-role key in an `EXPO_PUBLIC_` variable. To support in-app account deletion, set the server-only `SUPABASE_SERVICE_ROLE_KEY` in the project-root `.env`. Without Supabase values, local development continues to use the fixed development token.

### 아이폰(Expo Go)으로 앱 실행하기 — 한국어 안내

PC에서 서버를 켜고, 아이폰의 Expo Go로 앱을 여는 방법입니다. **핫스팟이나 Wi‑Fi가 바뀌어 IP가 달라져도 설정 파일을 고칠 필요가 없습니다.**

- 앱은 개발 모드에서 API 주소의 `127.0.0.1`을, Expo Go가 이미 접속한 PC 주소로 자동으로 바꿉니다.
- API는 `S3_PUBLIC_ENDPOINT_URL=auto`일 때, 폰이 접속한 PC 주소로 사진 업로드 URL을 만듭니다.

#### 처음 한 번만 준비

1. **설정 파일 확인:** 아래 두 값을 확인합니다. 예전에 IP를 직접 적어 두었다면 아래 값으로 되돌리세요.
   - 프로젝트 루트 `.env`

     ```env
     S3_PUBLIC_ENDPOINT_URL=auto
     S3_ENDPOINT_URL=http://127.0.0.1:9000
     ```

   - `apps/mobile/.env`

     ```env
     EXPO_PUBLIC_API_URL=http://127.0.0.1:8765
     ```

2. **패키지 설치:**

   ```powershell
   cd "C:\Users\20231\Ocean Diary\apps\mobile"
   npm install
   ```

3. **Windows 방화벽:** 폰이 PC의 8081(Expo), 8765(API), 9000(사진 저장소) 포트에 들어올 수 있게 허용합니다. PowerShell을 **관리자 권한**으로 열고 한 번 실행하세요.

   ```powershell
   New-NetFirewallRule -DisplayName "Mola dev (Expo/API/MinIO)" -Direction Inbound -Protocol TCP -LocalPort 8081,8765,9000 -Action Allow -Profile Private,Public
   ```

   개발할 때만 쓰는 규칙입니다. 지우려면 `Remove-NetFirewallRule -DisplayName "Mola dev (Expo/API/MinIO)"`를 실행하세요.

4. **Expo Go 설치:** 아이폰에 App Store에서 **Expo Go**를 설치합니다.

#### 매번 실행하는 순서 (PowerShell 창 3개)

PC와 아이폰은 **같은 네트워크**에 있어야 합니다. 같은 Wi‑Fi이거나, PC가 아이폰 핫스팟에 연결되어 있으면 됩니다. Docker Desktop을 먼저 켜 두세요.

```powershell
# 창 1 — DB·사진 저장소(MinIO)·API
cd "C:\Users\20231\Ocean Diary"
.\scripts\start-api.ps1

# 창 2 — AI 식별 worker
cd "C:\Users\20231\Ocean Diary"
.\scripts\start-worker.ps1

# 창 3 — Expo (QR 코드가 나옵니다)
cd "C:\Users\20231\Ocean Diary"
.\scripts\start-mobile.ps1
```

창 3에 QR 코드가 뜨면, 아이폰 **기본 카메라**로 QR을 찍습니다. 뜨는 알림을 누르면 Expo Go에서 앱이 열립니다.

#### IP가 바뀌었을 때 (핫스팟 재연결 등)

- **창 3만** `Ctrl+C`로 끄고 `.\scripts\start-mobile.ps1`을 다시 실행한 뒤, 새 QR을 찍으면 됩니다.
- API와 worker는 그대로 두세요. `.env`도 고칠 필요가 없습니다.
- Expo Go의 '최근 항목'에는 예전 IP가 남아 있으니, 꼭 **새 QR**로 여세요.

#### QR 주소가 엉뚱한 네트워크를 가리킬 때

PC에 네트워크가 여러 개면 Expo가 다른 주소를 고를 수 있습니다. 랜선, 가상 어댑터(VPN·Docker·WSL), 핫스팟이 같이 있는 경우가 그렇습니다.

1. 스크립트가 출력하는 `This PC's network addresses:` 목록이나 `ipconfig`에서, 폰과 같은 네트워크의 IPv4를 찾습니다. 아이폰 핫스팟이면 보통 `172.20.10.x`입니다.
2. 그 주소를 지정해 다시 실행합니다.

```powershell
.\scripts\start-mobile.ps1 -HostIp 172.20.10.2
```

#### 연결이 안 될 때 확인

```powershell
# 1) PC에서 API가 살아 있는지
Invoke-RestMethod "http://127.0.0.1:8765/v1/ready"

# 2) PC의 네트워크 주소로도 열리는지 (172.20.10.2 자리에 위에서 찾은 IPv4)
Invoke-RestMethod "http://172.20.10.2:8765/v1/ready"

# 3) API가 모든 네트워크(0.0.0.0)에서 받고 있는지
Get-NetTCPConnection -LocalPort 8765 -State Listen | Format-Table LocalAddress, LocalPort, OwningProcess
```

- **1번은 되는데 2번이 안 되면:** 방화벽(위 3번 준비 단계)을 확인하세요. 또는 Windows가 네트워크를 '공용'으로 막고 있을 수 있습니다.
- **아이폰 Safari에서 확인:** `http://<PC 주소>:8765/v1/ready`를 열어 `"status":"ready"`가 나오면 폰↔PC 연결은 정상입니다.
- **앱은 열리는데 사진 업로드만 실패하면:** 루트 `.env`의 `S3_PUBLIC_ENDPOINT_URL`이 `auto`인지 보고, API(창 1)를 다시 시작하세요.
- **경고는 무시해도 됩니다:** Expo의 업데이트 안내나 `Response.blob()` 성능 경고는 연결 실패와 관계없습니다.

#### 참고: 데스크톱 브라우저 미리보기

```powershell
cd "C:\Users\20231\Ocean Diary"
.\scripts\start-mobile-preview.ps1
```

`http://localhost:8081`에서 같은 화면을 볼 수 있습니다. 레이아웃 확인용이고, 사진의 촬영일(EXIF) 같은 일부 기능은 실제 폰에서만 동작합니다.

Native build identifiers are provisionally set to `com.molalog.app` on Android and iOS. Confirm that these identifiers are available and owned by the publisher before creating store listings; changing them after release creates a different installed app.

The launcher icon, splash image and favicon use the approved Mola sunfish mark (`apps/mobile/assets/icon.png`, `splash-icon.png`, `favicon.png`); Android uses the transparent adaptive foreground `apps/mobile/assets/adaptive-icon.png` on the `#2F6FDB` background so it stays inside launcher mask safe bounds.

The `feat/v2-ui` branch replaces the v1 screen tree with five tabs and API-backed discovery, logbook, diary, and sea screens. The latest recorded integration check used a local API/worker and mock object storage in a browser; no actual iPhone walkthrough or deployed AWS service has been confirmed. Local mock AI intentionally returns no candidates. See `docs/progress.md` and `docs/ios-release-checklist.md` for the remaining iOS release gates.

## Android build profiles

`apps/mobile/eas.json` defines an internal preview APK for device testing and a production Android App Bundle for Google Play. This project does not have the Android SDK/Gradle installed locally; EAS Build can create these artifacts remotely. Before either build, create an EAS project and set the public HTTPS API origin plus Supabase project URL and client publishable key as plaintext variables in both the `preview` and `production` EAS environments. These values are bundled into the app; the API URL and Supabase URL must be origins without credentials, paths, query strings, or fragments. The Supabase key may be the current `sb_publishable_...` key or legacy `anon` JWT, never a secret or `service_role` key. Do not set `EXPO_PUBLIC_DEV_AUTH_TOKEN` in either EAS environment. The EAS profile and its `OCEAN_DIARY_BUILD_TARGET` guard must agree; `apps/mobile/app.config.js` rejects mismatches and missing or local/private URLs and insecure authentication configuration. The API and its storage service must already be deployed and reachable from phones.

From `apps/mobile`, sign in to the Expo account and link this folder to a new EAS project once:

```powershell
npx eas-cli login
npx eas-cli init
```

Then set the real API and Supabase values in both EAS environments. Replace each placeholder with the deployed API origin, Supabase project URL, and key from the Supabase dashboard. Never use a local `127.0.0.1` URL or placeholder domain for a phone build.

```powershell
npx eas-cli env:set --name EXPO_PUBLIC_API_URL --value "https://api.your-domain.example" --environment preview --visibility plaintext
npx eas-cli env:set --name EXPO_PUBLIC_API_URL --value "https://api.your-domain.example" --environment production --visibility plaintext
npx eas-cli env:set --name EXPO_PUBLIC_SUPABASE_URL --value "https://your-project-ref.supabase.co" --environment preview --visibility plaintext
npx eas-cli env:set --name EXPO_PUBLIC_SUPABASE_URL --value "https://your-project-ref.supabase.co" --environment production --visibility plaintext
npx eas-cli env:set --name EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY --value "sb_publishable_replace_with_project_key" --environment preview --visibility plaintext
npx eas-cli env:set --name EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY --value "sb_publishable_replace_with_project_key" --environment production --visibility plaintext
```

The API URL, Supabase project URL, and publishable key are public client configuration, not secrets. Do not put database passwords, MinIO credentials, Supabase secret/service-role keys, or AI provider keys in `EXPO_PUBLIC_*` variables. Keep those secrets on the API server.

From `apps/mobile`, start a device-installable APK or Play Store AAB with:

```powershell
npx eas-cli build --platform android --profile preview
npx eas-cli build --platform android --profile production
```

The `versionCode` is maintained locally; increment it in `app.json` before each Play Store release. Builds were not submitted to EAS because this requires uploading the project source and configuring an EAS account/API environment.

## iOS TestFlight and App Store

The app config has the provisional iOS bundle identifier `com.molalog.app`, and the `production` EAS profile can be used for an iOS store build after an Apple Developer Program membership is active and the bundle ID is available in that team. Configure the EAS project and deployed public HTTPS API/Supabase values first. Then build and upload from `apps/mobile`:

```powershell
npx eas-cli build --platform ios --profile production
npx eas-cli submit --platform ios
```

The upload appears in App Store Connect after Apple processes it; it is not automatically released. Add it to a TestFlight group, test on a real iPhone, then complete privacy, review, and store metadata. The account enrollment choice, cost, D‑U‑N‑S requirements, TestFlight steps, and sign-in policy are in `docs/ios-release-checklist.md`.

## API tests

Integration tests run against a real PostgreSQL that has been migrated and seeded (they create and remove two throw-away users):

```powershell
cd "C:\Users\20231\Ocean Diary\services\api"
.\.venv\Scripts\python.exe -m pip install -r requirements-dev.txt
.\.venv\Scripts\python.exe -m pytest
```

## Product decisions

The first release supports photos only. Video analysis, maps, dive logs, community, and ocean decoration are out of MVP scope. AI suggestions are not definitive; users can search manually or save an unidentified discovery.

## Development-only media authentication

The upload API accepts the bearer value in `DEV_AUTH_TOKEN` only while `APP_ENV=development` and `DEV_AUTH_ENABLED=true`, mapping it to `DEV_AUTH_USER_ID`. This fixed token is a local integration aid, not user login. When `SUPABASE_URL` is configured, the development API can also verify real Supabase access tokens; production startup requires Supabase JWT verification settings and non-development object-storage credentials and rejects the `minioadmin` sample credentials. The account deletion endpoint removes the user's observations, identification jobs, MinIO objects, and Supabase Auth identity; configure `SUPABASE_SERVICE_ROLE_KEY` only on the API server. Never publish a development API or reuse local MinIO credentials for real user photos.





