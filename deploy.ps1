# ============================================================
# Portal SDM - Deploy Script
# Usage: .\deploy.ps1 [-SkipFrontend] [-SkipBackend] [-RunMigration] [-Logs]
# ============================================================
param(
    [switch]$SkipFrontend,
    [switch]$SkipBackend,
    [switch]$RunMigration,
    [switch]$Logs,
    [switch]$CheckDb,
    [switch]$Help
)

$ErrorActionPreference = "Stop"

function Write-Header($msg) {
    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host " $msg" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
}

function Write-Step($msg) {
    Write-Host "  → $msg" -ForegroundColor Yellow
}

function Write-Ok($msg) {
    Write-Host "  ✓ $msg" -ForegroundColor Green
}

function Write-Err($msg) {
    Write-Host "  ✗ $msg" -ForegroundColor Red
}

# Show help
if ($Help) {
    Write-Host @"

Portal SDM Deploy Script
========================
Usage: .\deploy.ps1 [OPTIONS]

Options:
  -SkipFrontend    Skip rebuilding frontend container
  -SkipBackend     Skip rebuilding backend container
  -RunMigration    Run database migrations after deploy
  -CheckDb         Run database health check after deploy
  -Logs            Show container logs after deploy
  -Help            Show this help message

Examples:
  .\deploy.ps1                          # Full deploy (backend + frontend)
  .\deploy.ps1 -SkipFrontend            # Deploy backend only
  .\deploy.ps1 -RunMigration -CheckDb   # Full deploy + migration + DB check
  .\deploy.ps1 -Logs                    # Full deploy + show logs

"@
    exit 0
}

# ---- STEP 1: Git Pull ----
Write-Header "Step 1: Git Pull"
Write-Step "Pulling latest code..."
try {
    $gitOutput = git pull 2>&1
    Write-Host $gitOutput
    Write-Ok "Git pull complete"
} catch {
    Write-Err "Git pull failed: $_"
    exit 1
}

# ---- STEP 2: Build & Restart Containers ----
Write-Header 'Step 2: Docker Build and Restart'

$services = @()
if (-not $SkipBackend) { $services += "backend" }
if (-not $SkipFrontend) { $services += "sdm" }

if ($services.Count -eq 0) {
    Write-Step "All services skipped"
} else {
    $serviceList = $services -join " "
    Write-Step "Building: $serviceList"
    docker-compose up -d --build @services
    if ($LASTEXITCODE -ne 0) {
        Write-Err "Docker build failed!"
        exit 1
    }
    Write-Ok "Containers built and started"
}

# ---- STEP 3: Run Migrations (optional) ----
if ($RunMigration) {
    Write-Header "Step 3: Database Migration"
    Write-Step "Running migrations in container..."
    
    # Copy latest migration runner
    docker cp apps/backend/run_migrations.js portal_sdm_backend:/app/run_migrations.js
    docker exec portal_sdm_backend node /app/run_migrations.js
    
    if ($LASTEXITCODE -ne 0) {
        Write-Err "Migration failed!"
    } else {
        Write-Ok "Migration complete"
    }
}

# ---- STEP 4: DB Health Check (optional) ----
if ($CheckDb) {
    Write-Header "Step 4: Database Health Check"
    Write-Step "Running health check..."
    
    docker cp apps/backend/scripts/check_db.js portal_sdm_backend:/app/check_db.js
    docker exec portal_sdm_backend node /app/check_db.js
    
    if ($LASTEXITCODE -ne 0) {
        Write-Err "DB health check found issues!"
    } else {
        Write-Ok "Database is healthy"
    }
}

# ---- STEP 5: Status & Logs ----
Write-Header "Container Status"
docker-compose ps

if ($Logs) {
    Write-Header "Recent Logs (backend)"
    docker logs portal_sdm_backend --tail 20
    Write-Header "Recent Logs (frontend)"
    docker logs portal_sdm_frontend --tail 10
}

Write-Host ""
Write-Ok 'Deploy complete!'
Write-Host ""
