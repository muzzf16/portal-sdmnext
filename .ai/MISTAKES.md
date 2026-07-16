# MISTAKES.md — Portal SDM Next

> Daftar bug, kesalahan arsitektur, dan technical debt yang SUDAH DIKETAHUI.
> Tujuan: supaya AI/developer baru tidak "menemukan ulang" masalah yang sama, dan tidak
> mencoba memperbaiki sesuatu yang justru sedang SENGAJA DITUNDA.
> Update status begitu ada progres (Ditemukan → Terencana → Sedang Dikerjakan → Diatasi).

---

## 🔴 Kritis — DITUNDA SECARA SADAR (jangan diperbaiki tanpa izin eksplisit pemilik proyek)

### SEC-02 — Bypass JWT / Rute Tanpa Proteksi Token
- **Apa**: Modul `users`, `employees`, `leave-requests`, `attendance`, `payrolls`, `contracts`,
  `backup`, `reports`, dan beberapa lainnya dipasang di `apps/backend/src/routes/index.ts:37-64`
  TANPA middleware `authenticateToken`, walau `GEMINI.md` lama mengklaim semua rute terproteksi.
- **Dampak**: Server internet-facing → siapa pun bisa baca/ubah/hapus data karyawan, absensi,
  penggajian, bahkan download backup database, tanpa login.
- **Ditemukan**: 11 Juli 2026.
- **Status**: **DITUNDA** — keputusan sadar pemilik proyek per 11 Juli 2026, menunggu sesi
  development berikutnya (setelah dokumentasi baseline selesai, sesuai Recovery Freeze Rule).
- **Rencana fix (belum dieksekusi)**: daftarkan `authenticateToken` untuk semua rute kecuali
  `/auth/login`, `/auth/register`, dan `/integrations` (yang sudah pakai API key sendiri).

### SEC-04 — Privilege Escalation via Self-Registration
- **Apa**: `POST /api/auth/register` menerima field `role` mentah dari request body
  (`auth.pengguna.service.ts:34`: `role: role?.toLowerCase() || 'employee'`), tanpa
  validasi/whitelist di level service maupun `CHECK` constraint di level SQLite.
- **Dampak**: Siapa pun bisa daftar dengan `"role": "admin"` dan langsung dapat akses admin penuh.
- **Ditemukan**: 11 Juli 2026.
- **Status**: **DITUNDA** bersama SEC-02, keputusan sadar pemilik proyek.
- **Rencana fix (belum dieksekusi)**: paksa `role` selalu `'employee'` di service, admin baru
  hanya bisa dibuat oleh admin lain yang sudah terotentikasi; tambahkan
  `CHECK(role IN ('admin','employee'))` di migrasi baru tabel `pengguna`.

---

## 🟠 Prioritas Tinggi — Terencana (belum dikerjakan)

### SEC-01 — JWT_SECRET Fallback Default di docker-compose.yml
- **Apa**: `docker-compose.yml:15` → `JWT_SECRET=${JWT_SECRET:-default_secret_please_change}`.
  Ini mem-bypass proteksi `process.exit(1)` di `apps/backend/src/config/config.ts:10-17` yang
  seharusnya mencegah server jalan tanpa secret aman di produksi.
- **Risiko**: Kalau host env lupa set `JWT_SECRET`, container tetap jalan diam-diam pakai secret
  default yang bisa ditebak/brute-force offline.
- **Fix**: Hapus fallback default dari `docker-compose.yml`.
- **Catatan**: `JWT_SECRET` di server produksi lokal SAAT INI sudah diverifikasi aman (custom
  random), jadi belum ada eksploitasi aktif — tapi fallback tetap harus dihapus sebagai
  defense-in-depth.

### DATA-01 — Migrasi Tidak Idempotent (Risiko Data Loss)
- **Apa**: `apps/backend/db/migrate.ts` tidak melacak status migrasi lewat tabel `_migrations`
  (walau tabelnya sudah ada secara fisik) — semua file `.sql` di `migrations/` dieksekusi mentah
  via `db.exec(sql)` setiap kali dijalankan.
- **Dampak**: `ALTER TABLE` (mis. `20260217_alter_penggajian.sql`) akan CRASH kalau dijalankan
  ulang karena SQLite tidak support `IF NOT EXISTS` untuk kolom. Solusi darurat operasional
  selama ini adalah `npm run reset` — yang **menghapus semua data produksi**.
- **Fix**: Tulis ulang `migrate.ts` agar mencatat & mengecek riwayat di tabel `_migrations`,
  hanya jalankan file migrasi yang belum pernah dieksekusi.

### SEC-06 — Secrets Leak di Git History (269 MB)
- **Apa**: `.env` (root & backend) dan `database.sqlite` sempat ter-commit sejak initial commit
  `2f4d4255` (27 Okt 2025), berisi `WA_API_KEY` lama dan hash password.
- **Sudah dilakukan**: File di-untrack dari working tree aktif (commit `578d4ebc`),
  `WA_API_KEY` sudah dirotasi resmi (11 Juli 2026).
- **Belum dilakukan**: History rewrite (BFG Repo-Cleaner / `git-filter-repo`) untuk memangkas
  history 269 MB → target < 5 MB. Ditunda karena butuh koordinasi re-clone semua environment
  (lokal, server dev, server produksi) supaya tidak desync.

---

## 🟡 Prioritas Sedang

### SEC-05 — Node 18 EOL
- Kedua Dockerfile (`apps/backend/Dockerfile:2`, `apps/frontend/Dockerfile:2`) pakai
  `node:18-alpine`. Node 18 EOL sejak April 2025 — tidak ada patch keamanan resmi lagi.
- Fix: migrasi ke Node 20 LTS atau 22 LTS.

### SEC-05(b) — Tidak Ada Validasi Input Terpusat
- `express-validator` terdaftar di `package.json` tapi TIDAK PERNAH dipakai di kode aktif
  (`apps/backend/src/`). Validasi dilakukan manual via `if` di controller atau type-cast
  TypeScript (`req.body as CreateKpiPayload`) — tidak ada penegakan runtime yang konsisten.
- Contoh lokasi: `pegawai.controller.ts`, `penggajian.controller.ts`.
- Risiko: input tak terduga bisa lolos kalau developer lupa menulis pengecekan manual.

### OPS-01 — Cross-Platform `node_modules` Commit (SUDAH DIATASI)
- `node_modules` backend sempat ter-commit dari Windows → wrapper `.bin` gagal jalan di Linux,
  `sqlite3` error "invalid ELF header". **Diatasi** via untrack + `npm ci` ulang di host Linux
  (lihat D-005 di DECISIONS.md). Smoke test PASS.

---

## 🟢 Prioritas Rendah

### TECH-01 — Bundle Frontend Terlalu Besar
- `EmployeeDetailView.js` hasil build mencapai 2.1 MB (gzip 1 MB) — tidak ada code splitting /
  lazy loading.
- Dampak: halaman detail pegawai lambat dimuat, terutama koneksi lambat.
- Fix: `React.lazy()` untuk rute-rute besar, terutama fitur detail pegawai.

### Repo Hygiene — File SQLite Berserakan di Root
- 11 file `*.sqlite` backup/sementara ada langsung di root repo (total puluhan MB), selain
  2 file lagi di `apps/backend/` (`database.sqlite` kosong bawaan, `docker_db_backup.sqlite`).
- Fix: pindahkan ke folder `/backups/` yang di-`.gitignore`, hapus yang tidak perlu lagi.

### Repo Hygiene — Redundansi Varian docker-compose.yml
- Ada `docker-compose-backend-v8.yml`, `-v9.yml`, `-frontend.yml`, `-temp.yml` di root.
- Salah satu varian (`v8`) me-mount `./database.sqlite` langsung ke container — melanggar
  isolasi kontainer, risiko data lokal kotor menimpa database produksi kalau dipakai tidak
  sengaja.
- Fix: hapus varian yang sudah tidak dipakai, `docker-compose.yml` utama tetap jadi satu-satunya
  source of truth.

### Dokumentasi — Duplikasi Dokumen Status
- `FINAL_IMPLEMENTATION_STATUS.md`, `IMPLEMENTATION_SUCCESS_CONFIRMATION.md`,
  `BACKEND_IMPLEMENTATION_COMPLETE.md`, `PROJECT_COMPLETION_CONFIRMATION.md` punya tujuan
  yang tumpang tindih. Sebaiknya disatukan jadi satu dokumen status rilis.

---

## Pola Kesalahan yang Perlu Diwaspadai ke Depan

- **Jangan percaya `GEMINI.md`/`AGENTS.md` lama secara mentah** — sudah terbukti beberapa klaim
  di sana (mis. "semua rute pakai JWT", "validasi ketat pakai express-validator") tidak sesuai
  kode aktual. Selalu cross-check ke kode sebelum menandai sesuatu VERIFIED.
- **Jangan mount file SQLite lokal langsung ke volume container** (lihat kasus
  `docker-compose-backend-v8.yml`) — selalu gunakan named volume.
- **Jangan jalankan `npm run reset` di produksi** kecuali sudah dipastikan tidak ada cara lain —
  ini menghapus seluruh data karena migrasi belum idempotent (DATA-01).
