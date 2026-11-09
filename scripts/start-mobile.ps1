param(
    [string]$ApiUrl,
    # Optional: force the PC address put in the Expo QR code (e.g. the hotspot adapter's IPv4).
    [string]$HostIp
)

$ErrorActionPreference = 'Stop'
$requiredSchemaRevision = '0013_v2_logbook'
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

# Phone-facing addresses are worked out automatically in development:
#  - the app swaps 127.0.0.1 for the address Expo Go used to reach this PC (Metro), and
#  - the API signs photo-upload URLs for the address the phone used (S3_PUBLIC_ENDPOINT_URL=auto).
# So a new hotspot/Wi-Fi IP only needs this script to be started again.
$lanAddresses = @()
try {
    $lanAddresses = @(Get-NetIPAddress -AddressFamily IPv4 -ErrorAction Stop |
        Where-Object { $_.AddressState -eq 'Preferred' -and $_.IPAddress -notmatch '^(127\.|169\.254\.)' } |
        Select-Object -ExpandProperty IPAddress)
} catch {
    $lanAddresses = @()
}
if ($HostIp) {
    $parsedHost = $null
    if (-not [System.Net.IPAddress]::TryParse($HostIp, [ref]$parsedHost)) {
        throw "-HostIp must be an IPv4 address such as 172.20.10.2. Current value: $HostIp"
    }
    $env:REACT_NATIVE_PACKAGER_HOSTNAME = $HostIp
    Write-Host "Expo QR code will use this PC address: $HostIp"
} elseif ($lanAddresses.Count -gt 0) {
    Write-Host "This PC's network addresses: $($lanAddresses -join ', ')"
    Write-Host 'If the QR code shows a different network than the phone is on, rerun with -HostIp <one of these>.'
}
if ($parsedApiUrl.IsLoopback) {
    Write-Host 'API URL is local (127.0.0.1); on the phone the app uses the same PC address as the Expo QR code.'
}

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
if ($publicStorageUrl -ne 'auto') {
    $parsedStorageUrl = $null
    if (-not [Uri]::TryCreate($publicStorageUrl, [UriKind]::Absolute, [ref]$parsedStorageUrl) -or $parsedStorageUrl.Scheme -notin @('http', 'https')) {
        throw 'S3_PUBLIC_ENDPOINT_URL must be auto or an absolute HTTP(S) URL. Check its value in the project-root .env.'
    }
    if ($parsedStorageUrl.IsLoopback) {
        Write-Warning 'S3_PUBLIC_ENDPOINT_URL points to 127.0.0.1, so photo upload will fail on a phone. Set S3_PUBLIC_ENDPOINT_URL=auto in the project-root .env and restart the API.'
    }
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
Write-Host 'Phone on the same Wi-Fi/hotspot: scan the QR code with the iPhone camera (Expo Go opens it).'
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
