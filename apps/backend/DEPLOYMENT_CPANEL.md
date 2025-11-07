# Panduan Deployment Node.js di cPanel

## Persiapan Sebelum Deploy

### 1. Build Aplikasi
Sebelum upload ke cPanel, build aplikasi TypeScript terlebih dahulu:

```bash
cd apps/backend
npm install
npm run build
```

Ini akan menghasilkan folder `dist/` yang berisi JavaScript yang sudah dikompilasi.

### 2. File yang Perlu Di-upload ke cPanel
Upload folder `apps/backend/` ke cPanel. Pastikan folder berikut ikut ter-upload:
- ✅ `dist/` (folder hasil build)
- ✅ `src/` (opsional, untuk debugging)
- ✅ `db/` (folder database dan migrations)
- ✅ `public/` (folder untuk file upload)
- ✅ `package.json` dan `package-lock.json`
- ✅ `database.sqlite` (jika sudah ada data)
- ✅ `.env` (file environment variables - JANGAN di-commit ke git!)

**JANGAN upload:**
- ❌ `node_modules/` (akan diinstall di cPanel)
- ❌ File `.git/` dan file development lainnya

## Konfigurasi Form cPanel Node.js

### Form "CREATE APPLICATION"

#### 1. Node.js version
**Rekomendasi:** Pilih versi **Node.js 18.x** atau **20.x** (LTS)
- Versi 10.24.1 terlalu lama dan mungkin tidak kompatibel dengan dependensi modern
- Cek versi yang tersedia di cPanel Anda

#### 2. Application mode
**Pilih:** `Production`
- Jangan pilih Development untuk production server
- Ini akan set `NODE_ENV=production`

#### 3. Application root
**Isi dengan:** `sdm` atau path relatif ke folder backend Anda
- Jika Anda upload folder `apps/backend/` ke folder `sdm` di cPanel, maka isi: `sdm`
- Path ini adalah path relatif dari home directory di cPanel
- Pastikan folder ini berisi `package.json`

#### 4. Application URL
**Domain:** `bprbaperabatang.com` (atau subdomain yang Anda inginkan)
**Path:** `sdm` (atau kosongkan jika ingin di root domain)
- URL lengkap akan menjadi: `https://bprbaperabatang.com/sdm`
- Atau jika path dikosongkan: `https://bprbaperabatang.com`

#### 5. Application startup file
**Isi dengan:** `dist/server.js`
- Ini adalah file entry point setelah build
- Pastikan sudah menjalankan `npm run build` sebelum deploy

### Environment Variables

Klik tombol **"ADD VARIABLE"** dan tambahkan variabel berikut:

| Variable Name | Value | Keterangan |
|--------------|-------|------------|
| `NODE_ENV` | `production` | Environment mode |
| `PORT` | `3333` | Port aplikasi (cPanel mungkin override ini) |
| `JWT_SECRET` | `[secret-key-anda]` | **PENTING:** Ganti dengan secret key yang kuat dan unik! |
| `DB_SOURCE` | `./database.sqlite` | Path ke database SQLite |
| `CORS_ORIGIN` | `https://bprbaperabatang.com` | URL frontend yang diizinkan (atau `*` untuk development) |

**Contoh JWT_SECRET yang aman:**
Gunakan generator random string, contoh:
```
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
```

## Setelah Deploy

### 1. Install Dependencies
Setelah aplikasi dibuat di cPanel, cPanel akan otomatis menjalankan `npm install` di folder application root.

### 2. Setup Database
Jika database belum ada, jalankan migration:
- Masuk ke Terminal di cPanel (jika tersedia)
- Atau gunakan SSH untuk akses server
- Jalankan: `npm run migrate`

### 3. Seed Data (Opsional)
Jika perlu data awal:
```bash
npm run seed
npm run seed:company-settings
```

### 4. Restart Application
Setelah semua konfigurasi selesai, restart aplikasi dari cPanel Node.js manager.

### 5. Cek Logs
Monitor log aplikasi untuk memastikan tidak ada error:
- Cek di cPanel Node.js manager → Logs
- Atau cek error log di cPanel

## Troubleshooting

### Aplikasi tidak bisa start
1. **Cek Node.js version:** Pastikan versi Node.js kompatibel (18+ atau 20+)
2. **Cek startup file:** Pastikan `dist/server.js` ada dan bisa diakses
3. **Cek dependencies:** Pastikan `npm install` sudah berjalan dengan sukses
4. **Cek logs:** Lihat error log untuk detail error

### Port sudah digunakan
- cPanel biasanya assign port otomatis
- Gunakan environment variable `PORT` jika perlu override
- Atau biarkan cPanel yang handle port assignment

### Database tidak ditemukan
- Pastikan file `database.sqlite` ada di application root
- Atau jalankan migration untuk membuat database baru
- Cek permission file database (harus writable)

### CORS Error
- Pastikan `CORS_ORIGIN` di environment variables sesuai dengan URL frontend
- Jika frontend di domain yang sama, bisa set ke `*` (tidak disarankan untuk production)

## Catatan Penting

1. **Security:**
   - Jangan commit file `.env` ke git
   - Gunakan JWT_SECRET yang kuat dan unik
   - Set `NODE_ENV=production` untuk production

2. **Performance:**
   - Pastikan sudah build aplikasi (`npm run build`) sebelum deploy
   - Jangan upload `node_modules/` (akan diinstall otomatis)

3. **Database:**
   - Backup database sebelum deploy
   - Pastikan permission file database sudah benar
   - SQLite file harus writable oleh aplikasi

4. **Monitoring:**
   - Monitor log aplikasi secara berkala
   - Setup error monitoring jika memungkinkan

