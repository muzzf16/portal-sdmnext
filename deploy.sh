#!/bin/bash
# ============================================================
# Portal SDM - Deploy & Recovery Script
# Usage: ./deploy.sh [OPTIONS]
# ============================================================

# Exit immediately if a command exits with a non-zero status
set -e

# Configuration
PROJECT_ROOT="/opt/portal-sdmv3"
BACKUPS_DIR="$PROJECT_ROOT/backups"
TIMESTAMP=$(date +"%Y-%m-%dT%H-%M-%S")

# Functions for colorful output
log_info() { echo -e "\033[1;34m[INFO]\033[0m $1"; }
log_warn() { echo -e "\033[1;33m[WARN]\033[0m $1"; }
log_error() { echo -e "\033[1;31m[ERROR]\033[0m $1"; }
log_success() { echo -e "\033[1;32m[SUCCESS]\033[0m $1"; }

# Check working directory
if [ "$(pwd)" != "$PROJECT_ROOT" ]; then
    log_warn "Script did not run from $PROJECT_ROOT. Switching directory..."
    cd "$PROJECT_ROOT"
fi

# Print Warning
echo -e "\033[1;31m"
echo "=========================================================="
echo "      PERINGATAN OPERASIONAL & KESELAMATAN DATA           "
echo "=========================================================="
echo -e "\033[0m"
echo "1. Script ini akan melakukan backup database secara otomatis sebelum mematikan container."
echo "2. JANGAN PERNAH menyalin database lokal Anda sendiri langsung"
echo "   ke kontainer produksi karena dapat menimpa data transaksi."
echo "3. Gunakan migrasi skema untuk perubahan struktur tabel."
echo "==========================================================\n"

# Options
RESTART_SNAP=false
FORCE_KILL=false
RUN_MIGRATION=false

while [[ "$#" -gt 0 ]]; do
    case $1 in
        --restart-snap) RESTART_SNAP=true ;;
        --force-kill) FORCE_KILL=true ;;
        --run-migration) RUN_MIGRATION=true ;;
        -h|--help)
            echo "Portal SDM Deploy & Recovery Script"
            echo "==================================="
            echo "Usage: ./deploy.sh [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --force-kill     (Opsi 1) Cari PID container secara dinamis dan paksa matikan prosesnya di host"
            echo "  --restart-snap   (Opsi 2) Restart layanan Docker Snap sebelum melakukan rebuild"
            echo "  --run-migration  Jalankan migrasi skema database setelah kontainer menyala"
            exit 0
            ;;
        *) echo "Unknown parameter passed: $1"; exit 1 ;;
    esac
    shift
done

# ---- TAHAP 1: Backup Data Sebelum Tindakan ----
log_info "Memulai backup database SQLite sebelum perubahan..."
mkdir -p "$BACKUPS_DIR"

# Salin database dari container jika container berjalan
if docker ps --filter "name=portal_sdm_backend" --format "{{.Names}}" | grep -q "portal_sdm_backend"; then
    log_info "Kontainer backend aktif. Menyalin database..."
    BACKUP_FILE="$BACKUPS_DIR/db_backup_docker_${TIMESTAMP}.sqlite"
    if docker cp portal_sdm_backend:/data/database.sqlite "$BACKUP_FILE" 2>/dev/null; then
        log_success "Database berhasil disalin ke host: $BACKUP_FILE ($(stat -c%s "$BACKUP_FILE") bytes)"
    else
        log_warn "Gagal menyalin database menggunakan 'docker cp'. Mencoba backup lokal..."
    fi
else
    log_warn "Kontainer portal_sdm_backend tidak sedang berjalan. Melewati docker cp."
fi

# Jalankan script run_backup.js sebagai cadangan tambahan
if [ -f "$PROJECT_ROOT/scratch/run_backup.js" ]; then
    log_info "Menjalankan script backup sekunder..."
    node "$PROJECT_ROOT/scratch/run_backup.js" || log_warn "Gagal menjalankan scratch/run_backup.js"
fi

# ---- TAHAP 2: Hentikan Kontainer / Bersihkan Proses ----
if [ "$FORCE_KILL" = true ]; then
    log_info "Mencari PID container backend dan frontend secara dinamis..."
    
    # Mencari PID dari container docker inspect
    BACKEND_PID=$(docker inspect --format '{{.State.Pid}}' portal_sdm_backend 2>/dev/null || true)
    FRONTEND_PID=$(docker inspect --format '{{.State.Pid}}' portal_sdm_frontend 2>/dev/null || true)
    
    if [ ! -z "$BACKEND_PID" ] && [ "$BACKEND_PID" -gt 0 ]; then
        log_warn "Menemukan PID Backend di Host: $BACKEND_PID. Menghentikan paksa..."
        sudo kill -9 "$BACKEND_PID" 2>/dev/null || true
    fi
    
    if [ ! -z "$FRONTEND_PID" ] && [ "$FRONTEND_PID" -gt 0 ]; then
        log_warn "Menemukan PID Frontend di Host: $FRONTEND_PID. Menghentikan paksa..."
        sudo kill -9 "$FRONTEND_PID" 2>/dev/null || true
    fi
    
    # Hapus sisa-sisa kontainer yang terhenti paksa
    docker compose down --timeout 5 || true
fi

if [ "$RESTART_SNAP" = true ]; then
    log_warn "Melakukan restart pada Layanan Docker Snap..."
    sudo snap disable docker
    sudo snap enable docker
    log_success "Layanan Docker Snap berhasil dinyalakan ulang."
fi

# ---- TAHAP 3: Rebuild dan Jalankan ----
log_info "Menjalankan Docker Compose Build..."
docker compose up -d --build

# ---- TAHAP 4: Jalankan Migrasi Jika Dipilih ----
if [ "$RUN_MIGRATION" = true ]; then
    log_info "Menjalankan migrasi database..."
    sleep 3 # Tunggu kontainer siap
    docker cp apps/backend/run_migrations.js portal_sdm_backend:/app/run_migrations.js
    docker exec portal_sdm_backend node /app/run_migrations.js
    log_success "Migrasi selesai."
fi

# ---- TAHAP 5: Verifikasi Status ----
log_info "Memeriksa status kontainer..."
docker compose ps

log_success "Proses Deployment Selesai!"
