param(
    [string]$ApiUrl
)

$ErrorActionPreference = 'Stop'
$requiredSchemaRevision = '0012_retire_legacy_upload_intents'
$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$mobileRoot = Join-Path $projectRoot 'apps\mobile'
$mobileEnv = Join-Path $mobileRoot '.env'
$apiUrlWasProvided = $PSBoundParameters.ContainsKey('ApiUrl')

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    throw 'Node.js and npm are required. Install Node.js 22 LTS, reopen PowerShell, and retry.'
}

if (-not (Test-Path $mobileEnv)) {
    Copy-Item (Join-Path $mobileRoot '.env.example') $mobileEnv
    Write-Host 'Created apps\mobile\.env from the local-development example.'
}

if (-not $ApiUrl) {
    $apiLine = Get-Content $mobileEnv | Where-Object { $_ -match '^\s*EXPO_PUBLIC_API_URL\s*=' } | Select-Object -First 1
    if ($apiLine -match '^\s*EXPO_PUBLIC_API_URL\s*=\s*(.+?)\s*$') {
        $ApiUrl = $Matches[1].Trim().Trim([char[]]@('"', "'"))
    }
}

if (-not $ApiUrl) {
    throw 'EXPO_PUBLIC_API_URL is missing from apps\mobile\.env.'
}

$parsedApiUrl = $null
if (-not [Uri]::TryCreate($ApiUrl, [UriKind]::Absolute, [ref]$parsedApiUrl) -or $parsedApiUrl.Scheme -notin @('http', 'https')) {
    throw "EXPO_PUBLIC_API_URL must be an absolute HTTP or HTTPS URL. Current value: $ApiUrl"
}

if ($parsedApiUrl.IsLoopback -and -not $apiUrlWasProvided) {
    try {
        $lanAddress = Get-NetRoute -DestinationPrefix '0.0.0.0/0' -ErrorAction Stop |
            Sort-Object RouteMetric, InterfaceMetric |
            ForEach-Object {
                Get-NetIPAddress -AddressFamily IPv4 -InterfaceIndex $_.InterfaceIndex -ErrorAction SilentlyContinue |
                    Where-Object { $_.AddressState -eq 'Preferred' -and $_.IPAddress -notmatch '^(127\.|169\.254\.)' } |
                    Select-Object -First 1 -ExpandProperty IPAddress
            } |
            Select-Object -First 1
    } catch {
        $lanAddress = $null
    }
    if (-not $lanAddress) {
        throw 'The mobile API URL points to this PC only, and Windows could not find a LAN IPv4 address. Run this again with -ApiUrl "http://<PC-LAN-IPv4>:8765".'
    }

    $apiUrlBuilder = [UriBuilder]::new($parsedApiUrl)
    $apiUrlBuilder.Host = $lanAddress
    $ApiUrl = $apiUrlBuilder.Uri.AbsoluteUri.TrimEnd('/')
    Write-Host "The default API URL was local-only. Using this PC LAN address for Expo Go: $ApiUrl"
} elseif ($parsedApiUrl.IsLoopback) {
    throw 'Expo Go on a physical phone cannot reach 127.0.0.1 on this PC. Pass this PC LAN address with -ApiUrl, for example -ApiUrl "http://192.168.0.10:8765".'
}
$parsedApiUrl = [Uri]$ApiUrl

# Presigned MinIO URLs are opened by the phone directly, so localhost in this setting
# points at the phone itself. Check only this endpoint value; never print .env secrets.
$publicStorageUrl = $env:S3_PUBLIC_ENDPOINT_URL
if (-not $publicStorageUrl) {
    $projectEnv = Join-Path $projectRoot '.env'
    $storageLine = if (Test-Path $projectEnv) {
        Get-Content $projectEnv | Where-Object { $_ -match '^\s*S3_PUBLIC_ENDPOINT_URL\s*=' } | Select-Object -First 1
    }
    if ($storageLine -match '^\s*S3_PUBLIC_ENDPOINT_URL\s*=\s*(.+?)\s*$') {
        $publicStorageUrl = $Matches[1].Trim().Trim([char[]]@('"', "'"))
    } else {
        $publicStorageUrl = 'http://127.0.0.1:9000'
    }
}
$parsedStorageUrl = $null
if (-not [Uri]::TryCreate($publicStorageUrl, [UriKind]::Absolute, [ref]$parsedStorageUrl) -or $parsedStorageUrl.Scheme -notin @('http', 'https')) {
    throw 'S3_PUBLIC_ENDPOINT_URL must be an absolute HTTP or HTTPS URL. Check its value in the project-root .env.'
}
if ($parsedStorageUrl.IsLoopback -and -not $parsedApiUrl.IsLoopback) {
    throw 'S3_PUBLIC_ENDPOINT_URL still points to this PC local-only address. Set it in the project-root .env to http://<PC-LAN-IPv4>:9000, keep S3_ENDPOINT_URL at 127.0.0.1 for the API, then restart the API before connecting a phone.'
}

Write-Host "Checking API readiness at $ApiUrl/v1/ready ..."
try {
    $ready = Invoke-RestMethod -Uri "$($ApiUrl.TrimEnd('/'))/v1/ready" -TimeoutSec 5
    if ($ready.status -eq 'ready' -and $ready.database_schema -ne $requiredSchemaRevision) {
        $reportedRevision = if ([string]::IsNullOrWhiteSpace([string]$ready.database_schema)) { 'unknown' } else { [string]$ready.database_schema }
        throw "The API is using an older response or database schema (current: $reportedRevision, required: $requiredSchemaRevision). Restart it with .\scripts\start-api.ps1, then retry."
    }
    if ($ready.status -ne 'ready') {
        throw 'The API returned a response, but it is not ready.'
    }
} catch {
    $detail = $_.ErrorDetails.Message
    if ($detail -match 'database_schema') {
        throw "Database schema is behind the API code. Stop the API and restart it with .\scripts\start-api.ps1, then retry. Details: $detail"
    }
    throw "The API is not ready at $ApiUrl. Start it with .\scripts\start-api.ps1 and check that this URL is reachable from the phone. Details: $detail"
}

if (-not (Test-Path (Join-Path $mobileRoot 'node_modules'))) {
    throw 'Mobile packages are not installed. Run npm install in apps\mobile, then retry.'
}

Write-Host 'API is ready. Starting Expo with LAN access; scan its QR code in Expo Go.'
Write-Host "The app will use API URL: $($ApiUrl.TrimEnd('/'))"
Write-Host 'For a physical phone, use this PC LAN IPv4 address and set S3_PUBLIC_ENDPOINT_URL in the project-root .env to the same host before restarting the API.'
$previousMobileApiUrl = $env:EXPO_PUBLIC_API_URL
$env:EXPO_PUBLIC_API_URL = $ApiUrl.TrimEnd('/')
Push-Location $mobileRoot
try {
    npm run start -- --host lan
    if ($LASTEXITCODE -ne 0) {
        throw "Expo exited with code $LASTEXITCODE."
    }
} finally {
    Pop-Location
    if ([string]::IsNullOrWhiteSpace($previousMobileApiUrl)) {
        Remove-Item Env:EXPO_PUBLIC_API_URL -ErrorAction SilentlyContinue
    } else {
        $env:EXPO_PUBLIC_API_URL = $previousMobileApiUrl
    }
}
