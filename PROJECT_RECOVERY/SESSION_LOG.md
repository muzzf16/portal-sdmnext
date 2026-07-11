## Sprint 0

Tanggal:
2026-07-11

Status:
Completed (Sprint 0 Selesai)

Deliverables:
- ✅ Project Manifest (`PROJECT_MANIFEST.md`)
- ✅ Repository Audit (`REPOSITORY_AUDIT.md`)
- ✅ Production Verification & Local Smoke Test (PASS)
- ✅ Repo Hygiene (untrack `node_modules`, `.env`, and backup `.sqlite` files)
- ✅ Sprint 00 Summary (`SPRINT_00_SUMMARY.md`)

Temuan Penting:
- Local Smoke Test gagal awalnya karena executable bit hilang pada `ts-node-dev` dan `sqlite3` kompilasi Windows (PE32+ DLL). Masalah diatasi dengan membersihkan pelacakan Git (`git rm --cached`) dan `npm ci` lokal.
- `WA_API_KEY` sempat ter-expose di git history, dikonfirmasi telah dirotasi per 11 Juli 2026.
- `JWT_SECRET` produksi pada server lokal telah diverifikasi aman (nilai kustom/acak).
- Celah bypass `JWT_SECRET` terdeteksi di `docker-compose.yml:15` akibat fallback default, dicatat di Risk Register prioritas tinggi.
- History git lama (269 MB) masih menyimpan objek lama. History rewrite (BFG/filter-repo) dicatat sebagai perbaikan prioritas menengah yang belum dieksekusi.

Keputusan:
- Sprint 0 secara resmi ditutup karena baseline pemulihan dan pengujian awal telah PASS.
- Tidak ada perubahan business/source code selama Sprint 0.

Commit:
- 69615d5dececc872a0d210cdcb51fca072536ad6

Next Sprint:
- Sprint 1 (Feature Restoration & Verification) — siap dilanjutkan di sesi berikutnya (Sprint 1 belum dimulai).