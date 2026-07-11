# Root Cause Analysis

## Bug ID
BUG-2026-001 - Avatar Pegawai Tidak Muncul

## Analisis Akar Masalah (Root Cause)

Masalah HTTP 404 (Not Found) pada gambar avatar pegawai disebabkan oleh ketidaksesuaian (mismatch) antara path URL yang disimpan ke dalam database, direktori penyimpanan file fisik, dan routing statis (static serving) pada Express backend.

Berikut adalah alur kegagalannya:

1. **Penyimpanan File Fisik (Upload Middleware)**
   Pada file `apps/backend/src/middleware/uploadMiddleware.ts`, file avatar yang diunggah disimpan di dalam direktori `public/avatars`.

2. **Static Route di Express Server**
   Pada file `apps/backend/src/app.ts`, direktori `public/avatars` diekspos melalui endpoint `/avatars`:
   ```typescript
   app.use('/avatars', express.static(path.join(__dirname, '..', 'public', 'avatars')));
   ```
   Sehingga URL yang benar untuk mengakses avatar fisik tersebut seharusnya adalah `/avatars/[nama-file]`.

3. **Penyimpanan URL ke Database (Controller)**
   Pada controller (`apps/backend/src/modules/pegawai/pegawai.controller.ts` dan `pegawai.auth.controller.ts`), URL yang disimpan ke database diset secara statis menggunakan awalan `/uploads/avatars/`:
   ```typescript
   avatarUrl = `/uploads/avatars/${req.file.filename}`;
   ```

4. **Kegagalan Resolusi (404 Error)**
   Karena data di DB menggunakan `/uploads/avatars/...`, frontend meminta file dengan awalan `/uploads`. 
   Pada `app.ts`, prefix `/uploads` dialihkan (di-map) ke direktori `public/uploads`:
   ```typescript
   app.use('/uploads', express.static(path.join(__dirname, '..', 'public', 'uploads')));
   ```
   Server lalu mencari file tersebut di `public/uploads/avatars/[nama-file]`. File tersebut tentu tidak ditemukan karena aslinya tersimpan di `public/avatars/[nama-file]`, sehingga backend mengembalikan HTTP 404 Not Found.

## Rekomendasi Solusi

Ada dua opsi untuk menyelesaikan bug ini:

**Opsi 1 (Perbaikan di level Controller):**
Ubah logic di `pegawai.controller.ts` dan `pegawai.auth.controller.ts` agar path yang disimpan sesuai dengan route static-nya.
Dari:
`avatarUrl = '/uploads/avatars/${req.file.filename}';`
Menjadi:
`avatarUrl = '/avatars/${req.file.filename}';`
*Catatan: Opsi ini memerlukan migrasi database (data patching) untuk memperbaiki URL avatar pada baris data yang sudah telanjur menyimpan `/uploads/avatars/`.*

**Opsi 2 (Menyatukan folder upload fisik - Direkomendasikan):**
Jika ingin struktur path URL dan fisik lebih rapi (yaitu avatar sebagai bagian dari `/uploads`), maka:
1. Ubah direktori penyimpanan di `uploadMiddleware.ts` menjadi `../../public/uploads/avatars`.
2. Hapus route khusus `/avatars` di `app.ts` (biarkan route `/uploads` melayani sub-folder `avatars`).
*Catatan: Pemindahan file secara fisik (move directory) dari `public/avatars` ke `public/uploads/avatars` pada environment production diperlukan.*
