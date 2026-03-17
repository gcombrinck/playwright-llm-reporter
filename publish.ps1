param(
    [switch]$SkipTests,
    [switch]$Yes
)

# Helper script to publish @gcombrinck/playwright-llm-reporter to the npm registry.
#
# Usage (from repo root in PowerShell):
#   .\publish.ps1
#   .\publish.ps1 -SkipTests
#   .\publish.ps1 -Yes
#
# Requirements:
#   - Node.js + npm
#   - npm login with publish rights for the @gcombrinck scope

$ErrorActionPreference = 'Stop'

# 1. Move to script directory (repo root)
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
Set-Location $ScriptDir

Write-Host "==> Publishing from: $ScriptDir"

# 2. Basic tooling checks
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Error "node is not installed or not on PATH."
}

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Error "npm is not installed or not on PATH."
}

$nodeVersion = node -v
$npmVersion = npm -v
Write-Host "Node version: $nodeVersion"
Write-Host "npm version:  $npmVersion"

# 3. Show current package name and version
$pkgJson = Get-Content -Raw -Path "$ScriptDir\package.json" | ConvertFrom-Json
$pkgName = $pkgJson.name
$pkgVersion = $pkgJson.version

Write-Host "Package: $pkgName"
Write-Host "Version: $pkgVersion"

if ($pkgName -ne '@gcombrinck/playwright-llm-reporter') {
    Write-Warning "Package name in package.json is '$pkgName', expected '@gcombrinck/playwright-llm-reporter'."
}

# 4. Confirm before publishing (unless -Yes)
if (-not $Yes) {
    $response = Read-Host "Proceed to publish $pkgName@$pkgVersion to npm? [y/N]"
    if (-not $response -or ($response.ToLower() -ne 'y')) {
        Write-Host "Aborted by user."
        exit 0
    }
}

# 5. Install dependencies
Write-Host "==> Installing dependencies (npm install)"
npm install

# 6. Run tests (unless skipped)
if (-not $SkipTests) {
    Write-Host "==> Running tests (npm test)"
    npm test
} else {
    Write-Host "==> Skipping tests (per -SkipTests)"
}

# 7. Build the project
Write-Host "==> Building project (npm run build)"
npm run build

# 8. Inspect package contents
Write-Host "==> Inspecting package contents (npm pack --dry-run)"
npm pack --dry-run

Write-Host "==> If the above file list looks correct, publishing..."

# 9. Publish to npm (scoped package, public access)
npm publish --access public

Write-Host "==> Publish complete: $pkgName@$pkgVersion"
