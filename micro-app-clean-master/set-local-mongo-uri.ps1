$ErrorActionPreference = "Stop"
$root = $PSScriptRoot
Set-Location $root

$map = @{
    "auth/.env"        = "mongodb://mongo:27017/auth"
    "tickets/.env"     = "mongodb://mongo:27017/tickets"
    "orders/.env"      = "mongodb://mongo:27017/orders"
    "payments/.env"    = "mongodb://mongo:27017/payments"
    "expiration/.env"  = "mongodb://mongo:27017/expiration"
}

foreach ($rel in $map.Keys) {
    $path = Join-Path $root $rel
    if (-not (Test-Path $path)) {
        Write-Warning "Fichier manquant: $path — exécute d'abord prepare-docker-env.ps1"
        continue
    }
    $uri = $map[$rel]
    $lines = Get-Content $path -Raw
    if ($lines -match "(?m)^MONGO_URI=.*$") {
        $lines = $lines -replace "(?m)^MONGO_URI=.*$", "MONGO_URI=$uri"
    } else {
        $lines = $lines.TrimEnd() + "`nMONGO_URI=$uri`n"
    }
    Set-Content -Path $path -Value $lines.TrimEnd() -NoNewline
    Write-Host "Mis à jour $rel -> $uri" -ForegroundColor Green
}

Write-Host "`nRelance: docker compose down && docker compose up --build" -ForegroundColor Cyan
