# PANDUAN AGEN AI (AI WORKFLOW PROTOCOL)

1. **JANGAN MERUBAH KODE LANGSUNG KE MAIN/PRODUCTION BRANCH.** Semua pekerjaan (fitur atau perbaikan) harus dilakukan di branch fitur terpisah (`feature/nama-fitur`).
2. **BACA DULU, JANGAN ASAL UBAH.** Project ini sudah berada di tahap production dengan user aktif. Pastikan untuk selalu membaca konteks (terutama file di dalam folder `.ai/`) sebelum merencanakan perubahan.
3. **ZONA BAHAYA.** Perhatikan daftar "File yang Tidak Boleh Disentuh" di `.ai/CONTEXT.md`. Jika perubahan diperlukan di zona tersebut, pastikan memiliki alasan kuat, sampaikan risikonya, dan minta validasi ulang kepada pengguna.
4. **PERIKSA DEPENDENSI DULU.** Sebelum menginstal library baru, pastikan apakah library serupa sudah tersedia di `package.json` (frontend atau backend).
5. **JANGAN OVERWRITE DATABASE DI DOCKER.** Seperti yang tercantum di `.ai/MISTAKES.md`, jangan pernah menggunakan file lokal `database.sqlite` untuk menimpa volume docker. Gunakan skrip migrasi!
6. **UPDATE MEMORI.** Setiap kali sebuah fitur selesai atau sebuah keputusan besar diambil, mutakhirkan file `.ai/SESSION_LOG.md` dan `.ai/DECISIONS.md`.
