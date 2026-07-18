## ⚠️ STATUS PROJECT
- **Production:** https://sdm.bprbaperabatang.com — user aktif, hati-hati
- **Staging:** [Belum ada]
- **Dev branch:** `develop` atau `feature/*`
- **Production branch:** `main` atau `master`

ATURAN: Semua task AI dikerjakan di branch feature dulu.
Tidak ada commit langsung ke main/production.

## 🔴 FILE YANG TIDAK BOLEH DISENTUH (PRODUCTION CRITICAL)
- `apps/backend/src/middleware/authMiddleware.ts` — autentikasi semua user
- `apps/backend/src/server.ts` — konfigurasi utama server backend
- `apps/backend/src/config/db.ts` — koneksi utama database
- `apps/frontend/src/utils/api.ts` — utilitas pemanggilan API (asumsi ada file serupa untuk routing API)
- `docker-compose.yml` — konfigurasi production dan environment
- `README.md` — dokumentasi utama (kecuali diperintahkan)

## 🟡 FILE YANG BOLEH DIEDIT DENGAN HATI-HATI
- `apps/backend/src/modules/**/*.routes.ts` — tambah route baru aman, jangan ubah yang ada tanpa validasi kuat
- `apps/backend/src/modules/**/*.controller.ts` — controller backend
- `apps/frontend/src/features/**/*.tsx` — fitur di frontend
- `package.json` — dependensi project

## 🟢 AREA AMAN UNTUK DIKERJAKAN
- `apps/frontend/src/features/[NamaFiturBaru]/*` — halaman/komponen fitur baru
- `apps/backend/src/modules/[FiturBaru]/*` — modul backend baru
- `apps/backend/db/migrations/*` — migrasi database baru (tidak mengubah migrasi lama)

## TENTANG PROJECT
Project PORTALS-SDM (Sistem Manajemen Sumber Daya Manusia).
Monorepo dengan Node.js/Express di `apps/backend` (menggunakan SQLite) dan React/Vite di `apps/frontend`.
Menggunakan TypeScript. Autentikasi menggunakan JWT.
Deploy melalui Docker Compose.
