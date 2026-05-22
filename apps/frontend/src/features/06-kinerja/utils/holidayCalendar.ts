/**
 * Kalender Hari Libur Nasional Indonesia
 * Update setiap tahun sesuai Keppres/SK Bersama Menteri.
 *
 * Format: 'YYYY-MM-DD'
 */
export const NATIONAL_HOLIDAYS: Record<string, string[]> = {
  '2025': [
    '2025-01-01', // Tahun Baru Masehi
    '2025-01-27', // Isra Mikraj Nabi Muhammad SAW
    '2025-01-29', // Tahun Baru Imlek 2576
    '2025-03-29', // Hari Raya Nyepi (Tahun Baru Saka 1947)
    '2025-03-31', // Idul Fitri 1446 H (H-1)
    '2025-04-01', // Idul Fitri 1446 H
    '2025-04-02', // Idul Fitri 1446 H (H+1)
    '2025-04-03', // Idul Fitri 1446 H (H+2)
    '2025-04-07', // Cuti Bersama Idul Fitri
    '2025-04-18', // Wafat Isa Al-Masih (Good Friday)
    '2025-05-01', // Hari Buruh Internasional
    '2025-05-12', // Hari Raya Waisak 2569
    '2025-05-13', // Cuti Bersama Waisak
    '2025-05-29', // Kenaikan Isa Al-Masih
    '2025-06-01', // Hari Lahir Pancasila
    '2025-06-06', // Idul Adha 1446 H
    '2025-06-27', // Tahun Baru Islam 1447 H
    '2025-08-17', // Hari Kemerdekaan Republik Indonesia
    '2025-09-05', // Maulid Nabi Muhammad SAW
    '2025-12-25', // Hari Raya Natal
    '2025-12-26', // Cuti Bersama Natal
  ],
  '2026': [
    '2026-01-01', // Tahun Baru Masehi
    '2026-01-16', // Isra Mikraj Nabi Muhammad SAW
    '2026-02-17', // Tahun Baru Imlek 2577
    '2026-03-19', // Hari Raya Nyepi (Tahun Baru Saka 1948)
    '2026-03-20', // Wafat Isa Al-Masih (Good Friday)
    '2026-03-27', // Idul Fitri 1447 H (H-1)
    '2026-03-28', // Idul Fitri 1447 H
    '2026-03-29', // Idul Fitri 1447 H (H+1)
    '2026-03-30', // Idul Fitri 1447 H (H+2)
    '2026-05-01', // Hari Buruh Internasional
    '2026-05-14', // Kenaikan Isa Al-Masih
    '2026-05-15', // Cuti Bersama Kenaikan Isa Al-Masih
    '2026-05-18', // Hari Raya Waisak 2570
    '2026-05-27', // Idul Adha 1447 H
    '2026-06-01', // Hari Lahir Pancasila
    '2026-06-16', // Tahun Baru Islam 1448 H
    '2026-08-17', // Hari Kemerdekaan Republik Indonesia
    '2026-08-26', // Maulid Nabi Muhammad SAW
    '2026-12-24', // Cuti Bersama Natal
    '2026-12-25', // Hari Raya Natal
  ],
};

/**
 * Hitung hari kerja efektif antara dua tanggal (inklusif).
 * Mengecualikan: Sabtu, Minggu, dan Hari Libur Nasional.
 *
 * @param start - tanggal awal format 'YYYY-MM-DD'
 * @param end   - tanggal akhir format 'YYYY-MM-DD'
 * @returns jumlah hari kerja efektif (minimum 1)
 */
export const getEffectiveWorkingDays = (start: string, end: string): number => {
  const startObj = new Date(start + 'T00:00:00');
  const endObj = new Date(end + 'T00:00:00');
  let count = 0;
  let cur = new Date(startObj.getTime());

  while (cur <= endObj) {
    const dayOfWeek = cur.getDay(); // 0=Min, 6=Sab
    const dateStr = cur.toISOString().slice(0, 10);
    const year = dateStr.slice(0, 4);
    const holidays = NATIONAL_HOLIDAYS[year] ?? [];

    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isHoliday = holidays.includes(dateStr);

    if (!isWeekend && !isHoliday) {
      count++;
    }
    cur.setDate(cur.getDate() + 1);
  }

  return count > 0 ? count : 1;
};

/**
 * Dapatkan daftar hari libur nasional dalam rentang tanggal tertentu.
 * Berguna untuk ditampilkan ke user sebagai keterangan.
 */
export const getHolidaysInRange = (start: string, end: string): string[] => {
  const startObj = new Date(start + 'T00:00:00');
  const endObj = new Date(end + 'T00:00:00');
  const result: string[] = [];
  let cur = new Date(startObj.getTime());

  while (cur <= endObj) {
    const dateStr = cur.toISOString().slice(0, 10);
    const year = dateStr.slice(0, 4);
    const holidays = NATIONAL_HOLIDAYS[year] ?? [];
    if (holidays.includes(dateStr)) {
      result.push(dateStr);
    }
    cur.setDate(cur.getDate() + 1);
  }

  return result;
};
