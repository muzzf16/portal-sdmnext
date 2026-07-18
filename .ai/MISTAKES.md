## CATATAN MASALAH / KESALAHAN YANG PERNAH TERJADI

1. **BAHAYA KEHILANGAN DATA (DOCKER):**
   Ada peringatan keras di README: File `database.sqlite` di lokal sepenuhnya terpisah dari file database di dalam container Docker. JANGAN PERNAH menyalin (overwrite) `database.sqlite` lokal ke dalam volume Docker di production. Ini akan menghapus semua pengguna, absensi, dan data aplikasi secara permanen. Untuk mengubah struktur tabel di Production/Docker, selalu gunakan Migration Scripts (`node run_migrations.js`), jangan pernah menimpa file utamanya.
