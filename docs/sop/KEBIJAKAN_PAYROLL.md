# Kebijakan Penggajian (Payroll) — Portal SDM

> **Acuan Regulasi:** PP No. 36/2021 tentang Pengupahan, PP No. 35/2021 tentang PKWT/Waktu Kerja, Permenaker No. 6/2016 tentang THR
> Berlaku untuk: Seluruh karyawan aktif | Disetujui oleh: Pimpinan Perusahaan

---

## 1. Komponen Gaji

| Komponen | Tipe | Keterangan |
|---|---|---|
| **Gaji Pokok** | Tetap | Minimal sesuai UMR/UMK setempat |
| **Tunjangan Jabatan** | Tetap | Sesuai level/grade |
| **Tunjangan Transport** | Tetap | Per kehadiran |
| **Tunjangan Makan** | Tetap | Per kehadiran |
| **Lembur** | Variabel | Dihitung berdasarkan jam kerja aktual |

## 2. Potongan Wajib

| Potongan | Besaran | Keterangan |
|---|---|---|
| **BPJS Kesehatan** | 1% gaji | Ditanggung pegawai (perusahaan 4%) |
| **BPJS Ketenagakerjaan** | 2% gaji | JHT ditanggung pegawai |
| **PPh 21** | Progresif | Sesuai tarif pajak berlaku |
| **Pinjaman Karyawan** | Cicilan/bulan | Sesuai tenor pinjaman |

## 3. Perhitungan Lembur (PP 35/2021)

| Jam Lembur | Hari Kerja | Hari Libur/Cuti |
|---|---|---|
| Jam ke-1 | 1.5 × upah/jam | 2 × upah/jam |
| Jam ke-2 dst | 2 × upah/jam | 2 × upah/jam |
| Jam ke-8+ (hari libur) | — | 3 × upah/jam |

**Rumus upah/jam:** Gaji Pokok / 173

## 4. Jadwal Pembayaran

| Aspek | Ketentuan |
|---|---|
| **Tanggal gaji** | Sesuai `company_settings.payrollDate` (default: 25) |
| **Metode** | Transfer bank / tunai |
| **Slip gaji** | Tersedia di Portal SDM → Gaji Saya |

## 5. THR (Tunjangan Hari Raya)

| Masa Kerja | Besaran THR |
|---|---|
| ≥ 12 bulan | 1 bulan gaji |
| 1–12 bulan | Prorata: (masa kerja / 12) × 1 bulan gaji |
| < 1 bulan | Tidak berhak (kecuali kebijakan perusahaan) |

**Waktu pembayaran:** Paling lambat 7 hari sebelum hari raya (Permenaker 6/2016).

## 6. Formula Gaji Bersih

```
Total Gaji Bersih =
    Gaji Pokok
  + Tunjangan Jabatan
  + Tunjangan Transport
  + Tunjangan Makan
  + Lembur
  - BPJS Kesehatan (1%)
  - BPJS TK/JHT (2%)
  - PPh 21
  - Cicilan Pinjaman
```

## 7. Konfigurasi di Sistem

Pengaturan payroll di menu **Pengaturan → Pengaturan Perusahaan**:
- `payrollDate` — Tanggal pembayaran gaji (default: 25)
- `bankName` — Nama bank perusahaan
- `bankAccountNumber` — Nomor rekening perusahaan

---

*Dokumen ini merupakan kebijakan resmi penggajian dan berlaku sampai ada perubahan.*
