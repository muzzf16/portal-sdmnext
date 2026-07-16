# Rencana Implementasi: Optimasi Cetak PDF Monitoring KPI

## 1. Tujuan
Mengurangi jumlah halaman pada hasil cetak (PDF) halaman Monitoring KPI yang saat ini memakan hingga 4 halaman. Optimasi dilakukan dengan memadatkan tata letak (layout) dan menyesuaikan ukuran teks *khusus pada saat mode cetak (print)* tanpa mengubah tampilan pada layar monitor.

## 2. File yang Akan Diubah
- `apps/frontend/src/features/06-kinerja/components/KpiMonitoringView.tsx`

## 3. Detail Perubahan Tampilan (Mode Cetak)
Untuk mencapai tata letak yang lebih ringkas di PDF, kita akan menambahkan *utility classes* `print:` dari Tailwind CSS. Detailnya sebagai berikut:

### A. Container Utama & Header
- **Saat ini:** Memiliki margin, padding besar, dan bayangan (shadow).
- **Perubahan:** Menghilangkan padding, margin, dan bayangan di mode cetak (`print:p-0 print:m-0 print:shadow-none`).
- **Dampak:** Menghemat ruang di bagian atas dan pinggir kertas.

### B. Kartu Ringkasan (Beban Kerja, KPI Khusus, Total)
- **Saat ini:** Menggunakan `grid-cols-1 md:grid-cols-3`. Tergantung ukuran kertas, ini seringkali di-render menumpuk ke bawah (1 kolom) oleh browser saat mencetak.
- **Perubahan:** Memaksa menjadi 3 kolom sejajar di mode cetak dengan menambahkan `print:grid-cols-3`. Margin bawah juga dikurangi `print:mb-4`.
- **Dampak:** Ketiga kartu akan selalu berjejer ke samping di halaman pertama PDF, sangat menghemat ruang vertikal.

### C. Tabel Rincian (WLA & KPI Khusus)
- **Saat ini:** Menggunakan `grid-cols-1 lg:grid-cols-2`. Di PDF, tabel WLA dan KPI Khusus sering merender atas-bawah. Padding dalam sel tabel juga cukup lebar (`py-3`).
- **Perubahan:** 
  1. Memaksa tabel sejajar kiri-kanan dengan `print:grid-cols-2`.
  2. Mengecilkan font tabel (`print:text-[10px]` atau `print:text-xs`).
  3. Mengurangi padding dalam sel tabel (menjadi `print:py-1 print:px-2`).
  4. Mencegah baris terpotong antar halaman dengan `print:break-inside-avoid` pada tag `<tr>` dan `<tbody>`.
- **Dampak:** Tabel menjadi sangat padat, lebih banyak baris yang muat di satu halaman, dan kedua tabel tampil bersebelahan.

### D. Area Tanda Tangan
- **Saat ini:** Jarak dari tabel ke tanda tangan sangat jauh (`mt-16` / margin-top).
- **Perubahan:** Mengurangi jarak tersebut menjadi `print:mt-6` dan mengurangi jarak tinggi tanda tangan `print:mb-12` (dari `mb-24`).
- **Dampak:** Area tanda tangan menempel rapi di bawah tabel tanpa membuang area kosong berlebihan yang bisa memicu halaman baru.

## 4. Dampak Sistem (Impact Analysis)
- **Tampilan UI Web:** **TIDAK ADA DAMPAK**. Tampilan di layar monitor (desktop/mobile) tidak akan berubah sama sekali karena semua modifikasi hanya menggunakan kelas `print:` (CSS `@media print`).
- **Fungsionalitas:** Tidak ada perubahan logika, perhitungan (kalkulasi WLA/KPI), maupun pengambilan data (fetch API). Perubahan murni pada presentasi (CSS).
- **Hasil PDF:** Jumlah halaman akan turun drastis (kemungkinan besar menjadi 1 atau maksimal 2 halaman, tergantung banyaknya rincian aktivitas WLA pegawai tersebut).

---
*Silakan tinjau rencana di atas. Jika Anda setuju dengan pendekatan ini, saya akan mulai menerapkan perubahan tersebut ke dalam kode.*
