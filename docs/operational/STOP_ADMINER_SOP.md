# SOP: Menonaktifkan Adminer/SQLite-Web (Web-Based SQLite GUI)

## Ketika Selesai CRUD/Mengakses Database Production
1. **Pastikan tidak ada aktivitas critical di DB oleh admin lain.**
2. **Stop container tool GUI dengan perintah berikut, sesuai nama container:**
   - Adminer:  
     ```bash
     docker stop adminer-sqlite
     ```
   - SQLite Web:  
     ```bash
     docker stop sqlite-web
     ```
   - Jika lupa nama:
     ```bash
     docker ps
     docker stop <nama-container>
     ```
3. **Verifikasi:**
   - Pastikan container tidak muncul lagi di hasil `docker ps`.
   - Aplikasi backend tetap berjalan normal.

## Best Practice
- Jangan biarkan GUI database tool berjalan lama di production server.
- Selalu close port yang tidak perlu di firewall/cloud provider jika sudah selesai.

---

_Simpan SOP ini di instruksi operasional (devops/ops) ataupun section keamanan deployment._
