## Sprint 1

Tanggal:
2026-07-11

Status:
Completed (Sprint 1 Selesai)

Deliverables:
- ✅ Peta Modul Komprehensif (`docs/architecture/MODULE_MAP.md`)
- ✅ Dokumentasi Balik API (`docs/api/API.md`)
- ✅ Dokumentasi Balik Database (`docs/database/DATABASE.md`)
- ✅ Ringkasan Temuan Keamanan (`PROJECT_RECOVERY/SECURITY_FINDINGS_SUMMARY.md`)
- ✅ Checklist Proyek Terupdate (`PROJECT_RECOVERY/CHECKLIST.md`)

Temuan Penting:
- **SEC-02**: Bypass JWT pada 8 rute modul penting di backend.
- **SEC-04**: Privilege Escalation via Self-Registration (`role` langsung dari request body).
- **DATA-01**: Skrip migrasi non-idempotent yang berisiko merusak data produksi (*data loss*).
- **Ketiadaan DB CHECK Constraint**: Kolom `role` pada tabel `pengguna` tidak diamankan dengan CHECK constraint.
- **Frontend Axios Bypass**: Tiga file service frontend (`company-settings.service.ts`, `backup.service.ts`, dan `pengguna.service.ts`) terbukti mem-bypass interceptor JWT dengan memanggil library Axios mentah secara langsung.

Commit Terakhir:
- 73d3b9da (Sprint 1 Tugas 4 - Update CHECKLIST.md & create SECURITY_FINDINGS_SUMMARY.md)

Next Sprint:
- Sprint 2 (Security Fixes & Database Robustness) — Siap dilanjutkan ke perbaikan backend & frontend.

---

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