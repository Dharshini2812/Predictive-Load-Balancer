# Helper script to start MongoDB with correct PowerShell syntax
$mongoPath = "C:\Program Files\MongoDB\Server\8.2\bin\mongod.exe"
$dbPath = "C:\data\db"

if (-not (Test-Path $dbPath)) {
    Write-Host "Creating database directory at $dbPath..." -ForegroundColor Cyan
    New-Item -Path $dbPath -ItemType Directory -Force
}

Write-Host "Starting MongoDB..." -ForegroundColor Green
& $mongoPath --dbpath $dbPath
