export type KreditStage = 'penerimaan' | 'analisa' | 'verifikasi' | 'admin_pencairan' | 'selesai';
export type KreditStatus = 'dalam_proses' | 'lengkap' | 'ditolak' | 'dicairkan';
export type BerkasStatus = 'lengkap' | 'belum_lengkap' | 'ditolak';

export interface KreditBerkas {
    id?: number;
    nomor_pengajuan: string;
    nama_pengajuan: string;
    jumlah_pengajuan: number;
    jenis_kredit: string;
    current_stage: KreditStage;
    overall_status: KreditStatus;
    created_by: string;
    created_at?: string;
    updated_at?: string;
    catatan?: string;
}

export interface KreditBerkasTracking {
    id?: number;
    berkas_id: number;
    stage: KreditStage;
    employee_id: string;
    employee_name?: string;
    position?: string;
    status_berkas: BerkasStatus;
    received_at?: string;
    completed_at?: string;
    catatan?: string;
}

export interface CreateKreditBerkasDto {
    nama_pengajuan: string;
    jumlah_pengajuan?: number;
    jenis_kredit?: string;
    status_berkas: BerkasStatus;
    catatan?: string;
}

export interface UpdateKreditStageDto {
    status_berkas: BerkasStatus;
    catatan?: string;
}
