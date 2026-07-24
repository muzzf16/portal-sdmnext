export type LaporanStatus = 'pending' | 'completed';

export interface LaporanKepatuhanItem {
  id: number;
  nama_laporan: string;
  ketentuan?: string;
  periode?: string;
  tata_cara?: string;
  batas_akhir: string; // ISO date string
  bagian?: string;
  employee_id?: number | string;
  status: LaporanStatus;
  keterangan?: string;
  lampiran?: string;
  created_at?: string;
  updated_at?: string;
  // Included from join
  employee_name?: string;
  supervisor_name?: string;
}

export interface CreateLaporanKepatuhanPayload {
  nama_laporan: string;
  ketentuan?: string;
  periode?: string;
  tata_cara?: string;
  batas_akhir: string;
  bagian?: string;
  employee_id?: number | string;
  status?: LaporanStatus;
  keterangan?: string;
}

export interface UpdateLaporanKepatuhanPayload extends Partial<CreateLaporanKepatuhanPayload> {
  lampiran?: File | string | null;
}
