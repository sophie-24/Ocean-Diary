$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $PSScriptRoot
$apiRoot = Join-Path $projectRoot "services\api"
$python = Join-Path $apiRoot ".venv\Scripts\python.exe"
$requiredSchemaRevision = "0012_retire_legacy_upload_intents"
$apiBaseUrl = if ($env:OCEAN_DIARY_API_URL) { $env:OCEAN_DIARY_API_URL.TrimEnd('/') } else { "http://127.0.0.1:8765" }

if (-not (Test-Path -LiteralPath $python)) {
    throw "Python 가상환경을 찾을 수 없습니다: $python`n먼저 README.md의 API 준비 단계를 진행해 주세요."
}

try {
    $readiness = Invoke-RestMethod -Uri "$apiBaseUrl/v1/ready" -TimeoutSec 10
    if ($readiness.status -eq "ready" -and $readiness.database_schema -ne $requiredSchemaRevision) {
        $reportedRevision = if ([string]::IsNullOrWhiteSpace([string]$readiness.database_schema)) { "확인 불가" } else { [string]$readiness.database_schema }
        throw "API 응답의 DB schema revision이 최신 코드와 다릅니다 (현재 $reportedRevision, 필요 $requiredSchemaRevision). API를 최신 코드로 재시작한 뒤 확인해 주세요."
    }
    if ($readiness.status -ne "ready") {
        throw "API 준비 상태가 ready가 아닙니다."
    }
}
catch {
    $readinessDetails = $null
    if ($_.ErrorDetails.Message) {
        try { $readinessDetails = $_.ErrorDetails.Message | ConvertFrom-Json } catch { }
    }
    if ($readinessDetails.dependency -eq "database_schema") {
        throw "DB 마이그레이션이 부족합니다 (현재 $($readinessDetails.current_revision), 필요 $($readinessDetails.expected_revision)). 실행 중 API 창을 Ctrl+C로 종료하고 .\scripts\start-api.ps1 을 실행해 마이그레이션한 뒤 worker를 시작해 주세요."
    }
    throw "API/DB/MinIO가 준비되지 않았습니다. 먼저 .\scripts\start-api.ps1 을 실행해 주세요. 확인 주소: $apiBaseUrl/v1/ready`n원인: $($_.Exception.Message)"
}

Write-Host "API, PostgreSQL, MinIO 준비 확인: $apiBaseUrl"
Write-Host "식별 및 정리 worker를 시작합니다. 종료하려면 이 창에서 Ctrl+C를 누르세요."
Push-Location $apiRoot
try {
    & $python -m app.worker
    if ($LASTEXITCODE -ne 0) {
        throw "Worker가 종료 코드 $LASTEXITCODE 로 끝났습니다."
    }
}
finally {
    Pop-Location
}
