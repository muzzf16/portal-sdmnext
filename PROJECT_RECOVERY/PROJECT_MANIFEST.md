# Project Manifest

### Konteks Aplikasi
Portal Manajemen SDM adalah aplikasi web komprehensif yang dirancang untuk mengelola data karyawan (pegawai), absensi, cuti, penggajian, serta penilaian kinerja. Proyek ini dikembangkan dalam struktur monorepo yang memisahkan tanggung jawab antara API backend (`apps/backend`) yang berjalan secara default pada port `3333`, dan antarmuka pengguna frontend (`apps/frontend`) yang berjalan secara default pada port `5173`. Kedua aplikasi tersebut mengelola dependensi dan siklus pengembangannya secara mandiri tanpa menggunakan fitur workspaces bawaan pada file package.json di root.

- **Nama Aplikasi**: VERIFIED (apps/backend/package.json:2) - `sistem-manajemen-sdm`
- **Frontend Stack**: VERIFIED (apps/frontend/package.json:24-25,52-53, apps/frontend/tailwind.config.ts) - React v18 + TypeScript + Vite v5 + Tailwind CSS v3
- **Backend Stack**: VERIFIED (apps/backend/package.json:22,44) - Node.js + Express v4 + TypeScript + ts-node-dev
- **Database**: VERIFIED (apps/backend/package.json:30-31, apps/backend/src/core/database/sqlite.ts:9) - SQLite (menggunakan library `sqlite` dan driver `sqlite3`)
- **Autentikasi**: VERIFIED (apps/backend/package.json:18-19,26, apps/backend/src/middleware/authMiddleware.ts:7-28) - JWT (JSON Web Tokens) dan bcrypt/bcryptjs untuk hashing password
- **Node Version**: VERIFIED (apps/backend/Dockerfile:2, apps/frontend/Dockerfile:2) - Node v18 (menggunakan base image `node:18-alpine` di kedua Dockerfile, tidak ada file `.nvmrc` atau blok `engines` di package.json)
- **Package Manager**: VERIFIED (apps/backend/package-lock.json, apps/frontend/package-lock.json, AGENTS.md:14-19) - npm (dikelola secara terpisah per aplikasi dengan package-lock.json mandiri di setiap folder aplikasi, bukan dari root)
- **Struktur Monorepo**: VERIFIED (AGENTS.md:9-12, folder `/apps/backend` dan `/apps/frontend`) - Terpisah antara `apps/backend` dan `apps/frontend`

---

### Cara Menjalankan Environment Lokal

Untuk menjalankan aplikasi di lingkungan pengembangan lokal, ikuti instruksi berikut secara persis:

#### 1. Instalasi Dependensi (Dijalankan Terpisah)
Dependensi **harus** diinstal pada masing-masing direktori aplikasi, bukan di direktori root.
```bash
# Terminal 1 - Backend
cd apps/backend
npm install

# Terminal 2 - Frontend
cd apps/frontend
npm install
```

#### 2. Konfigurasi Environment File (.env)
- Salin template environment untuk backend jika belum ada (gunakan `.env.production.example` sebagai referensi key yang dibutuhkan):
  ```bash
  cp apps/backend/.env.production.example apps/backend/.env
  ```
  Sesuaikan nilai variabel di dalam `apps/backend/.env` untuk pengembangan lokal (misalnya `NODE_ENV=development` dan `JWT_SECRET`).

#### 3. Menjalankan Backend Dev Server
Mulai server backend menggunakan script development (aktif di port `3333`):
```bash
cd apps/backend
npm run dev
```

#### 4. Menjalankan Frontend Dev Server
Mulai server development Vite untuk frontend (aktif di port `5173`):
```bash
cd apps/frontend
npm run dev
```
Secara otomatis, semua request API ke `/api` serta asset statis (`/uploads`, `/avatars`, `/documents`, `/logos`) akan diarahkan/diproxy oleh Vite ke server backend pada `http://localhost:3333` (sesuai konfigurasi di `apps/frontend/vite.config.ts:13-41`).
