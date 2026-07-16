# DECISIONS.md — Portal SDM Next

> Log keputusan arsitektural/proses yang PENTING dan SULIT DIBALIK.
> Format: D-XXX, tanggal, konteks, keputusan, alasan, alternatif yang ditolak.
> JANGAN dihapus/diedit setelah dicatat — kalau keputusan berubah, catat entri BARU yang
> mereferensikan entri lama.

---

### D-001 — Monorepo tanpa npm workspaces
**Tanggal**: (pra-recovery, warisan proyek)
**Keputusan**: `apps/backend` dan `apps/frontend` tetap dikelola sepenuhnya terpisah — masing-masing
punya `package.json` dan `package-lock.json` sendiri, tidak pakai npm/yarn workspaces di root.
**Alasan**: Kesederhanaan deploy independen (backend & frontend punya siklus rilis/Docker image
sendiri), menghindari kerumitan resolusi dependency lintas-package.
**Status**: Dipertahankan pada Recovery Sprint — tidak diubah tanpa alasan kuat.

---

### D-002 — Recovery via dokumentasi dulu, bukan langsung fix bug
**Tanggal**: 2026-07-11
**Konteks**: Sprint 0 (audit) menemukan banyak temuan kritis (SEC-02, SEC-04, DATA-01, dll.)
sekaligus repo hygiene issues (node_modules ter-track, secrets ter-expose, file SQLite berserakan).
**Keputusan**: Urutan pemulihan proyek adalah: (1) Sprint 0 — discovery & repo hygiene murni,
(2) Sprint 1 — reverse documentation (Module Map, API.md, DATABASE.md, Security Summary),
(3) baru sprint berikutnya — perbaikan kode/keamanan.
**Alasan**: Tanpa baseline dokumentasi yang akurat (bukan asumsi dari `GEMINI.md`/`AGENTS.md` lama
yang ternyata banyak mismatch), perbaikan kode berisiko salah sasaran atau merusak alur yang
sebenarnya sudah berfungsi.
**Alternatif ditolak**: Langsung tambal SEC-02/SEC-04 di Sprint 0 — ditolak karena melanggar
prinsip "satu sprint satu jenis perubahan" (lihat D-003) dan risiko dampak yang belum terpetakan
penuh.

---

### D-003 — Recovery Freeze Rule: satu sprint = satu jenis perubahan
**Tanggal**: 2026-07-11
**Keputusan**: Setiap sprint recovery hanya boleh menghasilkan SATU kategori perubahan
(contoh: sprint dokumentasi tidak boleh menyentuh kode fix, sprint code-fix tidak boleh sambil
menulis dokumentasi baru dari nol).
**Alasan**: Mencegah scope creep dan mencampur perubahan yang sulit di-review/di-rollback secara
terpisah, terutama karena sistem ini sudah production dan dipakai sehari-hari.
**Konsekuensi**: SEC-02 dan SEC-04 (kritis) SENGAJA DITUNDA meski berisiko tinggi, karena masih
dalam fase dokumentasi. Ini keputusan sadar pemilik proyek, bukan kelalaian — lihat MISTAKES.md
untuk detail risiko yang diterima.

---

### D-004 — Git hygiene: untrack, jangan hapus riwayat dulu
**Tanggal**: 2026-07-11 (commit `578d4ebc`)
**Keputusan**: `node_modules`, `.env` (root & backend), dan file `.sqlite` backup di-`git rm --cached`
(untrack) dan ditambahkan ke `.gitignore`, TAPI history rewrite (BFG/git-filter-repo) untuk
membersihkan 269 MB riwayat lama **ditunda**.
**Alasan**: Untrack cukup untuk menghentikan pendarahan aktif (working tree bersih ke depan).
History rewrite butuh koordinasi re-clone di semua environment (lokal, server dev, server
produksi) agar tidak merusak sinkronisasi — risikonya lebih besar daripada manfaat jangka pendek.
**Mitigasi tambahan yang dilakukan sebagai pengganti**: rotasi `WA_API_KEY` secara resmi (karena
key itu tetap ada di history lama meski file sudah di-untrack).

---

### D-005 — Instalasi ulang dependency backend via `npm ci` di host Linux
**Tanggal**: 2026-07-11 (Sprint 0 smoke test)
**Konteks**: `node_modules` backend sebelumnya ter-commit dari Windows, menyebabkan wrapper
script `.bin` gagal dieksekusi di Linux dan native binding (`sqlite3`, `bcrypt`) error
"invalid ELF header".
**Keputusan**: Hapus total `node_modules` lokal, install ulang dengan `npm ci` di host Ubuntu
agar native module dikompilasi ulang sesuai target platform.
**Alasan**: `npm ci` menghormati `package-lock.json` persis dan memaksa build native module
sesuai environment saat ini, bukan binary lama yang ikut ter-commit.
**Hasil**: Smoke test PASS untuk backend & frontend.

---

<!-- Tambahkan entri baru di bawah ini, jangan sisipkan di tengah -->
