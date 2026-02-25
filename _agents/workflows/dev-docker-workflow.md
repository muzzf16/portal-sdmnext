---
description: How to develop locally and deploy to Docker
---

# Development & Deploy Workflow (Lokal → Docker)

// turbo-all

## Architecture Overview

```
Lokal (Windows)                    Docker Desktop
┌─────────────────┐               ┌──────────────────────┐
│ apps/backend/   │  git push     │ portal_sdm_backend   │
│   src/ (TS)     │ ──────────►   │   dist/ (compiled)   │
│   database.sqlite│              │   /data/database.sqlite│ ← Docker Volume
│                 │               │                      │
│ apps/frontend/  │  git push     │ portal_sdm_frontend  │
│   src/ (React)  │ ──────────►   │   nginx + dist/      │
└─────────────────┘               └──────────────────────┘
```

> **PENTING**: Database lokal (`apps/backend/database.sqlite`) dan database Docker (`/data/database.sqlite`) adalah file terpisah. Schema dan data bisa berbeda!

## Daily Development Flow

### 1. Develop Locally
```powershell
# Terminal 1: Backend
cd apps/backend
npm run dev

# Terminal 2: Frontend
cd apps/frontend
npm run dev
```

### 2. Test Locally
- Open `http://localhost:5173`
- Backend API: `http://localhost:3333/api`

### 3. Deploy to Docker
```powershell
# From project root (d:\portal-sdmv3)

# Full deploy (backend + frontend)
.\deploy.ps1

# Backend only (faster, skip frontend rebuild)
.\deploy.ps1 -SkipFrontend

# Deploy + run migrations + health check
.\deploy.ps1 -RunMigration -CheckDb

# Deploy + show logs
.\deploy.ps1 -Logs
```

## Database Management

### Schema Differences
Database lokal dan Docker bisa punya schema berbeda karena:
- Tabel dibuat manual / via script berbeda
- Migration file tidak selalu dijalankan di Docker
- `CREATE TABLE IF NOT EXISTS` tidak mengubah tabel yang sudah ada

### Before Changing Queries
Selalu cek schema aktual di Docker sebelum mengubah repository code:
```powershell
# Copy check script & run
docker cp apps/backend/scripts/check_db.js portal_sdm_backend:/app/check_db.js
docker exec portal_sdm_backend node /app/check_db.js
```

### Run Migrations in Docker
```powershell
docker cp apps/backend/run_migrations.js portal_sdm_backend:/app/run_migrations.js
docker exec portal_sdm_backend node /app/run_migrations.js
```

### Fix NULL Primary Keys
```powershell
docker exec portal_sdm_backend node /app/check_db.js --fix
```

### Sync Local DB to Docker (DESTRUCTIVE)
```powershell
# ⚠️ This REPLACES Docker DB with local DB!
docker cp apps/backend/database.sqlite portal_sdm_backend:/data/database.sqlite
docker restart portal_sdm_backend
```

## Adding New Migration

1. Create SQL file in `apps/backend/db/migrations/` with naming convention:
   ```
   YYYYMMDD_description.sql
   ```

2. Use `CREATE TABLE IF NOT EXISTS` for new tables

3. For seed data, migration runner will auto-skip if table has data

4. Test locally first:
   ```powershell
   cd apps/backend
   node run_migrations.js  # Uses local DB
   ```

5. Deploy with migration:
   ```powershell
   .\deploy.ps1 -RunMigration -CheckDb
   ```

## Troubleshooting

### "Cannot find column X"
Schema mismatch. Check actual Docker schema:
```powershell
docker exec portal_sdm_backend node /app/check_db.js
```

### "DELETE /api/.../null"
NULL primary keys in DB. Fix:
```powershell
docker exec portal_sdm_backend node /app/check_db.js --fix
```

### Need to see Docker logs
```powershell
docker logs portal_sdm_backend --tail 50
docker logs portal_sdm_frontend --tail 50
```
