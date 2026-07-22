export type LaporanStatus = 'pending' | 'completed';

export interface LaporanKepatuhanItem {
  id: number;
  nama_laporan: string;
  ketentuan?: string;
  periode?: string;
  tata_cara?: string;
  batas_akhir: string;
  bagian?: string;
  employee_id?: string;
  status: LaporanStatus;
  keterangan?: string;
  tanggal_diselesaikan?: string;
  lampiran?: string;
  created_at: string;
  updated_at: string;
  employee_name?: string; // from join
}

export interface CreateLaporanKepatuhanPayload {
  nama_laporan: string;
  ketentuan?: string;
  periode?: string;
  tata_cara?: string;
  batas_akhir: string;
  bagian?: string;
  employee_id?: string;
  keterangan?: string;
}

export interface UpdateLaporanKepatuhanPayload {
  nama_laporan?: string;
  ketentuan?: string;
  periode?: string;
  tata_cara?: string;
  batas_akhir?: string;
  bagian?: string;
  employee_id?: string;
  status?: LaporanStatus;
  keterangan?: string;
  tanggal_diselesaikan?: string;
  lampiran?: string;
}
