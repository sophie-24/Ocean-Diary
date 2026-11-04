# OCEAN DIARY

Monorepo for OCEAN DIARY. **v2 is in progress** (iOS first, then Android): five tabs — 홈 · 도감 · 발견 · 로그북 · 나의 바다 — rebuilt from the design canvas. See `docs/plan-v2.md` for decisions, routes, data model and phases; it supersedes the v1 scope notes below.

## Workspace

- `apps/mobile`: Expo + React Native mobile app (expo-router tabs in `app/`, v1 flow kept in `src/legacy/LegacyApp.tsx` until it is ported)
- `services/api`: FastAPI backend
- `services/api/app/worker.py`: asynchronous identification and retryable cleanup worker
- `infra`: local PostgreSQL and MinIO setup
- `docs`: product and API contracts

## Product documents

- `docs/plan-v2.md`: v2 decisions, screen-to-route map, data model and delivery phases
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

   For a physical phone, set `EXPO_PUBLIC_API_URL` in `apps/mobile/.env` and `S3_PUBLIC_ENDPOINT_URL` in the project root `.env` to the computer's LAN IPv4 address instead of `127.0.0.1`. Restart the API after changing its `.env` value. The storage value format is S3_PUBLIC_ENDPOINT_URL=http://<PC-LAN-IPv4>:9000; keep S3_ENDPOINT_URL=http://127.0.0.1:9000 so the API can reach MinIO locally.

To view the current service screens in a desktop browser, run the preview on your Windows PC in a separate PowerShell window. A `localhost` URL from a Codex-managed process is private to that process and will not open in the desktop browser.

```powershell
cd "C:\Users\20231\Ocean Diary"
.\scripts\start-mobile-preview.ps1
```

The helper uses `EXPO_PUBLIC_API_URL` from `apps/mobile/.env` (default `http://127.0.0.1:8765`) and opens the web preview at `http://localhost:8081`. Keep this PowerShell window open while viewing the app. If the API uses a different address, pass it directly, for example `.\scripts\start-mobile-preview.ps1 -ApiUrl "http://127.0.0.1:8766"`. If Metro still shows an error from an older bundle, stop it with Ctrl+C and restart once with `.\scripts\start-mobile-preview.ps1 -ClearCache`. In development, the API accepts browser requests only from Expo's HTTP loopback origins on ports 8080–8089 and 19006. This uses the same React Native screens through React Native Web; it is a layout and interaction preview, not a substitute for Android/iOS device checks. Browser-preview photo drafts remain in memory and do not survive a page reload; browser sign-in sessions use tab-scoped `sessionStorage`. Native mobile drafts and sign-in sessions continue to use the device's private temporary and secure storage. Without Supabase configuration the public catalog can be previewed, while account-only actions require authentication settings.

   To enable real email-code login, set `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in `apps/mobile/.env`, and set the matching `SUPABASE_URL` in the project-root `.env`. In the Supabase email template, include the one-time code variable `{{ .Token }}`; the app verifies that code and stores the session for later launches. Set `SUPABASE_ACCESS_TOKEN_MAX_AGE_SECONDS` to the project's maximum JWT lifetime; longer-lived access tokens are rejected, and completed account-deletion tombstones are kept until that lifetime has passed. The mobile publishable/anon key is intended for client use; never put a service-role key in an `EXPO_PUBLIC_` variable. To support in-app account deletion, set the server-only `SUPABASE_SERVICE_ROLE_KEY` in the project-root `.env`. Without Supabase values, local development continues to use the fixed development token.

For a shorter day-to-day launch, use a fourth PowerShell window at the project root:

```powershell
cd "C:\Users\20231\Ocean Diary"
.\scripts\start-mobile.ps1
```

This helper checks `/v1/ready` before starting Expo on the local network and gives a focused message when the API or database migration is not ready. On a physical phone, set `S3_PUBLIC_ENDPOINT_URL` in the project-root `.env` to the PC's LAN IPv4 address and restart the API so signed photo-upload URLs are reachable from the phone. Then run `.\scripts\start-mobile.ps1 -ApiUrl "http://<PC-LAN-IPv4>:8765"`; the helper passes that same URL into the Expo app bundle. You can instead put the LAN URL in `apps/mobile/.env` and run the helper without an argument. It automatically replaces a loopback API default with the PC LAN IPv4 selected by Windows; use -ApiUrl to override the selected address.

Native build identifiers are provisionally set to `com.oceandiary.app` on Android and iOS. Confirm that these identifiers are available and owned by the publisher before creating store listings; changing them after release creates a different installed app.

The initial launcher icon and splash image are a provisional storybook fish-and-field-notebook mark at `apps/mobile/assets/icon.png`; Android uses a separate transparent adaptive foreground in `apps/mobile/assets/adaptive-icon.png` to stay inside launcher mask safe bounds. Replace or approve the mark with the final brand before store submission.

The main MVP code path is implemented through photo upload, asynchronous identification, candidate/manual selection, and private discovery storage. Real-device walkthroughs, production Supabase setup, biological review of the illustrations, and field evaluation of AI accuracy remain release gates; their current status is tracked in `docs/todo.md`.

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

## Product decisions

The first release supports photos only. Video analysis, maps, dive logs, community, and ocean decoration are out of MVP scope. AI suggestions are not definitive; users can search manually or save an unidentified discovery.

## Development-only media authentication

The upload API accepts the bearer value in `DEV_AUTH_TOKEN` only while `APP_ENV=development` and `DEV_AUTH_ENABLED=true`, mapping it to `DEV_AUTH_USER_ID`. This fixed token is a local integration aid, not user login. When `SUPABASE_URL` is configured, the development API can also verify real Supabase access tokens; production startup requires Supabase JWT verification settings and non-development object-storage credentials and rejects the `minioadmin` sample credentials. The account deletion endpoint removes the user's observations, identification jobs, MinIO objects, and Supabase Auth identity; configure `SUPABASE_SERVICE_ROLE_KEY` only on the API server. Never publish a development API or reuse local MinIO credentials for real user photos.





