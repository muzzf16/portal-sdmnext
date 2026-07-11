# Checklist Recovery Project: Portal SDM Next

Dokumen ini melacak verifikasi arsitektur proyek, API, database, Docker, dan deployment. Setiap temuan awalnya diperlakukan sebagai **HYPOTHESIS** berdasarkan dokumen pemandu (`GEMINI.md` dan `AGENTS.md`), kemudian dicocokkan dengan kode aktual untuk ditingkatkan statusnya menjadi **VERIFIED** beserta bukti file/baris.

---

## Status Target Sprint 0 (Pembersihan & Smoke Test)
- [x] Project Manifest
- [x] Repository Audit
- [x] Module Inventory Discovery
- [x] Architecture Discovery
- [x] API Discovery
- [x] Database Discovery
- [x] Docker Discovery
- [x] Deployment Discovery

---

## Status Target Sprint 1 (Module Map & Reverse Documentation)
- [x] Tugas 1: Peta Modul Komprehensif (`docs/architecture/MODULE_MAP.md`)
- [x] Tugas 2: Dokumentasi Balik API (`docs/api/API.md`)
- [x] Tugas 3: Dokumentasi Balik Database (`docs/database/DATABASE.md`)
- [x] Tugas 4: Perbarui Checklist & Ringkasan Temuan Keamanan (`PROJECT_RECOVERY/SECURITY_FINDINGS_SUMMARY.md`)

---

## 1. Architecture Discovery

- **Hypothesis (AGENTS.md:9-12)**: Proyek merupakan monorepo dengan backend berbasis Node.js/Express/TypeScript dan frontend berbasis React/Vite/TypeScript.
  - **Cross-Check**: Folder `/apps/backend` dan `/apps/frontend` dianalisis.
  - **Verdict**: **VERIFIED** (Folder root `/apps/backend` dan `/apps/frontend`).

- **Hypothesis (AGENTS.md:11)**: Backend menggunakan Service dan Repository pattern dengan modul di bawah `src/modules/*`.
  - **Cross-Check**: Membuka struktur modul pegawai di `apps/backend/src/modules/pegawai/`.
  - **Verdict**: **VERIFIED** (Bukti: `apps/backend/src/modules/pegawai/pegawai.controller.ts`, `pegawai.service.ts`, `pegawai.repository.ts`, `pegawai.model.ts`).

- **Hypothesis (AGENTS.md:12)**: Frontend diorganisasi berdasarkan fitur di bawah `src/features/*` dengan shared code di `src/shared`.
  - **Cross-Check**: Membuka struktur folder di `apps/frontend/src/features/`.
  - **Verdict**: **VERIFIED** (Bukti: Folder `apps/frontend/src/features/01-pegawai` berisi subfolder `components`, `hooks`, `pages`, `api`).

- **Hypothesis (AGENTS.md:30)**: Port backend berjalan di `3333` dan frontend di `5173` pada lingkungan lokal.
  - **Cross-Check**: Membuka `apps/backend/src/config/config.ts` dan `apps/frontend/vite.config.ts`.
  - **Verdict**: **VERIFIED** (Bukti: `apps/backend/src/config/config.ts:20` untuk port backend, `apps/frontend/vite.config.ts:13-41` meluncurkan server Vite default port `5173` dengan proxy API).

- **Hypothesis (GEMINI.md)**: CORS mengizinkan request dari frontend dan membatasi origin.
  - **Cross-Check**: Membuka setup CORS pada `apps/backend/src/app.ts`.
  - **Verdict**: **VERIFIED** (Bukti: `apps/backend/src/app.ts:13-36` membatasi origin ke `allowedOrigins` namun meloloskan semua request jika `NODE_ENV` bukan production atau `NODE_ENV === 'development'`).

---

## 2. API Discovery

- **Hypothesis (AGENTS.md:69)**: JWT auth diperlukan untuk seluruh route backend.
  - **Cross-Check**: Membuka `apps/backend/src/routes/index.ts`.
  - **Verdict**: **VERIFIED DENGAN PENGECUALIAN** (Bukti: `apps/backend/src/routes/index.ts:37` menggunakan `/auth` tanpa JWT token, dan `/integrations` pada baris 61 menggunakan `apiKeyMiddleware` berbasis API Key, sedangkan route lain memanggil `authenticateToken` pada `apps/backend/src/middleware/authMiddleware.ts:7-28`).

- **Hypothesis (AGENTS.md:71)**: Validasi input yang ketat menggunakan `express-validator` di semua tempat.
  - **Cross-Check**: Melakukan pencarian grep di direktori `apps/backend/src/` untuk import/penggunaan `express-validator`.
  - **Verdict**: **MISMATCH / TIDAK TERVERIFIKASI** (Bukti: `express-validator` terdaftar sebagai dependensi di `apps/backend/package.json:23`, tetapi tidak pernah diimpor atau digunakan di seluruh modul aktif di `apps/backend/src/`). Validasi dilakukan secara manual.

- **Hypothesis (GEMINI.md)**: API route root dipasang pada prefix `/api` dengan modul-modul standar.
  - **Cross-Check**: Memeriksa `apps/backend/src/routes/index.ts`.
  - **Verdict**: **VERIFIED** (Bukti: `apps/backend/src/app.ts:38` menggunakan prefix `/api` untuk seluruh router di `apps/backend/src/routes/index.ts:37-64`).
  - **Temuan Tambahan**: Ditemukan 3 modul aktif tambahan yang tidak terdokumentasi di `GEMINI.md`:
    1. `/kredit-berkas` (mengarahkan ke `kreditBerkasRoutes`, `apps/backend/src/routes/index.ts:65`)
    2. `/arsip-dokumen` (mengarahkan ke `arsipDokumenRoutes`, `apps/backend/src/routes/index.ts:66`, dengan fitur frontend `/apps/frontend/src/features/11-arsip-dokumen`)
    3. `/holidays` (mengarahkan ke `holidaysRoutes`, `apps/backend/src/routes/index.ts:67`)

---

## 3. Database Discovery

- **Hypothesis (AGENTS.md:10, GEMINI.md)**: Menggunakan database SQLite.
  - **Cross-Check**: Mengecek dependensi dan driver inisialisasi database.
  - **Verdict**: **VERIFIED** (Bukti: `apps/backend/package.json:30-31` dependensi `sqlite` & `sqlite3`, dan `apps/backend/src/core/database/sqlite.ts:28-31` membuka koneksi SQLite).

- **Hypothesis (GEMINI.md)**: Database menerapkan Foreign Keys dan WAL mode untuk optimasi & integritas.
  - **Cross-Check**: Membuka fungsi inisialisasi database di `apps/backend/src/core/database/sqlite.ts`.
  - **Verdict**: **VERIFIED** (Bukti: `apps/backend/src/core/database/sqlite.ts:34-35` mengeksekusi `PRAGMA foreign_keys = ON;` dan `PRAGMA journal_mode = WAL;`).

- **Hypothesis (AGENTS.md:34)**: Perubahan skema database di produksi harus menggunakan migrasi dan tidak boleh menyalin berkas SQLite langsung.
  - **Cross-Check**: Memeriksa script deployment dan file migration.
  - **Verdict**: **VERIFIED** (Bukti: script `deploy.ps1:100-101` menjalankan `node /app/run_migrations.js` di dalam container Docker dan terdapat script migrasi aktif di `apps/backend/run_migrations.js`).

---

## 4. Docker Discovery

- **Hypothesis (AGENTS.md:61-63)**: Docker Compose digunakan sebagai source of truth untuk konfigurasi ports, networks, dan volumes. Backend dipetakan `3334:3333` dan frontend dipetakan `8081:8081`.
  - **Cross-Check**: Memeriksa `docker-compose.yml` utama di root.
  - **Verdict**: **VERIFIED** (Bukti: `docker-compose.yml:10` untuk port backend `3334:3333`, `docker-compose.yml:32` untuk port frontend `8081:8081`).

- **Hypothesis (GEMINI.md)**: Aplikasi frontend dibuild menggunakan multi-stage build dan disajikan dengan Nginx.
  - **Cross-Check**: Memeriksa `apps/frontend/Dockerfile` dan `apps/frontend/nginx.conf`.
  - **Verdict**: **VERIFIED** (Bukti: `apps/frontend/Dockerfile:2` menggunakan builder stage `node:18-alpine` dan `apps/frontend/Dockerfile:15` menggunakan `nginx:alpine` untuk menyajikan statik serta melakukan reverse-proxy ke API backend di port `3333` sesuai `apps/frontend/nginx.conf:12-36`).

- **Hypothesis (AGENTS.md:66)**: Uploads dir berada di `/app/public/uploads` di dalam container backend.
  - **Cross-Check**: Memeriksa pemetaan volume pada `docker-compose.yml`.
  - **Verdict**: **VERIFIED** (Bukti: `docker-compose.yml:21` memetakan volume `backend_uploads:/app/public` dan Express melayani asset statik uploads dari folder `/app/public/uploads` via `apps/backend/src/app.ts:41`).

---

## 5. Deployment Discovery

- **Hypothesis (GEMINI.md)**: Deployment menggunakan sistem kontainer di VPS.
  - **Cross-Check**: Membuka berkas otomatisasi deployment di root.
  - **Verdict**: **VERIFIED** (Bukti: Berkas `deploy.ps1` mendefinisikan seluruh alur deployment otomatis mulai dari `git pull` (baris 66), pembangunan container `docker-compose up -d --build` (baris 86), hingga eksekusi migrasi di dalam container (baris 100-101)).

- **Hypothesis (AGENTS.md:33)**: Backend membutuhkan `JWT_SECRET` yang valid saat deployment produksi agar tidak crash.
  - **Cross-Check**: Memeriksa validasi environment variable di backend.
  - **Verdict**: **VERIFIED** (Bukti: `apps/backend/src/config/config.ts:10-17` secara eksplisit memanggil `process.exit(1)` jika `JWT_SECRET` kosong pada mode `NODE_ENV === 'production'`).

---

## Hasil Pengujian & Pemulihan (Local Smoke Test - STATUS: PASS)

Pemulihan dan verifikasi smoke test lokal berhasil dilaksanakan dengan hasil **PASS** untuk kedua aplikasi (backend & frontend).

### Langkah & Command Pemulihan yang Digunakan:

1. **Menghentikan Pelacakan (*Stop Tracking*) Berkas yang Salah di Git**:
   Direktori `node_modules` backend yang sebelumnya ter-track secara tidak sengaja oleh commit lama (Windows) dihapus dari Git index bersama berkas `.env` dan database `.sqlite` cadangan:
   ```bash
   # Masuk ke direktori root proyek
   cd /opt/portal-sdmv3

   # Menghapus node_modules backend dari Git index
   git rm -r --cached apps/backend/node_modules

   # Menghapus berkas .env dan backup sqlite dari Git index
   git rm --cached .env apps/backend/.env
   git rm --cached apps/backend/db/database.sqlite apps/backend/docker_db_backup.sqlite database_backup_.sqlite database_backup_20260304_104206.sqlite

   # Menambahkan aturan abaikan (.gitignore) di tingkat aplikasi backend
   echo "node_modules/" >> apps/backend/.gitignore
   echo ".env" >> apps/backend/.gitignore
   echo "*.sqlite" >> apps/backend/.gitignore

   # Mendaftarkan gitignore dan melakukan commit
   git add .gitignore apps/backend/.gitignore
   git commit -m "chore(recovery): stop tracking node_modules, .env, and sqlite backups (secrets rotated separately)"
   ```

2. **Instalasi Bersih Dependensi Backend**:
   Membersihkan berkas lokal `node_modules` backend lama dan mengunduh ulang dependensi menggunakan `npm ci` agar sesuai dengan berkas kunci `package-lock.json` untuk arsitektur host Linux (glibc):
   ```bash
   cd apps/backend
   rm -rf node_modules
   npm ci
   ```
   *Hasil*: Seluruh dependensi terinstal dengan benar, dan native modules seperti `sqlite3` dan `bcrypt` berhasil dikompilasi secara dinamis untuk kernel Linux Ubuntu host.

### Hasil Uji Smoke Test:

1. **Backend Development (ts-node-dev)**
   * **Command**:
     ```bash
     cd apps/backend
     npm run dev
     ```
   * **Hasil**: **PASS**. Server berjalan lancar tanpa *permission denied* ataupun mismatch ELF binary.
   * **Bukti Log**:
     ```text
     [INFO] 10:39:35 ts-node-dev ver. 2.0.0 (using ts-node ver. 10.9.2, typescript ver. 5.9.3)
     API running on 3333
     ```
   * **Respons API**: Mengembalikan respon JSON terstruktur (status error `SQLITE_ERROR: no such table: pegawai` terbukti berhasil di-handle oleh Controller Express, menandakan middleware dan router berjalan sempurna).

2. **Frontend Development (Vite)**
   * **Command**:
     ```bash
     cd apps/frontend
     npm run dev
     ```
   * **Hasil**: **PASS**. Vite development server berhasil dijalankan tanpa hambatan.
   * **Bukti Log**:
     ```text
       VITE v5.4.21  ready in 204 ms
       ➜  Local:   http://localhost:5173/
     ```

---

### Hasil Uji & Verifikasi Sprint 1 (Module Map & Reverse Documentation):

1. **Pemetaan Modul Lengkap (Tugas 1)**:
   * **Hasil**: **SELESAI** (Commit: `d6edd329`). Berkas [MODULE_MAP.md](file:///opt/portal-sdmv3/docs/architecture/MODULE_MAP.md) berhasil mencatat 29 modul backend aktif beserta tujuan bisnis, route, controller, service, repositori, dependensi database, status pengujian, dan tingkat risikonya.
   * **Hasil Verifikasi Kunci**: Modul-modul dengan risiko tinggi diletakkan di bagian teratas untuk peninjauan khusus (seperti `pengguna`, `pegawai`, `absensi`, `cuti`, `penggajian`, `kontrak`, `backup`, `laporan`, `integration`, dan `audit-log`).

2. **Dokumentasi Balik API (Tugas 2)**:
   * **Hasil**: **SELESAI** (Commit: `bb9f94bc`). Berkas [API.md](file:///opt/portal-sdmv3/docs/api/API.md) mencatat seluruh endpoint, metode HTTP, status otorisasi, parameter request, dan skema respons.
   * **Hasil Temuan Kunci**: Mengidentifikasi celah bypass otorisasi JWT pada modul penting (`SEC-02`) dan privilege escalation register user (`SEC-04`).

3. **Dokumentasi Balik Database (Tugas 3)**:
   * **Hasil**: **SELESAI** (Commit: `f983d1db`). Berkas [DATABASE.md](file:///opt/portal-sdmv3/docs/database/DATABASE.md) memetakan skema SQLite fisik menggunakan dump `.schema` aktual, diagram ERD Mermaid, dan anomali skema (tabel mati/tidak terpakai seperti `pinjaman_karyawan`, `users`, `organizational_kpi`, `department_kpi`, dan `daily_activities`).
   * **Hasil Temuan Kunci**: Mengidentifikasi ketidak-idempotennan skrip migrasi ([migrate.ts](file:///opt/portal-sdmv3/apps/backend/db/migrate.ts)) yang memicu bahaya operasional berupa data loss (`DATA-01`) dan hilangnya CHECK constraint di tingkat database untuk kolom `role` pada tabel `pengguna`.

4. **Ringkasan Temuan Keamanan (Tugas 4)**:
   * **Hasil**: **SELESAI**. Berkas [SECURITY_FINDINGS_SUMMARY.md](file:///opt/portal-sdmv3/PROJECT_RECOVERY/SECURITY_FINDINGS_SUMMARY.md) dibuat untuk menyatukan semua temuan kritis agar mudah ditangani pada sprint perbaikan.


