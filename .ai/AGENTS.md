# AGENTS.md — Portal SDM Next (sistem-manajemen-sdm)

Panduan wajib untuk AI coding agent (Claude, GPT, Gemini, dll.) yang bekerja di repo ini.
Baca file ini SEBELUM baca kode. Lalu baca `.ai/CONTEXT.md` untuk status terkini,
`.ai/MISTAKES.md` untuk hal yang sudah diketahui rusak/berisiko, dan `.ai/DECISIONS.md` untuk
alasan di balik keputusan arsitektural yang sudah dibuat.

> ⚠️ Dokumen `GEMINI.md` versi lama TERBUKTI mengandung klaim yang tidak sesuai kode aktual
> (mis. "semua rute pakai JWT", "validasi input pakai express-validator"). JANGAN percaya klaim
> arsitektur dari dokumentasi lama tanpa cross-check ke kode. Selalu tandai temuan sebagai
> HYPOTHESIS sampai diverifikasi ke file/baris kode aktual, baru upgrade ke VERIFIED.

---

## 0. Aturan Paling Penting: Recovery Freeze Rule

Proyek ini sedang dalam **Recovery Sprint terstruktur**, bukan pengembangan fitur bebas.

**Satu sprint hanya boleh menghasilkan SATU jenis perubahan.** Jangan pernah mencampur:
- perbaikan dokumentasi dengan perbaikan kode,
- refactor dengan fitur baru,
- fix keamanan dengan perubahan skema database,
dalam satu sesi/PR yang sama — kecuali diminta eksplisit oleh pemilik proyek.

Jika kamu menemukan bug kritis saat bekerja pada sprint dokumentasi: **catat di `.ai/MISTAKES.md`,
JANGAN diperbaiki di sesi yang sama.** Ada dua temuan kritis (SEC-02, SEC-04) yang SENGAJA
ditunda oleh pemilik proyek — jangan diam-diam "memperbaikinya" karena merasa itu benar secara
teknis. Tunggu instruksi eksplisit.

## 1. Arsitektur Proyek (ringkas — detail di `.ai/CONTEXT.md`)

- Monorepo tanpa workspaces: `apps/backend` (Node/Express/TypeScript) +
  `apps/frontend` (React/Vite/TypeScript), dependency dikelola terpisah.
- Backend pattern: Controller → Service → Repository per modul, di `src/modules/<nama>/`.
- Frontend pattern: per fitur di `src/features/<nn-nama>/{components,hooks,pages,api}`,
  shared code di `src/shared`.
- Database: SQLite, foreign keys ON, WAL mode ON.
- Auth: JWT (kecuali `/auth/*` publik dan `/integrations` pakai API key).
- Port dev: backend `3333`, frontend `5173` (Vite proxy).
- Port Docker: backend `3334:3333`, frontend `8081:8081`.

## 2. Sebelum Menulis/Mengubah Kode

1. Baca `.ai/CONTEXT.md` — pastikan pemahamanmu tentang status proyek sudah update.
2. Cek `.ai/MISTAKES.md` — pastikan kamu tidak akan menyentuh sesuatu yang sengaja ditunda,
   atau mengulangi kesalahan yang sudah pernah terjadi (mis. commit `node_modules`, mount SQLite
   langsung ke volume container).
3. Cek dokumentasi teknis existing sebelum menulis dokumentasi baru dari nol:
   `docs/architecture/MODULE_MAP.md`, `docs/api/API.md`, `docs/database/DATABASE.md`.
4. Kalau harus mengubah skema database: JANGAN copy file `.sqlite` langsung. Selalu buat file
   migrasi baru dan jalankan lewat mekanisme migrasi resmi (`npm run migrate`).
   **Perhatian**: `migrate.ts` saat ini TIDAK idempotent (DATA-01) — jalankan ulang bisa crash.
   Jangan gunakan `npm run reset` di data yang penting; itu menghapus semua data.

## 3. Menjalankan Proyek Secara Lokal

```bash
# Backend
cd apps/backend
npm install
cp .env.production.example .env   # lalu edit NODE_ENV, JWT_SECRET, dll. untuk lokal
npm run dev        # → http://localhost:3333

# Frontend (terminal terpisah)
cd apps/frontend
npm install
npm run dev        # → http://localhost:5173, auto-proxy /api, /uploads, /avatars,
                    #   /documents, /logos ke backend
```

Native module (`sqlite3`, `bcrypt`) harus dikompilasi di platform yang sama dengan tempat
menjalankan — jangan commit `node_modules` lintas platform (pernah terjadi, lihat MISTAKES.md
OPS-01). Kalau pindah environment (Windows → Linux dsb.), selalu `rm -rf node_modules && npm ci`.

## 4. Keamanan — Yang WAJIB Diperhatikan Walau Belum Diperbaiki

- Rute-rute berikut **belum** dilindungi JWT (SEC-02, sengaja ditunda):
  `/users`, `/employees`, `/leave-requests`, `/attendance`, `/payrolls`, `/contracts`,
  `/backup`, `/reports`, dan beberapa lainnya. Jangan berasumsi mereka aman saat menulis
  kode baru yang bergantung padanya.
- `POST /api/auth/register` menerima `role` mentah dari client (SEC-04, sengaja ditunda).
  Jangan gunakan endpoint ini untuk membuat admin di lingkungan apa pun yang terekspos publik.
- `docker-compose.yml` utama masih punya fallback `JWT_SECRET` default (SEC-01) — di produksi
  pastikan env `JWT_SECRET` SELALU di-set eksplisit oleh operator, jangan andalkan fallback.
- Jangan pernah commit `.env` atau file `*.sqlite` — sudah di-`.gitignore`, dan `WA_API_KEY`
  pernah bocor + sudah dirotasi. Jangan ulangi.

## 5. Konvensi Dokumentasi

- Bahasa: campuran Indonesia/Inggris diterima, tapi USAHAKAN Bahasa Indonesia untuk dokumen
  proses/keputusan (`.ai/*`, `docs/audit/*`), Inggris boleh untuk istilah teknis standar.
- Setiap klaim arsitektural di dokumentasi HARUS punya bukti (`file:line`) — pola
  "VERIFIED (path/file.ts:12-18)" yang sudah dipakai di `PROJECT_MANIFEST.md` dan checklist
  recovery adalah standar yang harus diikuti untuk dokumentasi baru.
- Update `.ai/SESSION_LOG.md` di akhir setiap sesi kerja (append di atas, jangan edit log lama).
- Update `.ai/DECISIONS.md` hanya untuk keputusan yang final dan sulit dibalik — bukan untuk
  narasi proses (itu tempatnya di SESSION_LOG.md).

## 6. Kontak/Otoritas Keputusan

Keputusan yang berdampak pada scope sprint (mis. "boleh mulai perbaiki SEC-02 sekarang?") harus
mendapat izin eksplisit dari pemilik proyek (Muzod) — jangan asumsikan izin dari konteks
percakapan lama.
