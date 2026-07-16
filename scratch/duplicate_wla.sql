INSERT INTO log_aktivitas_harian (
    id_pegawai, 
    tanggal, 
    id_activity_library, 
    frekuensi, 
    total_durasi_terhitung, 
    status_approval, 
    catatan, 
    lampiran, 
    nominal_rupiah
)
SELECT 
    id_pegawai, 
    '2026-07-10', 
    id_activity_library, 
    frekuensi, 
    total_durasi_terhitung, 
    status_approval, 
    catatan, 
    lampiran, 
    nominal_rupiah
FROM log_aktivitas_harian
WHERE tanggal = '2026-07-09';

SELECT tanggal, COUNT(*) FROM log_aktivitas_harian GROUP BY tanggal ORDER BY tanggal DESC LIMIT 5;
