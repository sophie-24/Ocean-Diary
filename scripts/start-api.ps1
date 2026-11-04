param(
    [int]$Port = 8765
)

$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $PSScriptRoot
$apiRoot = Join-Path $projectRoot "services\api"
$python = Join-Path $apiRoot ".venv\Scripts\python.exe"
$composeFile = Join-Path $projectRoot "infra\docker-compose.yml"
$requiredSchemaRevision = "0012_retire_legacy_upload_intents"
$projectEnvFile = Join-Path $projectRoot ".env"
$projectEnvExample = Join-Path $projectRoot ".env.example"

if (-not (Test-Path -LiteralPath $python)) {
    throw "Python 가상환경을 찾을 수 없습니다: $python`nREADME.md의 API 준비 단계를 먼저 진행해 주세요."
}
if (-not (Test-Path -LiteralPath $composeFile)) {
    throw "Docker Compose 파일을 찾을 수 없습니다: $composeFile"
}
if ($Port -lt 1 -or $Port -gt 65535) {
    throw "포트는 1~65535 사이여야 합니다. 입력한 값: $Port"
}
if (-not (Test-Path -LiteralPath $projectEnvFile)) {
    if (-not (Test-Path -LiteralPath $projectEnvExample)) {
        throw "환경 설정 예시 파일을 찾을 수 없습니다: $projectEnvExample"
    }
    Copy-Item -LiteralPath $projectEnvExample -Destination $projectEnvFile
    Write-Host "로컬 개발용 .env를 만들었습니다: $projectEnvFile"
    Write-Host "실제 기기 사진 업로드를 설정하기 전 S3_PUBLIC_ENDPOINT_URL을 이 PC LAN 주소로 바꾸고 API를 다시 시작하세요."
}

$listener = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue |
    Select-Object -First 1
$existingApiReady = $false
$existingApiHealthOk = $false
$readinessDetails = $null
if ($listener) {
    $owner = Get-Process -Id $listener.OwningProcess -ErrorAction SilentlyContinue
    $ownerName = if ($owner) { $owner.ProcessName } else { "확인할 수 없는 프로세스" }
    $apiBaseUrl = "http://127.0.0.1:$Port"
    try {
        $health = Invoke-RestMethod -Uri "$apiBaseUrl/v1/health" -TimeoutSec 3
        $existingApiHealthOk = $health.status -eq "ok"
        $readiness = Invoke-RestMethod -Uri "$apiBaseUrl/v1/ready" -TimeoutSec 5
        if ($existingApiHealthOk -and $readiness.status -eq "ready" -and $readiness.database_schema -eq $requiredSchemaRevision) {
            $existingApiReady = $true
            Write-Host "기존 API와 필수 저장소가 정상입니다: $apiBaseUrl"
            Write-Host "중복 실행은 건너뛰고 Docker와 최신 DB 마이그레이션을 확인합니다."
        } elseif ($existingApiHealthOk -and $readiness.status -eq "ready" -and -not $readiness.database_schema) {
            throw "포트 $Port 의 API는 준비 상태지만 구버전 응답이라 DB schema revision을 확인할 수 없습니다. API와 worker 창에서 각각 Ctrl+C로 종료한 뒤 이 스크립트를 다시 실행해 주세요."
        }
    }
    catch {
        if ($_.ErrorDetails.Message) {
            try { $readinessDetails = $_.ErrorDetails.Message | ConvertFrom-Json } catch { }
        }
    }
    if (-not $existingApiReady) {
        if ($existingApiHealthOk -and $readinessDetails.dependency -eq "database_schema") {
            throw "API는 응답하지만 DB 마이그레이션이 부족합니다 (현재 $($readinessDetails.current_revision), 필요 $($readinessDetails.expected_revision)). 실행 중인 API와 worker 창에서 각각 Ctrl+C로 종료한 뒤 이 스크립트를 다시 실행해 주세요. migration이 대기를 안내하면 기존 UPLOAD_INTENT_TTL_SECONDS 설정을 유지하고 표시된 시간 뒤 재실행하세요."
        }
        throw "포트 $Port 를 이미 사용 중입니다 (PID $($listener.OwningProcess), $ownerName). 해당 포트에서 정상 API 응답을 확인하지 못했습니다. API를 실행한 창에서 Ctrl+C로 종료한 뒤 다시 실행하거나, 다른 포트를 선택하세요 (예: .\scripts\start-api.ps1 -Port 8766)."
    }
}

Push-Location $projectRoot
try {
    Write-Host "[1/4] PostgreSQL과 MinIO를 시작합니다."
    & docker compose -f $composeFile up -d postgres minio minio-init
    if ($LASTEXITCODE -ne 0) { throw "Docker Compose 실행에 실패했습니다. Docker Desktop 상태를 확인해 주세요." }

    Write-Host "[2/4] PostgreSQL 준비를 기다립니다."
    $databaseReady = $false
    for ($attempt = 0; $attempt -lt 30; $attempt++) {
        $containerIdOutput = & docker compose -f $composeFile ps -q postgres
        $composeExitCode = $LASTEXITCODE
        $containerId = if ($null -eq $containerIdOutput) { "" } else { (@($containerIdOutput) -join "`n").Trim() }
        if ($composeExitCode -eq 0 -and $containerId) {
            $health = [string](& docker inspect --format '{{.State.Health.Status}}' $containerId 2>$null)
            $inspectExitCode = $LASTEXITCODE
            $health = if ($null -eq $health) { "" } else { $health.Trim() }
            if ($inspectExitCode -eq 0 -and $health -eq "healthy") {
                $databaseReady = $true
                break
            }
        }
        Start-Sleep -Seconds 2
    }
    if (-not $databaseReady) {
        & docker compose -f $composeFile ps -a
        throw "PostgreSQL이 60초 안에 healthy 상태가 되지 않았습니다. 위 컨테이너 상태를 확인해 주세요."
    }

    Write-Host "MinIO 사진 저장소 초기화를 기다립니다."
    $mediaReady = $false
    for ($attempt = 0; $attempt -lt 30; $attempt++) {
        # minio-init is a one-shot container, so it may already have exited successfully.
        $initContainerIdOutput = & docker compose -f $composeFile ps --all --quiet minio-init
        $composeExitCode = $LASTEXITCODE
        $initContainerId = if ($null -eq $initContainerIdOutput) { "" } else { (@($initContainerIdOutput) -join "`n").Trim() }
        if ($composeExitCode -eq 0 -and $initContainerId) {
            $initState = [string](& docker inspect --format '{{.State.Status}} {{.State.ExitCode}}' $initContainerId 2>$null)
            $inspectExitCode = $LASTEXITCODE
            $initState = if ($null -eq $initState) { "" } else { $initState.Trim() }
            if ($inspectExitCode -eq 0 -and $initState -eq "exited 0") {
                $mediaReady = $true
                break
            }
            if ($initState -match '^exited (?!0)') {
                & docker compose -f $composeFile logs --no-color --tail 30 minio-init
                throw "MinIO 버킷 초기화에 실패했습니다. 위 로그를 확인해 주세요."
            }
        }
        Start-Sleep -Seconds 2
    }
    if (-not $mediaReady) {
        & docker compose -f $composeFile ps -a
        & docker compose -f $composeFile logs --no-color --tail 20 minio-init
        throw "MinIO 버킷 초기화가 60초 안에 끝나지 않았습니다. 위 컨테이너와 로그를 확인해 주세요."
    }

    Push-Location $apiRoot
    try {
        Write-Host "[3/4] 최신 DB 마이그레이션과 종 카탈로그를 적용합니다."
        & $python -m alembic upgrade head
        if ($LASTEXITCODE -ne 0) { throw "DB 마이그레이션에 실패했습니다." }
        & $python -m app.seed_species
        if ($LASTEXITCODE -ne 0) { throw "종 카탈로그 시드에 실패했습니다." }

        if ($existingApiReady) {
            $listenerNow = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue |
                Select-Object -First 1
            if ($listenerNow) {
                Write-Host "[4/4] DB 준비가 끝났습니다. 기존 API는 그대로 실행 중이라 새 프로세스는 시작하지 않았습니다."
                Write-Host "최신 앱 코드를 확실히 적용하려면 기존 API 창에서 Ctrl+C로 종료한 뒤 이 스크립트를 다시 실행하세요."
                return
            }
        }

        Write-Host "[4/4] API를 시작합니다: http://127.0.0.1:$Port"
        Write-Host "종료하려면 이 창에서 Ctrl+C를 누르세요."
        & $python -m uvicorn app.main:app --reload --host 0.0.0.0 --port $Port
        if ($LASTEXITCODE -ne 0) { throw "API가 종료 코드 $LASTEXITCODE 로 끝났습니다." }
    }
    finally {
        Pop-Location
    }
}
finally {
    Pop-Location
}
