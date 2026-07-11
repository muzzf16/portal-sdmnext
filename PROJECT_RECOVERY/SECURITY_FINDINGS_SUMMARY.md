# Security Findings & Database Risk Summary (Sprint 1.5 Recovery)

Dokumen ini merangkum seluruh temuan keamanan kritis, risiko database utama, serta temuan teknis lainnya yang diidentifikasi selama masa pemulihan proyek Portal SDM Next. Konsolidasi ini bertujuan untuk mempermudah eksekusi perbaikan pada sesi development berikutnya.

---

## 🚨 Daftar Temuan Kritis & Rekomendasi (Summary Table)

Berikut adalah daftar temuan diurutkan berdasarkan prioritas penanganan (dari paling kritis ke paling rendah):

| ID Temuan | Kategori | Nama Temuan | Dampak/Severity | Status Mitigasi | Bukti Kode / Lokasi |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **SEC-04** | Keamanan (Auth) | Privilege Escalation via Self-Registration | **Kritis (Critical)** | **DITUNDA** (Diterima secara sadar per 11 Juli 2026) | [auth.pengguna.service.ts:34](file:///opt/portal-sdmv3/apps/backend/src/modules/pengguna/auth.pengguna.service.ts#L34) |
| **SEC-02** | Keamanan (Auth) | Bypass JWT / Rute Tanpa Proteksi Token | **Kritis (Critical)** | **DITUNDA** (Diterima secara sadar per 11 Juli 2026) | [index.ts:37-64](file:///opt/portal-sdmv3/apps/backend/src/routes/index.ts#L37-L64) |
| **DATA-01**| Database (Ops) | Non-Idempotent Migrations (Data Loss Risk) | **Tinggi (High)** | Terencana | [migrate.ts](file:///opt/portal-sdmv3/apps/backend/db/migrate.ts) |
| **SEC-01** | Keamanan (Conf) | Fallback JWT_SECRET Default di Docker Compose | **Tinggi (High)** | Terencana | [docker-compose.yml:15](file:///opt/portal-sdmv3/docker-compose.yml#L15) |
| **SEC-05** | Keamanan (Val)  | Ketiadaan Validasi Input Terpusat (Validasi Manual) | **Sedang (Medium)** | Terencana | Seluruh Controller (misal [pegawai.controller.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/pegawai/pegawai.controller.ts)) |
| **SEC-06** | Keamanan (Leak) | Secrets Leak (WA API Key & JWT Dev) di Git | **Tinggi (High)** | Diatasi sebagian (Key produksi dirotasi, file di-untrack, Git history rewrite ditunda) | Git History (Commit `2f4d4255` & `578d4ebc`) |
| **TECH-01**| Kinerja (Perf)  | Bundle Frontend Terlalu Besar (EmployeeDetailView.js) | **Rendah (Low)** | Terencana (Sprint Optimasi) | `EmployeeDetailView.js` (2.1MB) |

---

## 🔍 Detail Temuan & Bukti Aktual Kode

### 1. SEC-04: Privilege Escalation via Self-Registration (Kritis)
* **Deskripsi**: Endpoint registrasi pengguna baru (`POST /api/auth/register`) menerima parameter `role` secara mentah dari *request body* yang dikirim klien tanpa adanya validasi atau whitelisting peran.
* **Bukti Kode**:
  Di [apps/backend/src/modules/pengguna/auth.pengguna.service.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/pengguna/auth.pengguna.service.ts#L34):
  ```typescript
  const newUser = await PenggunaRepository.create({
    name,
    email,
    password,
    role: role?.toLowerCase() || 'employee' // Parameter role di-mapping langsung
  });
  ```
  Di database tingkat SQLite ([DATABASE.md](file:///opt/portal-sdmv3/docs/database/DATABASE.md)), kolom `role` pada tabel `pengguna` juga tidak memiliki CHECK constraint `CHECK(role IN ('admin', 'employee'))` struktural.
* **Risiko**: Siapa pun dapat mendaftar sendiri ke sistem dengan menyertakan `"role": "admin"` di payload request JSON untuk mendapatkan hak akses admin penuh secara ilegal.

### 2. SEC-02: Bypass JWT / Rute Tanpa Proteksi Token (Kritis)
* **Deskripsi**: Rute sensitif pada modul `users`, `employees`, `payrolls`, `contracts`, `backup`, `reports`, `cuti`, `absensi`, `orientasi`, `pelatihan`, `company-settings`, `notifikasi`, `kpi-templates`, dan `jabatan` **terbuka untuk publik tanpa proteksi token JWT** (kehilangan middleware `authenticateToken`).
* **Bukti Kode**:
  Di [apps/backend/src/routes/index.ts](file:///opt/portal-sdmv3/apps/backend/src/routes/index.ts#L37-L64), rute-rute penting dipasang langsung tanpa pembungkus middleware otentikasi JWT:
  ```typescript
  router.use('/users', penggunaRoutes);             // TIDAK ADA PROTEKSI
  router.use('/employees', pegawaiRoutes);          // TIDAK ADA PROTEKSI
  router.use('/leave-requests', permintaanCutiRoutes); // TIDAK ADA PROTEKSI
  router.use('/attendance', absensiRoutes);         // TIDAK ADA PROTEKSI
  router.use('/payrolls', penggajianRoutes);        // TIDAK ADA PROTEKSI
  router.use('/contracts', kontrakRoutes);          // TIDAK ADA PROTEKSI
  router.use('/backup', backupRoutes);              // TIDAK ADA PROTEKSI
  router.use('/reports', laporanRoutes);            // TIDAK ADA PROTEKSI
  ```
* **Risiko**: Siapa pun di internet dapat membaca, memodifikasi, mengunduh cadangan database, atau merusak data kepegawaian dan penggajian tanpa otentikasi.

### 3. DATA-01: Non-Idempotent Migrations / Data Loss Risk (Tinggi)
* **Deskripsi**: Skrip migrasi [db/migrate.ts](file:///opt/portal-sdmv3/apps/backend/db/migrate.ts) tidak melacak status migrasi lewat tabel `_migrations` (walaupun tabel tersebut ada di database fisik). Skrip ini langsung mengeksekusi semua berkas `.sql` di folder `migrations` secara mentah menggunakan `db.exec(sql)`.
* **Bukti Kode**:
  Pernyataan `ALTER TABLE` kolom baru (seperti pada [20260217_alter_penggajian.sql](file:///opt/portal-sdmv3/apps/backend/db/migrations/20260217_alter_penggajian.sql#L4)) akan crash jika dijalankan ulang karena SQLite tidak mendukung klausa `IF NOT EXISTS` untuk kolom baru.
* **Risiko**: Server development atau produksi tidak dapat dijalankan ulang/migrasi ulang tanpa crash, kecuali database di-reset total via `npm run reset` yang mengakibatkan **kehilangan data permanen**.

### 4. SEC-01: Celah Keamanan JWT_SECRET Fallback (Tinggi)
* **Deskripsi**: Konfigurasi `docker-compose.yml` utama menyediakan nilai rahasia default fallback (`default_secret_please_change`) untuk JWT.
* **Bukti Kode**:
  Di [docker-compose.yml:15](file:///opt/portal-sdmv3/docker-compose.yml#L15):
  ```yaml
  - JWT_SECRET=${JWT_SECRET:-default_secret_please_change}
  ```
  Ini mem-bypass pemeriksaan gagal-aman di [apps/backend/src/config/config.ts:10-17](file:///opt/portal-sdmv3/apps/backend/src/config/config.ts#L10-L17) yang dirancang untuk mencegah container berjalan jika host lupa menyetel token rahasia yang aman.
* **Risiko**: Token JWT yang ditandatangani dengan secret default dapat dengan mudah dipalsukan menggunakan serangan brute-force offline.

### 5. SEC-05: Ketiadaan Validasi Input Terpusat / Validasi Manual di Controller (Sedang)
* **Deskripsi**: Aplikasi backend tidak menggunakan middleware validasi terpusat (seperti `express-validator` atau `zod`) untuk menyaring data masukan dari klien pada tingkat route/middleware. Validasi dilakukan secara manual menggunakan pengkondisian `if` di dalam controller atau melalui casting tipe TypeScript (`req.body as CreateKpiPayload`).
* **Bukti Kode**:
  Pustaka `express-validator` terdaftar sebagai dependensi di `apps/backend/package.json`, tetapi tidak pernah diimpor atau digunakan di seluruh modul aktif di `apps/backend/src/`. Validasi dilakukan secara ad-hoc, misalnya pada controller:
  - [pegawai.controller.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/pegawai/pegawai.controller.ts)
  - [penggajian.controller.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/penggajian/penggajian.controller.ts)
* **Risiko**: Input yang tidak valid atau berbahaya dapat lolos ke database/logic aplikasi jika developer lupa menulis kode validasi manual, meningkatkan risiko celah keamanan (seperti bypass validasi atau crash tak terduga).

### 6. SEC-06: Secrets Leak di Git History (Tinggi)
* **Deskripsi**: File sensitif `.env` dan `database.sqlite` (berisi key aktif pihak ketiga seperti `WA_API_KEY` dan hash password) terlanjur di-commit sejak *initial commit* (`2f4d4255`).
* **Bukti Kode**:
  File-file tersebut telah di-untrack dari pelacakan git aktif saat ini (`.gitignore` dikonfigurasi pada commit `578d4ebc`), namun data lama seukuran **269 MB** masih menetap di Git packfile.
* **Risiko**: Kebocoran API key WhatsApp dan manipulasi database jika riwayat Git diakses pihak luar.

### 7. TECH-01: Bundle Frontend Terlalu Besar (Rendah)
* **Deskripsi**: Berkas bundle hasil build frontend untuk halaman detail pegawai (`EmployeeDetailView.js`) berukuran sangat besar, mencapai **2.1 MB** (Gzip **1 MB**). Hal ini disebabkan oleh ketiadaan pemisahan kode (*code splitting*) atau pemuatan malas (*lazy-loading*) untuk komponen/pustaka besar.
* **Bukti**: Hasil analisis bundle build frontend (`apps/frontend`).
* **Risiko/Dampak**: Memperlambat waktu pemuatan halaman detail pegawai secara signifikan bagi pengguna, terutama pada koneksi internet lambat.

---

## 🛠️ Rencana Aksi Perbaikan Sprint Mendatang

### A. Fase 1: Perbaikan Keamanan Segera (Quick Wins)
1. **Tambahkan Proteksi JWT (SEC-02)**: Daftarkan middleware `authenticateToken` pada berkas [index.ts](file:///opt/portal-sdmv3/apps/backend/src/routes/index.ts) untuk seluruh rute kecuali `/auth/login` dan `/auth/register`.
2. **Perbaiki Registrasi Peran (SEC-04)**: Modifikasi [auth.pengguna.service.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/pengguna/auth.pengguna.service.ts) agar mengabaikan field `role` dari klien dan memaksa nilainya menjadi `'employee'`. Pembuatan admin baru harus dilakukan eksklusif oleh admin lain yang terotentikasi.
3. **Konfigurasi Variabel Docker (SEC-01)**: Hapus fallback default `default_secret_please_change` dari `docker-compose.yml`.

### B. Fase 2: Robustness Database & Git History Cleanup
1. **Buat Idempotent Migration (DATA-01)**: Tulis ulang [db/migrate.ts](file:///opt/portal-sdmv3/apps/backend/db/migrate.ts) agar membaca/menulis ke tabel `_migrations` guna memvalidasi berkas migrasi mana saja yang sudah dijalankan.
2. **Git History Rewrite (SEC-06)**: Jalankan BFG Repo-Cleaner atau `git-filter-repo` untuk membersihkan berkas `.env` dan `.sqlite` dari history komit Git lama demi memangkas ukuran packfile (dari 269 MB ke kisaran < 5 MB).
3. **Tambahkan CHECK Constraints (SEC-04)**: Buat berkas migrasi baru untuk membangun kembali tabel `pengguna` dengan constraint `CHECK(role IN ('admin', 'employee'))` yang aman di tingkat mesin SQLite.

### C. Fase 3: Standardisasi Validasi & Optimasi Kinerja
1. **Terapkan Validasi Terpusat (SEC-05)**: Terapkan pustaka `express-validator` atau `zod` secara konsisten pada endpoint backend untuk menyaring input body secara ketat sebelum diproses oleh controller.
2. **Lazy Loading Frontend (TECH-01)**: Implementasikan pemisahan kode (*code splitting*) menggunakan `React.lazy()` pada rute-rute frontend, khususnya untuk halaman detail pegawai (`EmployeeDetailView.js`), guna mengurangi ukuran bundle initial load.
