param(
    [string]$ApiUrl,
    [switch]$ClearCache
)

$ErrorActionPreference = 'Stop'
$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$mobileRoot = Join-Path $projectRoot 'apps\mobile'
$mobileEnv = Join-Path $mobileRoot '.env'

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
    throw 'EXPO_PUBLIC_API_URL is missing from apps\mobile\.env. Pass -ApiUrl "http://127.0.0.1:8765" or add it to that file.'
}

$parsedApiUrl = $null
if (-not [Uri]::TryCreate($ApiUrl, [UriKind]::Absolute, [ref]$parsedApiUrl) -or $parsedApiUrl.Scheme -notin @('http', 'https')) {
    throw "EXPO_PUBLIC_API_URL must be an absolute HTTP or HTTPS URL. Current value: $ApiUrl"
}

if (-not (Test-Path (Join-Path $mobileRoot 'node_modules'))) {
    throw 'Mobile packages are not installed. Run npm install in apps\mobile, then retry.'
}

$previousMobileApiUrl = $env:EXPO_PUBLIC_API_URL
$previousExpoHome = $env:__UNSAFE_EXPO_HOME_DIRECTORY
$previousNoTelemetry = $env:EXPO_NO_TELEMETRY
$env:EXPO_PUBLIC_API_URL = $ApiUrl.TrimEnd('/')
$env:__UNSAFE_EXPO_HOME_DIRECTORY = Join-Path $mobileRoot '.tmp-expo-home'
$env:EXPO_NO_TELEMETRY = '1'

Write-Host 'Starting the Ocean Diary web preview on this PC.'
Write-Host 'Expo will open the browser at http://localhost:8081 when available.'
Write-Host "The app will use API URL: $($ApiUrl.TrimEnd('/'))"
if ($ClearCache) {
    Write-Host 'Clearing the Metro/Expo bundle cache before startup.'
}
Write-Host 'Keep this PowerShell window open while viewing the app; press Ctrl+C to stop the preview.'

Push-Location $mobileRoot
try {
    if ($ClearCache) {
        npm run preview:web -- --clear
    } else {
        npm run preview:web
    }
    if ($LASTEXITCODE -ne 0) {
        throw "Expo web preview exited with code $LASTEXITCODE."
    }
} finally {
    Pop-Location
    foreach ($setting in @(
        @{ Name = 'EXPO_PUBLIC_API_URL'; Value = $previousMobileApiUrl },
        @{ Name = '__UNSAFE_EXPO_HOME_DIRECTORY'; Value = $previousExpoHome },
        @{ Name = 'EXPO_NO_TELEMETRY'; Value = $previousNoTelemetry }
    )) {
        if ([string]::IsNullOrWhiteSpace($setting.Value)) {
            Remove-Item "Env:$($setting.Name)" -ErrorAction SilentlyContinue
        } else {
            Set-Item "Env:$($setting.Name)" $setting.Value
        }
    }
}
