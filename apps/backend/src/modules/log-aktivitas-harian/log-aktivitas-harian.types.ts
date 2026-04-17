export type LogApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface CreateLogAktivitasPayload {
  id_pegawai: string | number;
  tanggal: string;
  id_activity_library: string | number;
  frekuensi: number;
  catatan?: string;
  lampiran?: string;
  nominal_rupiah?: number;
}

export interface CreateBulkLogAktivitasPayload {
  id_pegawai: string | number;
  tanggal: string;
  logs: CreateLogAktivitasPayload[];
}

export interface LogAktivitasHarianItem {
  id_log: number;
  id_pegawai: number;
  tanggal: string;
  id_activity_library: string | number;
  frekuensi: number;
  total_durasi_terhitung: number;
  status_approval?: LogApprovalStatus | null;
  catatan?: string | null;
  lampiran?: string | null;
  nominal_rupiah?: number;
  created_at?: string;
  updated_at?: string;
  activityName?: string;
  durationMinutes?: number;
  outputUnit?: string;
  category?: string;
}

export interface LogAktivitasSummary {
  total_aktivitas: number;
  total_durasi_menit: number;
}

export interface AdminWlaSummaryRow {
  id_pegawai: number;
  nama_lengkap: string;
  nip: string;
  jabatan: string;
  departemen: string;
  total_aktivitas: number;
  total_durasi_menit: number;
  jumlah_log: number;
  pending_log_count: number;
  approved_log_count: number;
}
