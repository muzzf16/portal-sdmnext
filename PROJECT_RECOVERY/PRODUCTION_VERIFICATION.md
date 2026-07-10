# Production Verification

> Generated: 2026-07-11 02:55 WIB  
> Verified by: Recovery Sprint — Automated Audit  
> Branch: `recovery/knowledge-base`  
> Commit HEAD: `06ba593a680d9afb4c6d7a118195fb95f0986146`

---

## Summary

| Dimensi | Status |
|---|---|
| Source code (repo vs container) | PASS |
| Backend runtime | WARNING |
| Database (production vs repo copy) | WARNING |
| Environment configuration | WARNING |
| External integration (WhatsApp) | FAIL |
| Health check endpoint | FAIL |
| Database startup errors | FAIL |

**Overall Status: WARNING**

Repository source code **identik** dengan source code yang ada di dalam container production.  
Namun terdapat beberapa temuan kritis yang perlu ditangani sebelum sprint berikutnya.

---

## VERIFIED

### 1. Repository

| Item | Nilai | Sumber |
|---|---|---|
| Branch aktif | `recovery/knowledge-base` | `git branch --show-current` |
| Commit HEAD | `06ba593a680d9afb4c6d7a118195fb95f0986146` | `git rev-parse HEAD` |
| Commit message | `update kantor 1072026` (2026-07-11 01:17 WIB) | `git log --oneline -1` |
| Remote | `https://github.com/muzzf16/portal-sdmnext.git` | `git remote -v` |
| Working tree | **Tidak bersih** — 4 file staged (added) belum di-commit | `git status --short` |
| Untracked files | File `on` (konten tidak jelas, 1276 bytes) | `git status` |

**Staged files yang belum di-commit:**
```
A  PROJECT_RECOVERY/CHECKLIST.md
A  PROJECT_RECOVERY/PROJECT_MANIFEST.md
A  PROJECT_RECOVERY/REPOSITORY_AUDIT.md
A  on
```

---

### 2. Docker

| Item | Nilai | Sumber |
|---|---|---|
| docker-compose file | `docker-compose.yml` (di root project) | `cat docker-compose.yml` |
| Backend Dockerfile | `apps/backend/Dockerfile` — Node 18 Alpine, build TS, `CMD npm start` | `cat apps/backend/Dockerfile` |
| Frontend Dockerfile | `apps/frontend/Dockerfile` — multi-stage: Node build + Nginx Alpine serve | `cat apps/frontend/Dockerfile` |
| Backend image running | `portal-sdmv3_backend` (SHA: `c97fca393736`) | `docker images` |
| Frontend image running | `portal-sdmv3_sdm` (SHA: `1c098db4a64e`) | `docker images` |
| Kedua image dibuild pada | `2026-07-10 08:02-08:03 WIB` | `docker images` |

> **Catatan:** Terdapat **19 image** lain dari eksperimen deploy sebelumnya (v2, v3, v4, v5, v6, v8, v9, dll).

---

### 3. Runtime

| Item | Nilai | Sumber |
|---|---|---|
| Container backend | `portal_sdm_backend` — Running (13 jam) | `docker ps` |
| Container frontend | `portal_sdm_frontend` — Running (13 jam) | `docker ps` |
| Backend restart count | **2 kali** (terakhir restart: 08:10 WIB) | `docker inspect` |
| Frontend restart count | 0 | `docker inspect` |
| Backend restart policy | `unless-stopped` | `docker inspect` |
| Frontend restart policy | `unless-stopped` | `docker inspect` |
| Backend port mapping | Host `3334` -> Container `3333` | `docker inspect` |
| Frontend port mapping | Host `8081` -> Container `8081` | `docker inspect` |
| Backend entrypoint | `docker-entrypoint.sh npm start` | `docker inspect` |
| Frontend entrypoint | `/docker-entrypoint.sh nginx -g daemon off;` | `docker inspect` |
| Backend process utama | `node dist/server.js` (via `npm start`) | `Dockerfile CMD + package.json` |
| Network | `bpr_shared_network` (bridge, subnet 172.25.0.0/16) | `docker network inspect` |
| Backend IP | `172.25.0.2` | `docker network inspect` |
| Frontend IP | `172.25.0.3` | `docker network inspect` |

---

### 4. Environment

**Backend container (production env vars — hanya nama, tanpa nilai rahasia):**

| Variable | Sumber |
|---|---|
| `PORT` | docker-compose.yml environment |
| `NODE_ENV` | docker-compose.yml (nilai: `production`) |
| `DB_SOURCE` | docker-compose.yml (nilai: `/data/database.sqlite`) |
| `JWT_SECRET` | docker-compose.yml (dari `${JWT_SECRET}` di root `.env`) |
| `CORS_ORIGIN` | docker-compose.yml environment |
| `NODE_VERSION` | Docker image base (Node 18.20.8) |
| `YARN_VERSION` | Docker image base |

**Root `.env` (di repo, 65 bytes):**
- `JWT_SECRET` — dikonfigurasi
- `CORS_ORIGIN` — dikonfigurasi (hanya 1 domain; container memiliki 2)

**Backend `apps/backend/.env` (development env, TIDAK digunakan container):**
```
PORT, NODE_ENV (development), DB_SOURCE (relative path), JWT_SECRET (placeholder),
CORS_ORIGIN (localhost), WA_PROVIDER, WA_API_KEY, WA_GATEWAY_URL, WA_ENABLED
```

> **PERBEDAAN CORS**: Root `.env` hanya `https://sdm.bprbaperabatang.com`, sedangkan
> docker-compose.yml hardcode dua origin: `http://192.168.0.210:8081,https://sdm.bprbaperabatang.com`.

---

### 5. Database

| Item | Nilai | Sumber |
|---|---|---|
| Jenis database | SQLite | docker-compose.yml + package.json |
| Lokasi production | `/data/database.sqlite` di dalam container (Docker volume) | docker inspect mounts |
| Docker volume | `portal-sdmv3_backend_data` | `docker volume inspect` |
| Mountpoint host | `/var/snap/docker/common/var-lib-docker/volumes/portal-sdmv3_backend_data/_data` | `docker volume inspect` |
| Ukuran DB production | 5.4 MB (main) + 32KB (shm) + 3.9MB (WAL) ~= 9.3 MB efektif | `docker exec ls /data/` |
| Ukuran DB repo | 3.4 MB | `ls -lah` di root |
| Jumlah tabel (production) | 42 tabel | `sqlite3 .tables` di container |
| Jumlah tabel (repo DB) | 42 tabel (identik) | Python sqlite3 query |
| Record pegawai (production) | 33 | `docker exec sqlite3 COUNT(*)` |
| Record pengguna (production) | 38 | `docker exec sqlite3 COUNT(*)` |
| Record absensi (production) | 5,324 | `docker exec sqlite3 COUNT(*)` |
| Record pegawai (repo DB) | 33 | Python sqlite3 query |
| Backup otomatis | Ya — daily 02:00 WIB via scheduler | `scheduler.ts` |
| SQLite WAL mode | Aktif (ada file -shm dan -wal) | `ls /data/` |

**KRITIS: File-file DB di dalam volume production `/data/`:**
```
database.sqlite                            — 5.4 MB (aktif digunakan)
database.sqlite-shm                        — 32 KB (WAL shared memory)
database.sqlite-wal                        — 3.9 MB (WAL journal)
database_backup_before_root_restore.sqlite — 5.7 MB
database_before_restore_1421.sqlite        — 2.0 MB
database_from_root.sqlite                  — 2.1 MB
database_restore_temp.sqlite               — 5.7 MB
restore.sqlite                             — 3.2 MB
```

---

### 6. Storage

| Item | Nilai | Sumber |
|---|---|---|
| Uploads path (container) | `/app/public/uploads` -> volume `backend_uploads` | `docker inspect mounts` |
| Avatars path | `/app/public/avatars` | `docker exec ls /app/public/` |
| Documents path | `/app/public/documents` | `docker exec ls /app/public/` |
| Logos path | `/app/public/logos` | `docker exec ls /app/public/` |
| Volume `backend_uploads` | `portal-sdmv3_backend_uploads` — persistent | `docker volume ls` |
| Static assets (nginx) | `/usr/share/nginx/html/` (index.html, assets/, 50x.html) | `docker exec ls` |
| Logs | Tidak ada volume log eksplisit; container logs via Docker json-file | `docker inspect LogConfig` |
| Cache | Tidak ada cache layer (Redis/Memcached) | Tidak ditemukan |
| Backup storage path | `{CWD}/backups/db/` di dalam container | `backup.service.ts` |

---

### 7. Build Verification

| Item | Nilai | Sumber |
|---|---|---|
| Backend build context | `./apps/backend` | `docker-compose.yml` |
| Frontend build context | `./apps/frontend` | `docker-compose.yml` |
| Backend base image | `node:18-alpine` | `apps/backend/Dockerfile` |
| Frontend build image | `node:18-alpine` | `apps/frontend/Dockerfile` |
| Frontend serve image | `nginx:alpine` | `apps/frontend/Dockerfile` |
| Backend working directory | `/app` | `apps/backend/Dockerfile` |
| Backend entrypoint | `CMD ["npm", "start"]` -> `node dist/server.js` | `Dockerfile + package.json` |
| Frontend entrypoint | `CMD ["nginx", "-g", "daemon off;"]` | `apps/frontend/Dockerfile` |
| **Source files (container vs repo)** | **IDENTIK — 174 file .ts, 0 diff** | `find + diff + md5sum` |
| MD5 file kritis | `server.ts`, `app.ts`, `routes/index.ts` — hash IDENTIK | `md5sum` container vs repo |
| Image dibuat pada | `2026-07-10 08:02 WIB` | `docker images` |
| Commit HEAD repo | `2026-07-11 01:17 WIB` | `git log` |

> **GAP WAKTU**: Image dibuild pada 08:02 WIB (10 Juli), commit terbaru dibuat 01:17 WIB (11 Juli).
> Source code di container = state repo saat build, tetapi ada commit setelah build yang belum masuk container.

---

### 8. Running Services

| Service | Container | Port | Status |
|---|---|---|---|
| Backend API (Node.js/Express) | `portal_sdm_backend` | `0.0.0.0:3334->3333` | Running |
| Frontend (React/Nginx) | `portal_sdm_frontend` | `0.0.0.0:8081->8081` | Running |
| Database (SQLite) | Di dalam backend container | N/A (file-based) | Embedded |
| Scheduler (Automated Jobs) | Di dalam backend process | N/A | Running (setInterval) |
| Redis | Tidak ada | — | Tidak ada |
| Worker | Tidak ada | — | Tidak ada |
| Nginx (reverse proxy eksternal) | Tidak ada di compose | — | Tidak dikonfigurasi |
| sqlite-web (monitoring) | Profile `monitoring` | `8088` | Tidak aktif (profile) |
| adminer-sqlite | Profile `monitoring` | `8089` | Tidak aktif (profile) |

**Scheduled jobs aktif (di dalam backend process):**

| Waktu | Job |
|---|---|
| Daily 00:00 | `sendAllAutomatedReminders` |
| Daily 02:00 | `backupDatabase` |
| Daily 08:00 | `sendBirthdayReminders` |
| Daily 09:00 | `sendContractExpirationReminders` |
| Daily 10:00 | `sendPayrollReleaseNotifications` |
| Daily 11:00 | `sendPerformanceReviewReminders` |
| Hourly (menit 00) | `sendLeaveApprovalNotifications` |

---

### 9. External Integration

| Integrasi | Status | Sumber |
|---|---|---|
| WhatsApp Gateway (internal) | KONFIGURASI ADA di dev `.env` TAPI **TIDAK ADA di container production** | `WA_*` env vars tidak ada di `docker inspect` |
| API Key external | Tersedia — tabel `api_keys` di DB + middleware `apiKeyMiddleware` | `integration.routes.ts` |
| Integration endpoints | `/api/integrations/*` (employees, attendance, leaves, daily-activities) | `integration.routes.ts` |
| Email | Tidak ada konfigurasi email ditemukan | Tidak ditemukan |
| LDAP/OAuth | Tidak ada | Tidak ditemukan |
| Cloudflare | UNKNOWN — domain `sdm.bprbaperabatang.com` (kemungkinan via CF) | CORS config |
| Webhook | Tidak ada endpoint webhook | Tidak ditemukan |
| Cron eksternal | Tidak ada; hanya internal scheduler | `scheduler.ts` |

---

### 10. Health Check

| Item | Status | Sumber |
|---|---|---|
| `/api/health` | **404** | `curl http://localhost:3334/api/health` |
| `/api/status` | **404** | `curl http://localhost:3334/api/status` |
| Docker HEALTHCHECK | **Tidak dikonfigurasi** di Dockerfile maupun docker-compose | `docker inspect` |
| Backend API responding | Backend merespons dengan JSON valid | `curl POST /api/auth/login` |

---

## INFERRED

1. **Container production = repo pada saat build (10 Juli 08:02 WIB)**  
   Source code identik secara file name dan MD5. Tidak ada modifikasi manual di dalam container.  
   Reason: MD5 hash identik pada 30+ file sampel, file count identik (174 `.ts`).

2. **Domain `sdm.bprbaperabatang.com` kemungkinan menggunakan Cloudflare**  
   Reason: Tidak ada reverse proxy/Nginx eksternal di depan container yang terdeteksi, tetapi CORS mengizinkan domain HTTPS tersebut.

3. **Frontend di container = build dari commit yang sama dengan backend**  
   Reason: Kedua image dibuild pada waktu yang sangat berdekatan (08:02-08:03 WIB) dalam satu compose up.

4. **WhatsApp gateway (`http://192.168.0.210:4000`) adalah service terpisah di jaringan lokal**  
   Reason: URL menggunakan IP lokal, bukan hostname Docker.

5. **Backend restart 2x karena masalah database saat container pertama start**  
   Reason: Startup log menampilkan `no such table: pegawai` berulang kali; kemungkinan DB kosong lalu di-restore manual.

---

## UNKNOWN

1. **Apakah commit `06ba593a` (11 Juli) mengandung perubahan fungsional?**  
   Reason: Image dibuild 10 Juli 08:02. Konten commit belum di-verify apakah menyebabkan perbedaan perilaku.

2. **Apakah database di container production identik dengan `database.sqlite` di repo?**  
   Reason: Ukuran berbeda (container ~9.3MB WAL vs repo 3.4MB). Belum dilakukan full dump comparison.

3. **File `on` (1276 bytes) yang ada di working tree git**  
   Reason: File ini sudah staged (`git add on`). Konten dan tujuannya tidak diketahui.

4. **Apakah ada Nginx/reverse proxy di host OS di depan port 8081?**  
   Reason: Tidak ada data konfigurasi host OS ditemukan selama audit.

5. **Status WhatsApp gateway di `http://192.168.0.210:4000`**  
   Reason: Service di luar scope container; tidak diuji selama audit.

6. **Volume `portal_sdmv3_v2_backend_data` s.d. `v9` — isi dan relevansinya**  
   Reason: Ada 8 volume backup dari percobaan deploy sebelumnya. Isinya tidak diverifikasi.

---

## RISK

### Critical

**RISK-001: Database startup error — `no such table: pegawai`**

- Saat container backend pertama distart (06:57 WIB), terjadi error kritis.
- Container backend restart 2x.
- Bukti: `docker logs portal_sdm_backend --since 2026-07-10T06:57:00Z`
- Log menampilkan `SQLITE_ERROR: no such table: pegawai` pada 5+ error berulang.
- Dampak: Jika database hilang/corrupt/di-replace, seluruh API gagal.

**RISK-002: Tidak ada Docker HEALTHCHECK**

- Container tidak memiliki health check.
- Docker tidak bisa mendeteksi jika API crash tapi container masih "running".
- Bukti: `docker inspect portal_sdm_backend` — tidak ada HEALTHCHECK config.
- Dampak: Container terlihat sehat padahal API mungkin sudah tidak merespons.

**RISK-003: Tidak ada endpoint `/health` atau `/status`**

- Backend tidak memiliki endpoint health check standar.
- Bukti: `curl http://localhost:3334/api/health` mengembalikan 404.
- Dampak: Monitoring eksternal tidak bisa memverifikasi status API.

### High

**RISK-004: WhatsApp integration TIDAK aktif di production**

- `WA_PROVIDER`, `WA_API_KEY`, `WA_GATEWAY_URL`, `WA_ENABLED` tidak ada di container environment.
- Bukti: `docker inspect portal_sdm_backend` — tidak ada `WA_*` var.
- Dampak: Semua notifikasi WhatsApp menggunakan `mock` adapter — tidak dikirim ke user nyata.

**RISK-005: JWT_SECRET sudah terekspos**

- Root `.env` berisi JWT_SECRET dengan nilai aktual.
- Nilai ini juga muncul di output `docker inspect` (plaintext).
- Dampak: Siapapun dengan akses ke host atau docker inspect bisa memalsukan JWT token.

**RISK-006: Database production berbeda ukuran dari repo copy**

- Production DB: ~9.3MB (WAL aktif). Repo DB: 3.4MB.
- Dampak: Repo `database.sqlite` kemungkinan bukan snapshot terkini production.

**RISK-007: Backend restart 2x dalam 13 jam**

- Container backend sudah restart 2 kali (RestartCount: 2).
- Bukti: `docker inspect portal_sdm_backend`.
- Dampak: Menunjukkan ada instabilitas pada container backend.

### Medium

**RISK-008: Tidak ada volume untuk log persistence**

- Logs hanya ada di docker json-file log driver; tidak dipersist ke volume eksternal.
- Dampak: Logs hilang jika container dihapus atau docker daemon direstart.

**RISK-009: 19+ Docker images lama masih tersimpan di host**

- Berbagai versi (v2–v9, backend_v7, dll) dari eksperimen deploy sebelumnya.
- Dampak: Penggunaan disk tidak perlu; potensi kebingungan saat deploy.

**RISK-010: Multiple SQLite backup files di dalam volume production**

- Ada 5+ file `.sqlite` tambahan di dalam volume `/data/` yang aktif.
- Dampak: Kebingungan file mana yang aktif; risiko restore ke file yang salah.

**RISK-011: CORS_ORIGIN tidak konsisten antara tiga sumber konfigurasi**

- Root `.env`, `docker-compose.yml`, dan `apps/backend/.env` memiliki nilai berbeda.
- Dampak: Perubahan root `.env` saja tidak cukup untuk mengubah CORS di production.

**RISK-012: Commit terbaru belum di-deploy**

- Commit `06ba593a` (11 Juli 01:17 WIB) belum masuk container.
- Dampak: State production tidak mencerminkan state terkini repository.

### Low

**RISK-013: File `on` yang staged di working tree**

- Working tree tidak bersih; ada file aneh yang sudah di-staged.
- Dampak: Commit berikutnya akan menyertakan file ini secara tidak sengaja.

**RISK-014: Multiple docker-compose variant files**

- `docker-compose-backend-v8.yml`, `v9.yml`, `frontend.yml`, `temp.yml` ada di root.
- Dampak: Potensi kebingungan tentang file compose mana yang aktif.

**RISK-015: `VITE_API_BASE` di frontend `.env.production` di-comment out**

- Frontend tidak memiliki API base URL override — sepenuhnya mengandalkan Nginx proxy.
- Dampak: Jika konfigurasi Nginx berubah, tidak ada fallback override env.

---

## DIFFERENCE

### 1. Source Code: Container vs Repository

| Aspek | Container | Repository | Verdict |
|---|---|---|---|
| File `.ts` count | 174 | 174 | **IDENTIK** |
| Module list | 28 modul | 28 modul | **IDENTIK** |
| MD5 file kritis (server.ts, app.ts, routes/index.ts) | Hash A | Hash A | **IDENTIK** |
| Top-level `src/` directories | app.ts, config, core, jobs, middleware, modules, routes, server.ts, services, types, utils | (sama) | **IDENTIK** |

**Kesimpulan**: Source code yang berjalan di production identik dengan repository saat image dibuild (10 Juli 08:02 WIB).

### 2. Commit Terbaru vs Container

| Item | Container | Repository |
|---|---|---|
| Build timestamp | 2026-07-10 08:02 WIB | — |
| State repo saat build | (tidak ada git di container) | Identik dengan build |
| Commit HEAD repo saat ini | — | `06ba593a` (2026-07-11 01:17 WIB) |
| GAP waktu | — | ~17 jam setelah build |

**Kesimpulan**: Commit `06ba593a` ("update kantor 1072026") belum di-deploy ke container.

### 3. Environment: Root `.env` vs Docker Compose vs Container

| Variable | Root `.env` | docker-compose.yml | Container aktual |
|---|---|---|---|
| `JWT_SECRET` | Dikonfigurasi | `${JWT_SECRET}` | Sama |
| `CORS_ORIGIN` | 1 domain (https) | 2 domain (IP + https) | 2 domain (dari compose) |
| `WA_PROVIDER` | Tidak ada | Tidak ada | Tidak ada |
| `WA_API_KEY` | Tidak ada | Tidak ada | Tidak ada |
| `WA_ENABLED` | Tidak ada | Tidak ada | Tidak ada |

**Kesimpulan**: WhatsApp integration ada di `apps/backend/.env` (dev only) tetapi tidak dikonfigurasi untuk production.

### 4. Database: Container vs Repository

| Aspek | Container Production | Repository (`database.sqlite`) |
|---|---|---|
| Ukuran | ~9.3 MB (WAL aktif) | 3.4 MB |
| Jumlah tabel | 42 | 42 |
| Record pegawai | 33 | 33 |
| WAL mode | Aktif | Tidak diketahui |
| Backup files tambahan | 5 file di `/data/` | Multiple `.sqlite` di root |

**Kesimpulan**: Struktur tabel identik, jumlah pegawai sama, tetapi ukuran berbeda. Repository `database.sqlite` bukan snapshot terkini dari production.

---

## RECOMMENDATION

> Semua rekomendasi di bawah adalah langkah yang harus diputuskan dan dieksekusi oleh tim.
> Dokumen ini hanya mencatat temuan — tidak ada perubahan yang dilakukan selama audit.

### Prioritas 1 — Sebelum Sprint Berikutnya (WAJIB)

1. **Tambahkan Docker HEALTHCHECK** di `apps/backend/Dockerfile`:
   ```dockerfile
   HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
     CMD curl -f http://localhost:3333/api/health || exit 1
   ```

2. **Buat endpoint `/api/health`** di backend (minimal: `200 OK + {"status":"ok"}`).

3. **Aktifkan WhatsApp integration di production** — tambahkan `WA_*` vars ke `docker-compose.yml`:
   - `WA_PROVIDER`
   - `WA_API_KEY`
   - `WA_GATEWAY_URL`
   - `WA_ENABLED`

4. **Rotasi `JWT_SECRET`** — nilai saat ini sudah terekspos di docker inspect output.

5. **Verifikasi database production** — lakukan `sqlite3` dump dari container dan bandingkan dengan `database.sqlite` di repo.

### Prioritas 2 — Recovery Sprint (PENTING)

6. **Deploy commit terbaru** — commit `06ba593a` ("update kantor 1072026") belum masuk container production.

7. **Bersihkan staged files** — commit atau hapus file `on` yang tidak jelas tujuannya.

8. **Tambahkan volume log** di `docker-compose.yml`:
   ```yaml
   volumes:
     - backend_logs:/app/logs
   ```

9. **Konsolidasikan env configuration** — buat satu sumber kebenaran untuk `CORS_ORIGIN` antara root `.env` dan `docker-compose.yml`.

### Prioritas 3 — Maintenance (DISARANKAN)

10. **Bersihkan Docker images lama** — 15+ image tidak terpakai menghabiskan disk.

11. **Hapus backup files dari `/data/` volume** — 5 file sqlite tambahan menyebabkan kebingungan.

12. **Dokumentasikan proses deploy** — tidak ada `Makefile` atau `deploy.sh` Linux; hanya `deploy.ps1` (Windows PowerShell).

13. **Tambahkan log rotation** di `docker-compose.yml`:
    ```yaml
    logging:
      driver: json-file
      options:
        max-size: "10m"
        max-file: "3"
    ```

14. **Investigasi restart 2x pada backend** — analisis `docker logs portal_sdm_backend` lengkap.

---

*Dokumen ini dihasilkan dari observasi read-only. Tidak ada perubahan yang dilakukan selama audit.*
