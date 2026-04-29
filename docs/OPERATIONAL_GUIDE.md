# Panduan Operasional IT - Portal SDM v3

Dokumen ini berisi prosedur standar operasional (SOP) untuk tim IT dalam mengelola, memelihara, dan menangani insiden pada sistem Portal SDM v3 di lingkungan produksi.

## 1. Manajemen Database (Backup & Restore)

Sistem menggunakan SQLite yang disimpan di dalam volume Docker `backend_data`.

### A. Backup Otomatis
- **Jadwal**: Setiap hari pukul 02:00 WIB.
- **Lokasi**: `/backups/db/` di dalam container `portal_sdm_backend`.
- **Retensi**: File dinamai dengan format `backup-YYYY-MM-DD_HH-mm-ss.sqlite`.

### B. Backup Manual (via UI)
1. Login sebagai **Admin**.
2. Buka menu **Laporan & Sistem > Backup & Restore**.
3. Klik tombol **BUAT BACKUP SEKARANG**.
4. Unduh file jika diperlukan untuk penyimpanan offline.

### C. Backup Manual (via CLI - Jika UI tidak bisa diakses)
Jika sistem tidak bisa diakses via browser:
```bash
# Buat salinan langsung dari file database aktif
docker cp portal_sdm_backend:/data/database.sqlite ./manual_backup_$(date +%F).sqlite
```

### C. Prosedur Restore (Kondisi Darurat)
Jika sistem mengalami kerusakan data atau kegagalan update:
1. Buka menu **Backup & Restore**.
2. Pilih file cadangan yang stabil dari daftar.
3. Klik ikon **Restore** (tombol putar).
4. **Penting**: Sistem akan membuat *Safety Backup* otomatis dari kondisi saat ini sebelum menimpanya dengan data lama.

---

## 2. Pemeliharaan & Update Sistem

### A. Alur Update Kode
1. Lakukan perubahan di lingkungan lokal.
2. Push ke branch yang sesuai.
3. Jalankan skrip deploy di server:
   ```bash
   ./deploy.ps1
   ```

### B. Menjalankan Migrasi Manual
Jika ada perubahan skema database yang tidak otomatis berjalan:
```bash
docker exec portal_sdm_backend node scripts/run_migrations.js
```

### C. Reset Database (Hanya untuk Development!)
> [!CAUTION]
> Jangan jalankan ini di server produksi karena akan menghapus seluruh data.
```bash
docker exec portal_sdm_backend npm run reset
```

---

## 3. Monitoring & Logging

### A. Cek Status Container
```bash
docker compose ps
```

### B. Melihat Log Real-time
Untuk memantau error atau aktivitas user:
- **Backend**: `docker logs -f portal_sdm_backend`
- **Frontend**: `docker logs -f portal_sdm_frontend`

### C. Audit Log
Aktivitas sensitif (login, hapus data, ubah gaji) dapat dipantau via UI:
- Menu **Laporan & Sistem > Audit Log**.
- Gunakan filter **Device** untuk mendeteksi akses mencurigakan dari perangkat tidak dikenal.

---

## 4. Penanganan Insiden Umum

### A. Database Locked (SQLITE_BUSY)
**Penyebab**: Terlalu banyak proses tulis bersamaan atau transaksi yang menggantung.
**Solusi**:
1. Restart container backend: `docker restart portal_sdm_backend`.
2. Pastikan **WAL Mode** aktif (sudah diaktifkan sejak April 2026).

### B. Error Foreign Key Mismatch
**Penyebab**: Perubahan skema yang tidak sinkron antara tabel induk dan anak.
**Solusi**: Jalankan skrip perbaikan skema:
```bash
docker exec portal_sdm_backend node scripts/fix_log_fk.js
```

### C. Lupa Password Admin Utama
Jika admin tidak bisa login:
1. Masuk ke shell database:
   ```bash
   docker exec -it portal_sdm_backend npx sqlite3 /data/database.sqlite
   ```
2. Reset password (misal menjadi 'password123' - *pastikan menggunakan hash bcrypt jika sistem mewajibkan*):
   *Disarankan menggunakan script `scripts/reset_admin_pw.js` jika tersedia.*

---

## 5. Variabel Lingkungan (Environment Variables)

File `.env` di root project harus dikelola dengan hati-hati:
- `JWT_SECRET`: Kunci enkripsi token. Jangan gunakan default di produksi.
- `DB_SOURCE`: Path ke database (default: `/data/database.sqlite`).
- `CORS_ORIGIN`: Alamat frontend yang diizinkan (pisahkan dengan koma).
