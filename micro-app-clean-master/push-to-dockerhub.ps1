$ErrorActionPreference = "Stop"
$root = $PSScriptRoot
Set-Location $root

$user = $env:DOCKERHUB_USER
if (-not $user) {
    $user = Read-Host "Docker Hub username (or set env DOCKERHUB_USER)"
}
if (-not $user) {
    throw "DOCKERHUB_USER is required."
}

$tag = if ($env:IMAGE_TAG) { $env:IMAGE_TAG } else { "latest" }

Write-Host "Logging in to Docker Hub (if needed): docker login" -ForegroundColor Cyan
docker login

$map = @(
    @{ dir = "auth";        image = "micro-app-auth" }
    @{ dir = "tickets";    image = "micro-app-tickets" }
    @{ dir = "orders";     image = "micro-app-orders" }
    @{ dir = "payments";   image = "micro-app-payments" }
    @{ dir = "expiration"; image = "micro-app-expiration" }
    @{ dir = "client";     image = "micro-app-client" }
)

foreach ($m in $map) {
    $full = "{0}/{1}:{2}" -f $user, $m.image, $tag
    Write-Host "`nBuilding $full from ./$($m.dir) ..." -ForegroundColor Yellow
    docker build -t $full "./$($m.dir)"
    Write-Host "Pushing $full ..." -ForegroundColor Green
    docker push $full
}

Write-Host "`nDone. On another PC (after copying .env files):" -ForegroundColor Cyan
Write-Host ('  $env:DOCKERHUB_USER="{0}"' -f $user)
Write-Host "  docker compose -f docker-compose.hub.yml pull"
Write-Host "  docker compose -f docker-compose.hub.yml up -d"
