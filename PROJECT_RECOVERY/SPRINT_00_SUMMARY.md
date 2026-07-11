# Sprint 00 Summary: Project Discovery & Recovery Baseline

Dokumen ini menyajikan ringkasan penutup dari **Sprint 0 (Project Discovery)**, merangkum seluruh temuan arsitektural, perbaikan kebersihan repositori (*repo hygiene*), status risiko, serta hal-hal yang akan ditargetkan pada **Sprint 1**.

---

## 1. Temuan Utama (Discovery Findings)

* **Arsitektur & Stack**:
  * Aplikasi dikembangkan sebagai monorepo terpisah: frontend berbasis **React + TypeScript + Vite + Tailwind CSS** (`apps/frontend`) dan backend berbasis **Node.js + Express + TypeScript** (`apps/backend`).
  * Kedua aplikasi mengelola dependensi masing-masing secara terpisah (tanpa npm workspaces).
  * Port default lokal: backend pada `3333`, frontend pada `5173` (di-proxy oleh Vite ke backend).
* **Database**:
  * Menggunakan **SQLite** (`database.sqlite`) dengan inisialisasi PRAGMA Foreign Keys diaktifkan secara dinamis pada saat koneksi dibuka.
* **Autentikasi (Auth)**:
  * Menggunakan token **JWT** untuk hampir semua rute backend, kecuali rute `/api/auth` (publik) dan `/api/integrations` (menggunakan verifikasi API Key terpisah).
* **Docker & Deployment**:
  * Berjalan pada kontainer terisolasi menggunakan **Docker Compose** (`docker-compose.yml` utama versi `3.8`).
  * Volume diatur presisten untuk `/data` database kontainer dan `/app/public/uploads` berkas unggahan.
  * Deployment ke server dijalankan otomatis via script PowerShell `deploy.ps1`.

---

## 2. Pemulihan & Perbaikan yang Telah Dilakukan (Fixes Applied)

* **Pembersihan Repositori (*Repo Hygiene*)**:
  * Direktori `apps/backend/node_modules/` (ter-track sejak komit awal pada 27 Okt 2025 dari environment Windows) telah **dihapus dari Git tracking** (commit `578d4ebc`), mengurangi potensi konflik cross-platform.
  * Berkas sensitif `.env`, `apps/backend/.env`, serta file database SQLite cadangan/backup (`database_backup_.sqlite`, `database_backup_20260304_104206.sqlite`, dll.) telah **di-untrack dari Git**.
  * File `.gitignore` lokal ditambahkan pada `apps/backend/` untuk menjaga agar file-file tersebut tidak ter-track kembali secara tidak sengaja.
* **Koreksi Dependency Lokal**:
  * Folder `node_modules` backend lokal dibersihkan sepenuhnya dan di-install ulang menggunakan `npm ci` pada host Linux (Ubuntu) sehingga binary module (`sqlite3`, `bcrypt`) terkompilasi ulang secara dinamis untuk format ELF Linux yang sesuai.
  * Local Smoke Test sukses (**PASS**) untuk backend dan frontend.
* **Rotasi Rahasia (*Secret Rotation*)**:
  * Rahasia `WA_API_KEY` (token JWT) yang sempat bocor di dalam Git history telah **dirotasi secara resmi** (11 Juli 2026).
  * Status `JWT_SECRET` pada server produksi lokal telah diverifikasi menggunakan nilai kustom (acak) yang aman.

---

## 3. Hal yang Belum Diketahui & Target Sprint 1

Beberapa aspek teknis dan operasional masih belum dieksplorasi secara mendalam dan menjadi target utama pada **Sprint 1 (Feature Restoration & Verification)**:
* **Verifikasi Fungsi Bisnis Internal**: Belum dilakukan verifikasi terhadap alur kerja internal seperti absensi harian, pengajuan cuti, perhitungan payroll, dan penilaian kinerja.
* **Pengujian Integrasi WhatsApp**: Menguji apakah integrasi M2M WhatsApp Gateway berjalan semestinya dengan `WA_API_KEY` yang baru dirotasi.
* **Migrasi Database Produksi**: Melakukan audit mendalam terhadap struktur data SQLite riil untuk memastikan skema tabel sinkron dengan definisi model TypeScript terbaru.

---

## 4. Risk Register Final (Prioritas Berdasarkan Urutan Kepentingan)

Daftar risiko yang dicatat untuk menjadi fokus penanganan pada sprint perbaikan mendatang:

1. **[PRIORITAS KRITIS - DITUNDA SECARA SADAR] Bypass JWT / Ketiadaan Proteksi Autentikasi Rute (SEC-02)**
   * *Risiko*: Modul backup, pengguna, pegawai, cuti, absensi, penggajian, kontrak, laporan tidak memiliki proteksi autentikasi pada rute-nya, meski GEMINI.md mengklaim sebaliknya. Server bersifat internet-facing.
   * *Aksi*: Keputusan pemilik proyek per 11 Juli 2026: **DITUNDA** hingga sesi development berikutnya. Risiko akses/modifikasi/pengambilan data tanpa otorisasi dapat terjadi kapan saja selama masa penundaan ini.
2. **[PRIORITAS TINGGI] Celah Keamanan JWT_SECRET Fallback (SEC-01)**
   * *Risiko*: Berkas [docker-compose.yml:15](file:///opt/portal-sdmv3/docker-compose.yml#L15) utama menggunakan fallback default `${JWT_SECRET:-default_secret_please_change}`. Hal ini mem-bypass logika penghentian paksa backend di [apps/backend/src/config/config.ts:10-17](file:///opt/portal-sdmv3/apps/backend/src/config/config.ts#L10-L17). Jika host env lupa mengonfigurasi variabel ini, container akan berjalan secara diam-diam menggunakan secret default di mode produksi.
   * *Aksi*: Hapus default fallback dari berkas Docker Compose utama.
3. **[PRIORITAS TINGGI] Node 18 EOL (End-of-Life) (SEC-03)**
   * *Risiko*: Dockerfile backend ([apps/backend/Dockerfile:2](file:///opt/portal-sdmv3/apps/backend/Dockerfile#L2)) & frontend ([apps/frontend/Dockerfile:2](file:///opt/portal-sdmv3/apps/frontend/Dockerfile#L2)) menggunakan base image `node:18-alpine`. Node 18 telah EOL sejak April 2025, memicu potensi kerentanan keamanan tanpa pembaruan resmi.
   * *Aksi*: Migrasi base image Docker ke Node 20 LTS atau Node 22 LTS.
4. **[PRIORITAS MENENGAH] Ukuran Git History Besar (269 MB)**
   * *Risiko*: Git packfile lama masih menyimpan berkas `node_modules` Windows dan SQLite lama yang berukuran sangat besar.
   * *Aksi*: Lakukan pembersihan riwayat Git (*history rewrite*) menggunakan `git-filter-repo` or BFG Repo-Cleaner.
5. **[PRIORITAS RENDAH] Tumpukan Berkas SQLite Cadangan (12 Berkas Backup)**
   * *Risiko*: Ada 12 berkas SQLite cadangan (seperti `backup_temp.sqlite`, `database_merged.sqlite`, dll.) yang tertumpuk di root dan `apps/backend/`.
   * *Aksi*: Pindahkan berkas cadangan penting ke folder arsip khusus (`/backups/`) yang sudah di-ignore oleh Git, dan hapus berkas cadangan sementara yang tidak lagi diperlukan agar area kerja tetap bersih.
