import { KreditBerkasRepository } from './kredit-berkas.repository';
import { PegawaiRepository } from '../pegawai/pegawai.repository';
import { 
    CreateKreditBerkasDto, 
    UpdateKreditStageDto, 
    KreditBerkas, 
    KreditBerkasTracking, 
    KreditStage 
} from './kredit-berkas.types';

export const KreditBerkasService = {
    async create(employeeId: string, dto: CreateKreditBerkasDto) {
        const employee = await PegawaiRepository.findById(employeeId);
        const nomor = await KreditBerkasRepository.generateNomor();

        const berkas: KreditBerkas = {
            nomor_pengajuan: nomor,
            nama_pengajuan: dto.nama_pengajuan,
            jumlah_pengajuan: dto.jumlah_pengajuan || 0,
            jenis_kredit: dto.jenis_kredit || 'Umum',
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

        // If complete, move to next stage (analisa)
        if (dto.status_berkas === 'lengkap') {
            await KreditBerkasRepository.update(berkasId, { current_stage: 'analisa' });
            
            // Create pending tracking for next stage
            await KreditBerkasRepository.addTracking({
                berkas_id: berkasId,
                stage: 'analisa',
                employee_id: 'PENDING', // Will be picked up by Analis
                status_berkas: 'belum_lengkap',
                received_at: new Date().toISOString()
            });
        }

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
        let stage: KreditStage | null = null;

        if (position.includes('marketing') || position.includes('analis')) {
            stage = 'analisa';
        } else if (position.includes('kabid kredit')) {
            stage = 'verifikasi';
        } else if (position.includes('adminitrasi kredit') || position.includes('adm kredit')) {
            stage = 'admin_pencairan';
        }

        if (!stage) return [];

        return KreditBerkasRepository.getPendingByStage(stage);
    },

    async processStage(id: number, employeeId: string, dto: UpdateKreditStageDto) {
        const berkas = await KreditBerkasRepository.findById(id);
        if (!berkas) throw new Error('Berkas tidak ditemukan');

        const employee = await PegawaiRepository.findById(employeeId);
        const currentStage = berkas.current_stage;

        // 1. Update current tracking
        const trackingList = await KreditBerkasRepository.getTracking(id);
        const currentTracking = trackingList.find(t => t.stage === currentStage && !t.completed_at);

        if (currentTracking && currentTracking.id) {
            await KreditBerkasRepository.updateTracking(currentTracking.id, {
                employee_id: employeeId,
                employee_name: employee?.name,
                position: employee?.position,
                status_berkas: dto.status_berkas,
                completed_at: new Date().toISOString(),
                catatan: dto.catatan
            });
        }

        // 2. Decide next step
        if (dto.status_berkas === 'ditolak') {
            await KreditBerkasRepository.update(id, { overall_status: 'ditolak' });
            return this.getById(id);
        }

        if (dto.status_berkas === 'lengkap') {
            let nextStage: KreditStage | null = null;
            let overallStatus: any = 'dalam_proses';

            if (currentStage === 'penerimaan') nextStage = 'analisa';
            else if (currentStage === 'analisa') nextStage = 'verifikasi';
            else if (currentStage === 'verifikasi') nextStage = 'admin_pencairan';
            else if (currentStage === 'admin_pencairan') {
                nextStage = 'selesai';
                overallStatus = 'dicairkan';
            }

            await KreditBerkasRepository.update(id, { 
                current_stage: nextStage || currentStage,
                overall_status: overallStatus
            });

            if (nextStage && nextStage !== 'selesai') {
                await KreditBerkasRepository.addTracking({
                    berkas_id: id,
                    stage: nextStage,
                    employee_id: 'PENDING',
                    status_berkas: 'belum_lengkap',
                    received_at: new Date().toISOString()
                });
            }
        }

        return this.getById(id);
    },

    async getMonitoring() {
        const all = await KreditBerkasRepository.findAll();
        // Agregasi sederhana untuk dashboard
        return all;
    }
};
