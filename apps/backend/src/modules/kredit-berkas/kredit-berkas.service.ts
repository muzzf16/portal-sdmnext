import { KreditBerkasRepository } from './kredit-berkas.repository';
import { KreditWaNotificationService } from './kredit-wa-notification.service';
import { PegawaiRepository } from '../pegawai/pegawai.repository';
import { 
    CreateKreditBerkasDto, 
    UpdateKreditStageDto, 
    KreditBerkas, 
    KreditBerkasTracking, 
    KreditStage,
    KreditStatus 
} from './kredit-berkas.types';

const STAGE_FLOW: Record<string, KreditStage | null> = {
    'penerimaan': 'slik',
    'slik': 'delegasi_survey',
    'delegasi_survey': 'ots',
    'ots': 'komite_kredit',
    'komite_kredit': 'mak_agunan',      
    'mak_agunan': 'approval_keputusan',
    'approval_keputusan': 'admin_spk', 
    'admin_spk': 'pencairan',
    'pencairan': 'selesai',
    'ditolak_cs': 'slik', // Flow back to active pipeline
    // Legacy support transitions (Linear)
    'analisa': 'verifikasi',
    'verifikasi': 'admin_pencairan',
    'admin_pencairan': 'selesai'
};

export const KreditBerkasService = {
    async create(employeeId: string, dto: CreateKreditBerkasDto) {
        const employee = await PegawaiRepository.findById(employeeId);
        const nomor = await KreditBerkasRepository.generateNomor();

        const berkas: KreditBerkas = {
            nomor_pengajuan: nomor,
            nama_pengajuan: dto.nama_pengajuan,
            jumlah_pengajuan: dto.jumlah_pengajuan || 0,
            jenis_kredit: dto.jenis_kredit || 'Umum',
            no_wa_nasabah: dto.no_wa_nasabah,
            current_stage: 'penerimaan',
            overall_status: 'dalam_proses',
            created_by: employeeId,
            catatan: dto.catatan
        };

        const berkasId = await KreditBerkasRepository.create(berkas);
        if (!berkasId) throw new Error('Gagal membuat berkas');

        // Add first tracking record
        const tracking: KreditBerkasTracking = {
            berkas_id: berkasId,
            stage: 'penerimaan',
            employee_id: employeeId,
            employee_name: employee?.name || 'Unknown',
            position: employee?.position || 'Customer Service',
            status_berkas: dto.status_berkas,
            completed_at: dto.status_berkas === 'lengkap' ? new Date().toISOString() : undefined,
            catatan: dto.catatan
        };

        await KreditBerkasRepository.addTracking(tracking);

        if (!berkasId) throw new Error('Gagal menyimpan data pengajuan');

        // Kirim notifikasi WA: berkas diterima (fire-and-forget)
        KreditWaNotificationService.notifyBerkasReceived(berkasId);

        return this.getById(berkasId);
    },

    async getById(id: number) {
        const berkas = await KreditBerkasRepository.findById(id);
        if (!berkas) return null;
        
        const tracking = await KreditBerkasRepository.getTracking(id);
        return { ...berkas, tracking };
    },

    async getAll(filters: any) {
        return KreditBerkasRepository.findAll(filters);
    },

    async getPendingForUser(employeeId: string) {
        const employee = await PegawaiRepository.findById(employeeId);
        if (!employee) return [];

        const position = employee.position.toLowerCase();
        const isCreditFlow = 
            position.includes('marketing') || position.includes('analis') || 
            position.includes('kabid kredit') || position.includes('adminitrasi') || 
            position.includes('adm kredit') || position.includes('customer service') || 
            position.includes('cs') || position.includes('teller') || 
            position.includes('kasir'); // Removed 'direktur'

        if (!isCreditFlow) return [];

        return KreditBerkasRepository.getPendingByStage();
    },

    async processStage(id: number, employeeId: string, dto: UpdateKreditStageDto) {
        const berkas = await KreditBerkasRepository.findById(id);
        if (!berkas) throw new Error('Berkas tidak ditemukan');

        if (berkas.current_stage === 'selesai' || berkas.overall_status === 'dicairkan' || berkas.overall_status === 'ditolak') {
            throw new Error('Berkas sudah selesai diproses atau ditolak');
        }

        const employee = await PegawaiRepository.findById(employeeId);
        const currentStage = berkas.current_stage;

        // 1. Find the current tracking row for this stage
        const trackingList = await KreditBerkasRepository.getTracking(id);
        let currentTracking = trackingList.find(t => t.stage === currentStage && !t.completed_at);

        if (!currentTracking) {
            currentTracking = [...trackingList]
                .filter(t => t.stage === currentStage)
                .sort((a, b) => new Date(b.received_at).getTime() - new Date(a.received_at).getTime())[0];
        }

        // 2. Handle Branching (Tolak)
        if (dto.status_berkas === 'ditolak') {
            if (currentTracking?.id) {
                await KreditBerkasRepository.updateTracking(currentTracking.id, {
                    employee_id: employeeId,
                    employee_name: employee?.name,
                    position: employee?.position,
                    status_berkas: 'ditolak',
                    completed_at: new Date().toISOString(),
                    catatan: dto.catatan
                });
            }

            // Rejection at stage 5 (komite) or 7 (approval_keputusan) goes back to CS
            if (currentStage === 'komite_kredit' || currentStage === 'approval_keputusan') {
                await KreditBerkasRepository.update(id, { 
                    current_stage: 'ditolak_cs',
                    overall_status: 'dalam_proses'
                });
                
                const creator = await PegawaiRepository.findById(berkas.created_by);
                
                await KreditBerkasRepository.addTracking({
                    berkas_id: id,
                    stage: 'ditolak_cs',
                    employee_id: berkas.created_by,
                    employee_name: creator?.name || 'Customer Service',
                    position: creator?.position || 'Customer Service',
                    status_berkas: 'belum_lengkap',
                    received_at: new Date().toISOString(),
                    catatan: `Berkas ditolak pada tahap ${currentStage}. Perlu penanganan CS.`
                });
            } else {
                await KreditBerkasRepository.update(id, { overall_status: 'ditolak' });
            }

            // Kirim notifikasi WA: kredit ditolak (fire-and-forget)
            KreditWaNotificationService.notifyRejected(id);
            
            return this.getById(id);
        }

        if (dto.status_berkas === 'belum_lengkap') {
            if (currentTracking?.id) {
                await KreditBerkasRepository.updateTracking(currentTracking.id, {
                    employee_id: employeeId,
                    employee_name: employee?.name,
                    position: employee?.position,
                    status_berkas: 'belum_lengkap',
                    catatan: dto.catatan
                });
            }
            return this.getById(id);
        }

        // 3. Lengkap: Advance to next stage
        if (currentTracking?.id) {
            await KreditBerkasRepository.updateTracking(currentTracking.id, {
                employee_id: employeeId,
                employee_name: employee?.name,
                position: employee?.position,
                status_berkas: 'lengkap',
                completed_at: new Date().toISOString(),
                catatan: dto.catatan
            });
        }

        let nextStage: KreditStage | null = STAGE_FLOW[currentStage] || null;
        let overallStatus: KreditStatus = 'dalam_proses';

        if (currentStage === 'pencairan' || currentStage === 'admin_pencairan') {
            nextStage = 'selesai';
            overallStatus = 'dicairkan';
        }

        const updatePayload: Partial<KreditBerkas> = { 
            current_stage: nextStage || currentStage,
            overall_status: overallStatus
        };

        if (currentStage === 'komite_kredit' && dto.nominal_persetujuan !== undefined) {
            updatePayload.nominal_persetujuan = dto.nominal_persetujuan;
        }

        await KreditBerkasRepository.update(id, updatePayload);

        if (nextStage && nextStage !== 'selesai' && nextStage !== 'ditolak_cs') {
            let assignedId = 'PENDING';
            let assignedName: string | undefined = undefined;
            let assignedPos: string | undefined = undefined;

            if (currentStage === 'delegasi_survey' && dto.assigned_employee_id) {
                const assignedEmp = await PegawaiRepository.findById(dto.assigned_employee_id);
                if (assignedEmp) {
                    assignedId = assignedEmp.id;
                    assignedName = assignedEmp.name;
                    assignedPos = assignedEmp.position;
                }
            } else if (nextStage === 'slik') {
                const allEmp = await PegawaiRepository.findAll();
                const adminSlik = allEmp.find(e => e.name.toUpperCase() === 'ARRYA TEGAR PRADIPTA');
                if (adminSlik) {
                    assignedId = adminSlik.id;
                    assignedName = adminSlik.name;
                    assignedPos = adminSlik.position;
                }
            }

            await KreditBerkasRepository.addTracking({
                berkas_id: id,
                stage: nextStage,
                employee_id: assignedId,
                employee_name: assignedName,
                position: assignedPos,
                status_berkas: 'belum_lengkap',
                received_at: new Date().toISOString()
            });

            // Kirim notifikasi WA pada tahap kritis (fire-and-forget)
            if (nextStage === 'ots' && currentStage === 'delegasi_survey') {
                // Berkas baru saja melewati delegasi_survey → survey dimulai
                KreditWaNotificationService.notifyDelegasiSurvey(id);
            }
        }

        // Notifikasi WA: approval keputusan disetujui
        if (currentStage === 'approval_keputusan' && dto.status_berkas === 'lengkap') {
            KreditWaNotificationService.notifyApproval(id);
        }

        return this.getById(id);
    },

    async getMonitoring() {
        const all = await KreditBerkasRepository.findAll();
        return all;
    }
};
