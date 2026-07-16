# CONTEXT.md — Portal SDM Next (sistem-manajemen-sdm)

> File ini adalah sumber kebenaran utama (source of truth) tentang KEADAAN proyek saat ini.
> Dibaca oleh AI/agent di AWAL setiap sesi, sebelum menyentuh kode apa pun.
> Update file ini setiap kali ada perubahan arsitektur, status modul, atau risiko yang signifikan.

Last updated: 2026-07-13
Server produksi: `bapera-server:/opt/portal-sdmv3`

---

## 1. Apa Proyek Ini

Portal Manajemen SDM — aplikasi web untuk mengelola data karyawan (pegawai), absensi, cuti,
penggajian, kontrak kerja, KPI/penilaian kinerja, arsip dokumen, dan kredit berkas karyawan,
untuk PT BPR BAPERA BATANG.

Status: **SUDAH PRODUCTION**, sedang menjalani Recovery Sprint bertahap (bukan rewrite).

## 2. Arsitektur & Stack (VERIFIED)

- **Struktur**: Monorepo tanpa npm workspaces — `apps/backend` dan `apps/frontend` dikelola
  sepenuhnya terpisah (dependency & lifecycle masing-masing).
- **Backend**: Node.js + Express v4 + TypeScript, jalan via `ts-node-dev` di dev.
  Pattern: Controller → Service → Repository, per modul di `src/modules/<nama-modul>/`.
- **Frontend**: React 18 + TypeScript + Vite v5 + Tailwind CSS v3.
  Diorganisasi per fitur: `src/features/<nn-nama-fitur>/{components,hooks,pages,api}`,
  shared code di `src/shared`.
- **Database**: SQLite (`sqlite` + `sqlite3` driver). `PRAGMA foreign_keys = ON` dan
  `PRAGMA journal_mode = WAL` diaktifkan saat koneksi dibuka
  (`apps/backend/src/core/database/sqlite.ts`).
- **Auth**: JWT + bcrypt/bcryptjs. Middleware `authenticateToken`
  (`apps/backend/src/middleware/authMiddleware.ts`). Modul `/api/integrations` pakai
  skema terpisah: API Key (`apiKeyMiddleware`), bukan JWT.
- **Node version**: `node:18-alpine` di kedua Dockerfile — **EOL sejak April 2025** (lihat SEC-05
  di MISTAKES.md), belum diupgrade.
- **Package manager**: npm biasa, package-lock.json terpisah per app (bukan dari root).

## 3. Port & Environment

| Layer | Dev (lokal) | Docker/Produksi |
|---|---|---|
| Backend | 3333 | host `3334` → container `3333` |
| Frontend | 5173 (Vite, proxy `/api`, `/uploads`, `/avatars`, `/documents`, `/logos` ke backend) | Nginx alpine, host `8081` → container `8081` |
| sqlite-web | - | 8088 |
| adminer-sqlite | - | 8089 (bind `127.0.0.1` saja) |

Network Docker: `bpr_shared_network` (`bpr-network`). Volume: `backend_data` (DB), `backend_uploads` (uploads).

Setup lokal singkat:
```bash
cd apps/backend && npm install && cp .env.production.example .env   # lalu sesuaikan
cd apps/frontend && npm install
cd apps/backend && npm run dev     # port 3333
cd apps/frontend && npm run dev    # port 5173, auto-proxy ke backend
```

## 4. Modul Aktif (29 modul backend, lihat `docs/architecture/MODULE_MAP.md`)

Modul berisiko tinggi yang butuh perhatian khusus: `pengguna`, `pegawai`, `absensi`, `cuti`,
`penggajian`, `kontrak`, `backup`, `laporan`, `integration`, `audit-log`.

Modul yang ditemukan tapi TIDAK terdokumentasi di `GEMINI.md` lama:
- `/api/kredit-berkas`
- `/api/arsip-dokumen` (frontend: `features/11-arsip-dokumen`)
- `/api/holidays`

## 5. Dokumentasi Existing (jangan dibuat ulang, cukup dirujuk)

- `docs/architecture/MODULE_MAP.md` — peta 29 modul + risk level
- `docs/api/API.md` — reverse-documented API (endpoint, auth status, request/response)
- `docs/database/DATABASE.md` — schema SQLite aktual + ERD Mermaid + tabel mati
  (`pinjaman_karyawan`, `users`, `organizational_kpi`, `department_kpi`, `daily_activities`)
- `PROJECT_RECOVERY/SECURITY_FINDINGS_SUMMARY.md` — daftar temuan keamanan terkonsolidasi
- `docs/PROJECT_MANIFEST.md`, `REPOSITORY_AUDIT.md` — hasil Sprint 0

## 6. STATUS RISIKO KRITIS SAAT INI (jangan lupa, jangan diam-diam diperbaiki)

Dua temuan kritis berikut **SENGAJA DITUNDA** oleh keputusan pemilik proyek (11 Juli 2026),
BUKAN karena terlewat:

1. **SEC-02** — Rute-rute penting (users, employees, leave-requests, attendance, payrolls,
   contracts, backup, reports, dll.) di `apps/backend/src/routes/index.ts` **tidak dibungkus**
   `authenticateToken`. Server internet-facing → risiko akses/modifikasi data tanpa otorisasi
   kapan saja selama masa penundaan.
2. **SEC-04** — `POST /api/auth/register` menerima `role` mentah dari client
   (`auth.pengguna.service.ts:34`: `role: role?.toLowerCase() || 'employee'`) → siapa pun bisa
   daftar sebagai admin.

**Recovery Freeze Rule (aturan proyek)**: satu sprint hanya menghasilkan SATU jenis perubahan.
Sprint dokumentasi TIDAK BOLEH menyentuh kode/perbaikan bug, walaupun kritis, kecuali sudah
lulus tahap dokumentasi baseline dan pemilik proyek mengizinkan secara eksplisit.

## 7. Git & Secrets Hygiene

- `node_modules` backend (ter-commit dari Windows sejak commit awal `2f4d4255`, 27 Okt 2025)
  sudah **di-untrack** dari Git (commit `578d4ebc`).
- `.env` (root & backend) dan semua backup `.sqlite` juga sudah di-untrack + masuk `.gitignore`.
- `WA_API_KEY` sudah **dirotasi** secara resmi (11 Juli 2026).
- `JWT_SECRET` di server produksi lokal sudah diverifikasi aman (nilai acak kustom), TAPI
  `docker-compose.yml` utama masih punya fallback `${JWT_SECRET:-default_secret_please_change}`
  yang belum dihapus (SEC-01).
- Git history LAMA (269 MB) masih menyimpan versi lama file sensitif — history rewrite
  (BFG/git-filter-repo) **belum dieksekusi**, prioritas Menengah, butuh koordinasi re-clone semua
  environment.

## 8. Smoke Test Terakhir: PASS

Backend `npm run dev` → jalan di port 3333 tanpa error permission/ELF.
Frontend `npm run dev` (Vite) → jalan di port 5173 tanpa hambatan.
(Dilakukan setelah `rm -rf node_modules && npm ci` di backend, agar native module
`sqlite3`/`bcrypt` terkompilasi ulang untuk Linux host.)
