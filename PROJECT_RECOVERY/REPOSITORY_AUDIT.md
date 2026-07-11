# Repository Audit

Dokumen ini mendokumentasikan hasil audit arsitektural terhadap kondisi repositori aktual, mencakup penemuan anomali file, kelengkapan berkas konfigurasi environment, serta validitas konfigurasi Docker.

---

### 1. Anomali File Database SQLite (.sqlite) Berserakan
Ditemukan penumpukan berkas database SQLite cadangan/sementara yang berserakan langsung di direktori root proyek. Hal ini mengotori area kerja dan mengaburkan batas data yang benar.

**Daftar Berkas SQLite di Root Direktori:**
- `database.sqlite` (3.5 MB) — **Database Aktif** yang digunakan saat ini.
- `database_after_replace.sqlite` (2.2 MB) — Berkas sisa pengujian/restore.
- `database_backup_.sqlite` (2.1 MB) — Berkas backup.
- `database_backup_20260304_104206.sqlite` (2.1 MB) — Berkas backup historis.
- `database_backup_before_restore_20260710144900.sqlite` (950 KB) — Berkas backup sebelum pemulihan.
- `database_live_before_replace.sqlite` (2.2 MB) — Berkas cadangan pra-penggantian.
- `database_merged.sqlite` (2.2 MB) — Hasil penggabungan database.
- `database_new_before_merge.sqlite` (2.2 MB) — Cadangan database baru sebelum digabungkan.
- `database_old_latest.sqlite` (2.2 MB) — Cadangan database lama versi akhir.
- `db_backup_2026-07-10T04-00-50.sqlite` (6 MB) — Backup database berskala besar.
- `backup_temp.sqlite` (6 MB) — Berkas backup temporer.

**Daftar Berkas SQLite di `apps/backend/`:**
- `database.sqlite` (16 KB) — Berkas database inisial/kosong bawaan repositori backend.
- `docker_db_backup.sqlite` (221 KB) — Salinan database cadangan dari container Docker.

**Rekomendasi Arsitektural:** Seluruh berkas backup/cadangan (`*.sqlite` selain `database.sqlite` aktif di root) harus dipindahkan ke direktori khusus atau dimasukkan ke dalam `.gitignore` agar tidak masuk dalam version control dan menggelembungkan ukuran repositori.

---

### 2. Audit Kelengkapan Berkas Environment (.env)
Audit dilakukan terhadap ketersediaan dan struktur kunci pada masing-masing berkas `.env` tanpa mengekspos isi rahasia (secrets).

#### A. Root `.env` (Tersedia, 65 bytes)
- **Key yang Ada**: `JWT_SECRET`, `CORS_ORIGIN`
- **Analisis**: Digunakan sebagai penampung variabel tingkat tinggi untuk di-inject ke dalam Docker Compose saat kontainer dijalankan di host.

#### B. Backend `.env` (`apps/backend/.env` - Tersedia, 625 bytes)
- **Key yang Ada**:
  - *Server*: `PORT`, `NODE_ENV`
  - *Database*: `DB_SOURCE`, `DB_JSON_SEED_SOURCE`
  - *Security*: `JWT_SECRET`
  - *CORS*: `CORS_ORIGIN`
  - *WhatsApp M2M*: `WA_PROVIDER`, `WA_API_KEY`, `WA_GATEWAY_URL`, `WA_ENABLED`
- **Analisis**: Konfigurasi lengkap untuk pengembangan lokal. `DB_SOURCE` mengarah ke file SQLite lokal (`database.sqlite`). File ini juga memiliki variabel pendukung modul integrasi WhatsApp.

#### C. Frontend `.env` (Tidak Tersedia untuk Dev, `.env.production` hanya berupa template komentar)
- **Key yang Ada**: `.env.production` hanya berisi komentar template `# VITE_API_BASE=https://api.bprbaperabatang.com`. Tidak ada file `.env` di root frontend.
- **Analisis**: Ketiadaan `.env` tidak merusak berjalannya aplikasi di lokal secara langsung karena proxy pada `apps/frontend/vite.config.ts` menangani penerusan request ke `http://localhost:3333`. Namun, direkomendasikan membuat `.env.development` yang mendokumentasikan key `VITE_API_BASE` secara eksplisit untuk standardisasi dokumentasi.

---

### 3. Validasi & Penemuan docker-compose.yml
Dilakukan pemeriksaan terhadap validitas berkas `docker-compose.yml` utama dan varian-variannya yang ada di repositori.

#### A. docker-compose.yml Utama (Valid)
- **Struktur**: Menggunakan spesifikasi Docker Compose versi `3.8`. Mendefinisikan network bridge internal `bpr_shared_network` (`bpr-network`) dan dua named volume (`backend_data` dan `backend_uploads`).
- **Services**:
  1. **backend**: Memetakan port host `3334` ke port container `3333`. Mengatur `NODE_ENV=production` dan `DB_SOURCE=/data/database.sqlite` (menggunakan named volume `backend_data` untuk persistensi).
  2. **sdm (frontend)**: Memetakan port host `8081` ke port container `8081` (berbasis Nginx alpine). Bergantung pada service `backend`.
  3. **sqlite-web** & **adminer-sqlite** (Monitoring Profile): Memetakan web GUI sqlite pada port `8088` dan `8089` (terikat lokal `127.0.0.1` untuk Adminer) untuk mempermudah pengecekan database di lingkungan kontainer.

#### B. Temuan Anomali & Risiko Docker:
1. **Redundansi Berkas Varian Docker Compose**:
   Terdapat banyak berkas Docker Compose cadangan/pengujian di direktori root (`docker-compose-backend-v8.yml`, `docker-compose-backend-v9.yml`, `docker-compose-frontend.yml`, `docker-compose-temp.yml`). Berkas-berkas ini harus dibersihkan untuk menghindari kerancuan deployment.
2. **Mounting Database Lokal Secara Langsung (docker-compose-backend-v8.yml)**:
   Pada berkas `docker-compose-backend-v8.yml`, volume diatur langsung mengarah ke berkas database lokal (`./database.sqlite:/data/database.sqlite`). Cara ini melanggar isolasi kontainer dan memicu risiko kerusakan data jika data lokal yang kotor menimpa database container.
3. **Celah Keamanan JWT_SECRET Fallback**:
    Di dalam `docker-compose.yml` utama, variabel `JWT_SECRET` dikonfigurasi dengan fallback default `${JWT_SECRET:-default_secret_please_change}`. Jika host tidak mendefinisikan `JWT_SECRET`, container backend akan berjalan menggunakan rahasia default di mode produksi, yang membahayakan integritas autentikasi JWT.

---

### 4. Risk Register (Sprint Perbaikan Mendatang — Prioritas Tinggi)

Berikut adalah daftar risiko keamanan dan arsitektural penting yang ditemukan selama proses pemulihan repositori, ditargetkan untuk diselesaikan pada sprint mendatang (bukan perbaikan sekarang):

| ID Risiko | Item Risiko | Dampak / Severity | Keterangan & Rencana Aksi | Status |
| :--- | :--- | :--- | :--- | :--- |
| **SEC-01** | Celah Keamanan JWT_SECRET Fallback | **Tinggi (High)** | Jika `JWT_SECRET` tidak didefinisikan pada host env, Docker Compose ([docker-compose.yml:15](file:///opt/portal-sdmv3/docker-compose.yml#L15)) akan menggunakan default secret fallback (`default_secret_please_change`), mem-bypass proteksi crash produksi di [apps/backend/src/config/config.ts:10-17](file:///opt/portal-sdmv3/apps/backend/src/config/config.ts#L10-L17). Rencana: Hapus default fallback di `docker-compose.yml`. | Terencana |
| **SEC-02** | Node 18 EOL (End-of-Life) | **Sedang (Medium)** | Dockerfile backend ([apps/backend/Dockerfile:2](file:///opt/portal-sdmv3/apps/backend/Dockerfile#L2)) & frontend ([apps/frontend/Dockerfile:2](file:///opt/portal-sdmv3/apps/frontend/Dockerfile#L2)) menggunakan `node:18-alpine`. Node 18 telah EOL sejak April 2025. Rencana: Upgrade ke Node 20 LTS / Node 22 LTS. | Terencana |
| **SEC-03** | Kebocoran Kunci Rahasia / Secrets Leak | **Tinggi (High)** | Berkas `.env` (berisi key sensitif seperti `WA_API_KEY` dan `JWT_SECRET` dev) serta `.sqlite` ter-track Git sejak *initial commit* (27 Okt 2025). | Diatasi (Smoke Test) |
| **OPS-01** | Cross-Platform `node_modules` Commit | **Sedang (Medium)** | Direktori `node_modules` backend di-commit dari Windows, menyebabkan wrapper scripts `.bin` lokal Linux tidak bisa dieksekusi (permission denied) dan binary `sqlite3` error (*invalid ELF header*). | Diatasi (Smoke Test) |

---

### 5. Security Findings (Temuan Keamanan Khusus)

Temuan keamanan berikut didokumentasikan secara terpisah dari hutang teknis biasa sebagai bagian dari pembersihan repositori:

* **WhatsApp API Key (`WA_API_KEY`)**:
  Kunci rahasia `WA_API_KEY` (JWT token) ter-expose di git history sejak **27 Oktober 2025** (pada commit awal `2f4d4255`), dan telah dikonfirmasi **sudah dirotasi secara resmi pada 11 Juli 2026** (kunci aktif saat ini di server/produksi menggunakan nilai baru yang aman dan berbeda).
* **JWT Secret (`JWT_SECRET`)**:
  Ditemukan nilai placeholder (`your-super-secret-jwt-key-here`) pada `.env` development di backend. Namun, status `JWT_SECRET` pada server production lokal di root `.env` telah diverifikasi **aman (sudah acak / menggunakan nilai custom)**.
* **Ekspos berkas di Git Tracking**:
  Direktori `node_modules` backend, berkas `.env` (root & backend), dan berkas database `.sqlite` cadangan telah dihapus dari pelacakan Git (*untracked*) pada commit **`578d4ebc`**. Aturan pengabaian berkas juga telah dipastikan terkonfigurasi di berkas `.gitignore` backend.
* **CATATAN PENTING (Git History & Size)**:
  Meskipun berkas-berkas tersebut sudah di-untrack dari *working directory* aktif saat ini, riwayat komit Git lama (berukuran **269 MB**) masih menyimpan versi lama dari file-file sensitif ini beserta isi kodenya. Proses *History Rewrite* menggunakan tool seperti BFG Repo-Cleaner atau `git-filter-repo` dicatat sebagai item perbaikan terpisah dengan prioritas **Menengah (Medium)** dan **BELUM dieksekusi**, karena membutuhkan koordinasi re-clone di semua environment (lokal & server development/produksi) agar tidak merusak sinkronisasi repositori.

