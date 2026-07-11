# Implementation Plan

## Chosen Solution
Option 1

## Reason
Perubahan paling kecil.
Risiko paling rendah.
Tidak mengubah struktur storage production.

## File yang akan berubah
- `apps/backend/src/modules/pegawai/pegawai.controller.ts`
- `apps/backend/src/modules/pegawai/pegawai.auth.controller.ts`

## Database
Tidak berubah.

## Migration
Update URL avatar lama (Menghapus prefix `/uploads` dari `/uploads/avatars/` menjadi `/avatars/`).

## Rollback
`git revert`
Kembalikan backup database.

## Risk
Very Low
