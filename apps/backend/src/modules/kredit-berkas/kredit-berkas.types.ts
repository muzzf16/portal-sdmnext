export type KreditStage = 
    | 'penerimaan'         // 1. CS/AO/Marketing - Terima berkas awal
    | 'slik'               // 2. Admin Kredit - Pengecekan SLIK/iDEB
    | 'delegasi_survey'    // 3. Kabid Kredit - Delegasikan surveyor
    | 'ots'                // 4. Marketing/Analis - On The Spot survey
    | 'komite_kredit'      // 5. Komite Kredit - Rapat keputusan awal
    | 'mak_agunan'         // 6. Marketing/Analis - MAK + penilaian agunan
    | 'approval_keputusan' // 7. KABID - Persetujuan & Keputusan Final
    | 'admin_spk'          // 8. Admin Kredit - SPK dll
    | 'pencairan'          // 9. Teller/Kasir - Proses pencairan
    | 'selesai'            // Terminal: pencairan selesai
    | 'ditolak_cs'         // Terminal: dikembalikan ke CS untuk penanganan
    // Legacy support:
    | 'analisa' | 'verifikasi' | 'admin_pencairan';

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
    assigned_employee_id?: string;
}
