# Production Readiness Audit - Portal SDM v3
**Tanggal Audit:** 28 April 2026
**Status Keseluruhan:** ⚠️ NEEDS IMPROVEMENT (Prioritas P0 ditemukan)

## 1. Deployment
- **Temuan**: Deployment menggunakan Docker Compose sudah menggunakan multi-stage build untuk efisiensi. Namun, beberapa environment variables sensitif (seperti `JWT_SECRET`) memiliki nilai fallback default di kode sumber.
- **Dampak**: Resiko keamanan tinggi jika admin lupa mengatur secret di lingkungan produksi, karena sistem akan menggunakan secret default yang diketahui publik.
- **Prioritas**: P1
- **Rekomendasi**: 
  - Hapus fallback secret di kode; buat aplikasi *crash* saat startup jika variabel wajib tidak ada.
  - Implementasikan file `.env.production.example` yang lengkap.
  - Gunakan Docker Secrets atau Vault jika memungkinkan.

## 2. Backup dan Restore (KRITIKAL)
- **Temuan**: Modul backup dan restore di `apps/backend/src/modules/backup` saat ini hanya berisi fungsi kosong (placeholder). Tidak ada mekanisme otomatis untuk backup file `database.sqlite` maupun folder `uploads`.
- **Dampak**: Resiko kehilangan data permanen jika terjadi kerusakan database, kegagalan disk, atau kesalahan manusia (human error).
- **Prioritas**: P0
- **Rekomendasi**: 
  - Segera implementasikan script backup database secara periodik (cron job).
  - Gunakan `sqlite3 backup API` atau minimal copy file saat database idle.
  - Backup harus disimpan di luar server aplikasi (Off-site storage seperti S3, GDrive, atau server backup terpisah).

## 3. Logging dan Monitoring
- **Temuan**: Aplikasi hanya mengandalkan `console.log` dan `console.error`. Tidak ada structured logging (format JSON) yang memudahkan pencarian di log aggregator. Tidak ada mekanisme log rotation dan tidak ada monitoring metrik kesehatan sistem (CPU, RAM, Disk, Healthcheck).
- **Dampak**: Sulit melakukan diagnosa masalah yang bersifat intermiten dan tidak ada peringatan dini jika server kehabisan resource sebelum akhirnya down.
- **Prioritas**: P1
- **Rekomendasi**: 
  - Gunakan library logging seperti `Winston` atau `Pino` untuk structured logging.
  - Implementasikan log rotation untuk mencegah disk penuh oleh file log.
  - Tambahkan endpoint `/api/health` untuk dipantau oleh Docker/Uptime Kuma.
  - Integrasikan APM sederhana (seperti Sentry) untuk menangkap error secara real-time.

## 4. Auth dan Authorization
- **Temuan**: Autentikasi menggunakan JWT tanpa mekanisme pembatalan (blacklisting) dan tanpa Refresh Token. Authorization menggunakan middleware `restrictTo` sudah baik namun implementasinya harus dipastikan merata di seluruh API sensitif.
- **Dampak**: Jika sebuah akses token bocor, penyerang tetap bisa masuk sampai masa berlaku token habis, karena token tidak bisa dibatalkan dari sisi server.
- **Prioritas**: P1
- **Rekomendasi**: 
  - Tambahkan mekanisme Refresh Token agar akses token bisa berumur pendek (misal: 15 menit).
  - Pastikan masa berlaku token (expiresIn) tidak terlalu lama di produksi.

## 5. Penyimpanan File Upload
- **Temuan**: File hasil upload (avatar, dokumen) disimpan di filesystem lokal container (`public/uploads`).
- **Dampak**: Aplikasi bersifat "stateful". Jika ingin melakukan scaling horizontal (menjalankan lebih dari 1 instance backend), file antar container tidak akan sinkron. Backup juga menjadi lebih berat karena harus mem-backup ribuan file fisik.
- **Prioritas**: P1
- **Rekomendasi**: 
  - Gunakan Object Storage (S3-compatible seperti Minio atau AWS S3) untuk penyimpanan file yang lebih skalabel.
  - Jika tetap di lokal, pastikan volume Docker yang digunakan di-mount ke storage yang memiliki redundansi (RAID).

## 6. Database dan Integritas Data
- **Temuan**: Konfigurasi SQLite saat ini tidak secara eksplisit mengaktifkan Foreign Key constraints (`PRAGMA foreign_keys = ON`). Juga belum mengaktifkan WAL (Write-Ahead Logging) mode.
- **Dampak**: SQLite secara default mengabaikan foreign key, sehingga data bisa menjadi "orphan" atau tidak konsisten. Tanpa WAL, performa saat banyak user melakukan tulis data secara bersamaan akan sangat lambat (database lock).
- **Prioritas**: P1
- **Rekomendasi**: 
  - Tambahkan perintah `PRAGMA foreign_keys = ON;` dan `PRAGMA journal_mode = WAL;` pada saat inisialisasi koneksi database di `sqlite.ts`.

## 7. Scheduler / Batch Job
- **Temuan**: Scheduler menggunakan `setInterval` in-memory yang dibuat secara custom.
- **Dampak**: Job tidak persisten. Jika container restart tepat sebelum jadwal eksekusi, job tersebut akan terlewat. Jika running multiple instance, job akan dijalankan berkali-kali oleh setiap container (duplikasi pengiriman notifikasi/email).
- **Prioritas**: P1
- **Rekomendasi**: 
  - Gunakan library seperti `node-cron` untuk presisi waktu yang lebih baik.
  - Untuk skala produksi besar, pertimbangkan sistem antrian berbasis Redis (seperti `BullMQ`) untuk memastikan job hanya dijalankan satu kali secara handal.

## 8. Dokumentasi Operasional
- **Temuan**: Dokumentasi teknis untuk pengembang sudah cukup lengkap, namun SOP operasional untuk tim IT (cara restore data, cara update manual, cara bypass darurat) masih minim.
- **Dampak**: Penanganan insiden akan memakan waktu lama karena bergantung pada memori pengembang aslinya.
- **Status**: ✅ COMPLETED (April 2026)
- **Dokumentasi**: Tersedia di [OPERATIONAL_GUIDE.md](OPERATIONAL_GUIDE.md)
- **Rekomendasi**: 
  - Buat file `docs/SOP_OPERASIONAL.md` yang berisi langkah-langkah praktis penanganan masalah umum (Troubleshooting Guide).
  - Dokumentasikan semua Environment Variables yang dibutuhkan beserta kegunaannya.
