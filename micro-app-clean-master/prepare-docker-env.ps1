$ErrorActionPreference = "Stop"
$root = $PSScriptRoot
Set-Location $root

Write-Host "=== Prepare .env files for Docker Compose ===" -ForegroundColor Cyan

$services = @("auth", "tickets", "orders", "payments", "expiration")
foreach ($s in $services) {
    $envPath = Join-Path $root "$s\.env"
    $exPath = Join-Path $root "$s\.env.example"
    if (-not (Test-Path $envPath)) {
        if (-not (Test-Path $exPath)) {
            Write-Warning "Missing $exPath - create $s/.env manually."
            continue
        }
        Copy-Item $exPath $envPath
        $msg = "Created {0}/.env - edit MONGO_URI and JWT_KEY. payments needs STRIPE_KEY." -f $s
        Write-Host $msg -ForegroundColor Green
    } else {
        Write-Host ("{0}/.env already exists - skipped" -f $s)
    }
}

Write-Host ""
Write-Host "Important:" -ForegroundColor Yellow
Write-Host "  1. Edit each .env: paste your MongoDB Atlas mongodb+srv URI."
Write-Host "  2. Use the SAME JWT_KEY in auth, tickets, orders, payments."
Write-Host "  3. Atlas - Network Access: add 0.0.0.0/0 or your current IP."
Write-Host "  4. Docker Desktop: wait until the engine is running, then: docker compose up --build"
Write-Host ""
