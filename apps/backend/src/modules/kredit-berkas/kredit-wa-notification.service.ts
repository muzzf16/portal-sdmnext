/**
 * Kredit WA Notification Service
 * 
 * Mengelola pengiriman notifikasi WhatsApp ke nasabah/debitur 
 * pada tahap-tahap kritis alur pengajuan kredit:
 *   1. Penerimaan berkas oleh CS
 *   2. Delegasi survey ke petugas lapangan
 *   3. Approval keputusan kredit (disetujui)
 *   4. Penolakan kredit
 */

import { openDb } from '../../config/db';
import { WhatsAppService } from '../../services/whatsapp.service';
import { WANotificationLogEntry, WANotificationTrigger, WANotificationStatus } from '../../services/whatsapp.types';

// ─── Template Pesan ─────────────────────────────────────────────────

function buildMessage(trigger: WANotificationTrigger, data: {
    nama: string;
    nomor: string;
    jumlah?: number;
    jenisKredit?: string;
    petugasNama?: string;
}): string {
    const jumlahFormatted = data.jumlah
        ? `Rp ${data.jumlah.toLocaleString('id-ID')}`
        : '';

    switch (trigger) {
        case 'penerimaan':
            return (
                `Yth. Bpk/Ibu ${data.nama},\n\n` +
                `Berkas pengajuan kredit Anda dengan nomor *${data.nomor}* telah kami terima.\n` +
                `Jenis Kredit: ${data.jenisKredit || '-'}\n` +
                (jumlahFormatted ? `Nominal: ${jumlahFormatted}\n` : '') +
                `\nKami akan segera memproses pengajuan Anda. ` +
                `Terima kasih atas kepercayaan Anda.`
            );

        case 'delegasi_survey':
            const petugasText = data.petugasNama && data.petugasNama !== 'PENDING'
                ? `Petugas kami (*${data.petugasNama}*) akan menghubungi dan mengunjungi Anda dalam waktu dekat.`
                : `Petugas kami akan menghubungi dan mengunjungi Anda dalam waktu dekat.`;
            return (
                `Yth. Bpk/Ibu ${data.nama},\n\n` +
                `Pengajuan kredit Anda dengan nomor *${data.nomor}* sedang dalam tahap *survey lapangan*.\n` +
                `${petugasText}\n\n` +
                `Mohon siapkan dokumen pendukung yang diperlukan. Terima kasih.`
            );

        case 'approval_keputusan':
            return (
                `Yth. Bpk/Ibu ${data.nama},\n\n` +
                `*Selamat!* Pengajuan kredit Anda dengan nomor *${data.nomor}*` +
                (jumlahFormatted ? ` sebesar *${jumlahFormatted}*` : '') +
                ` telah *DISETUJUI*.\n\n` +
                `Silakan hubungi kantor kami untuk proses penandatanganan SPK dan kelengkapan administrasi selanjutnya.\n\n` +
                `Terima kasih atas kepercayaan Anda.`
            );

        case 'ditolak':
            return (
                `Yth. Bpk/Ibu ${data.nama},\n\n` +
                `Mohon maaf, pengajuan kredit Anda dengan nomor *${data.nomor}* ` +
                `belum dapat kami setujui saat ini.\n\n` +
                `Untuk informasi lebih lanjut, silakan hubungi Customer Service kami. ` +
                `Terima kasih atas pengertian Anda.`
            );

        default:
            return `Notifikasi kredit untuk ${data.nama} (${data.nomor})`;
    }
}

// ─── Log Repository ─────────────────────────────────────────────────

async function createLog(entry: WANotificationLogEntry): Promise<number | undefined> {
    const db = await openDb();
    const result = await db.run(
        `INSERT INTO wa_notification_log 
         (berkas_id, no_wa, nama_nasabah, trigger_stage, message_content, status, provider_response, retry_count, error_message, sent_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            entry.berkas_id,
            entry.no_wa,
            entry.nama_nasabah || null,
            entry.trigger_stage,
            entry.message_content,
            entry.status,
            entry.provider_response || null,
            entry.retry_count || 0,
            entry.error_message || null,
            entry.sent_at || null
        ]
    );
    return result.lastID;
}

async function updateLogStatus(logId: number, data: {
    status: WANotificationStatus;
    provider_response?: string;
    error_message?: string;
    sent_at?: string;
    retry_count?: number;
}): Promise<void> {
    const db = await openDb();
    await db.run(
        `UPDATE wa_notification_log 
         SET status = ?, provider_response = ?, error_message = ?, sent_at = ?, retry_count = ?
         WHERE id = ?`,
        [
            data.status,
            data.provider_response || null,
            data.error_message || null,
            data.sent_at || null,
            data.retry_count || 0,
            logId
        ]
    );
}

// ─── Core Notification Logic ────────────────────────────────────────

async function sendNotification(
    berkasId: number,
    trigger: WANotificationTrigger
): Promise<void> {
    try {
        const db = await openDb();

        // 1. Fetch data berkas
        const berkas = await db.get(
            `SELECT id, nomor_pengajuan, nama_pengajuan, jumlah_pengajuan, jenis_kredit, no_wa_nasabah 
             FROM kredit_berkas WHERE id = ?`,
            [berkasId]
        );

        if (!berkas) {
            console.warn(`[KreditWA] Berkas ID ${berkasId} tidak ditemukan`);
            return;
        }

        if (!berkas.no_wa_nasabah) {
            console.warn(`[KreditWA] Berkas ID ${berkasId}: no_wa_nasabah kosong, notifikasi tidak dikirim`);
            return;
        }

        // Fetch assigned officer (petugas) name for OTS stage if applicable
        let petugasNama: string | undefined;
        if (trigger === 'delegasi_survey') {
            const tracking = await db.get(
                `SELECT employee_name FROM kredit_berkas_tracking 
                 WHERE berkas_id = ? AND stage = 'ots' 
                 ORDER BY id DESC LIMIT 1`,
                [berkasId]
            );
            if (tracking && tracking.employee_name && tracking.employee_name !== 'PENDING') {
                petugasNama = tracking.employee_name;
            }
        }

        // 2. Build message
        const message = buildMessage(trigger, {
            nama: berkas.nama_pengajuan,
            nomor: berkas.nomor_pengajuan,
            jumlah: berkas.jumlah_pengajuan,
            jenisKredit: berkas.jenis_kredit,
            petugasNama
        });

        // 3. Create log entry (pending)
        const logId = await createLog({
            berkas_id: berkasId,
            no_wa: berkas.no_wa_nasabah,
            nama_nasabah: berkas.nama_pengajuan,
            trigger_stage: trigger,
            message_content: message,
            status: 'pending'
        });

        if (!logId) {
            console.error(`[KreditWA] Gagal membuat log entry untuk berkas ${berkasId}`);
            return;
        }

        // 4. Send via WhatsApp Service
        const result = await WhatsAppService.sendMessage(berkas.no_wa_nasabah, message);

        // 5. Update log with result
        await updateLogStatus(logId, {
            status: result.success ? 'sent' : 'failed',
            provider_response: result.providerResponse || undefined,
            error_message: result.error || undefined,
            sent_at: result.success ? new Date().toISOString() : undefined
        });

        if (result.success) {
            console.log(`[KreditWA] Notifikasi ${trigger} terkirim untuk berkas ${berkas.nomor_pengajuan}`);
        } else {
            console.error(`[KreditWA] Gagal kirim notifikasi ${trigger} untuk berkas ${berkas.nomor_pengajuan}: ${result.error}`);
        }
    } catch (error: unknown) {
        const errMsg = error instanceof Error ? error.message : String(error);
        console.error(`[KreditWA] Error sendNotification(${berkasId}, ${trigger}): ${errMsg}`);
    }
}

// ─── Public API ─────────────────────────────────────────────────────

export const KreditWaNotificationService = {
    /**
     * Notifikasi: CS menerima berkas pengajuan kredit.
     * Dipanggil saat create berkas baru (stage = penerimaan).
     * Fire-and-forget: tidak memblokir response API utama.
     */
    notifyBerkasReceived(berkasId: number): void {
        sendNotification(berkasId, 'penerimaan').catch(err => {
            console.error('[KreditWA] notifyBerkasReceived error:', err);
        });
    },

    /**
     * Notifikasi: Berkas masuk tahap delegasi survey.
     * Dipanggil saat processStage advance ke delegasi_survey.
     * Fire-and-forget.
     */
    notifyDelegasiSurvey(berkasId: number): void {
        sendNotification(berkasId, 'delegasi_survey').catch(err => {
            console.error('[KreditWA] notifyDelegasiSurvey error:', err);
        });
    },

    /**
     * Notifikasi: Kredit DISETUJUI (approval_keputusan → lengkap).
     * Fire-and-forget.
     */
    notifyApproval(berkasId: number): void {
        sendNotification(berkasId, 'approval_keputusan').catch(err => {
            console.error('[KreditWA] notifyApproval error:', err);
        });
    },

    /**
     * Notifikasi: Kredit DITOLAK.
     * Dipanggil saat berkas ditolak di komite/approval.
     * Fire-and-forget.
     */
    notifyRejected(berkasId: number): void {
        sendNotification(berkasId, 'ditolak').catch(err => {
            console.error('[KreditWA] notifyRejected error:', err);
        });
    },

    /**
     * Ambil riwayat notifikasi WA untuk berkas tertentu.
     */
    async getNotificationLog(berkasId: number): Promise<WANotificationLogEntry[]> {
        const db = await openDb();
        return db.all(
            `SELECT * FROM wa_notification_log WHERE berkas_id = ? ORDER BY created_at DESC`,
            [berkasId]
        );
    },

    /**
     * Kirim ulang notifikasi WA yang gagal.
     */
    async resend(logId: number): Promise<{ success: boolean; message: string }> {
        const db = await openDb();
        const log = await db.get(
            `SELECT * FROM wa_notification_log WHERE id = ?`,
            [logId]
        );

        if (!log) {
            return { success: false, message: 'Log notifikasi tidak ditemukan' };
        }

        if (log.status === 'sent') {
            return { success: false, message: 'Notifikasi ini sudah terkirim sebelumnya' };
        }

        // Re-send via WhatsApp Service
        const result = await WhatsAppService.sendMessage(log.no_wa, log.message_content);

        await updateLogStatus(logId, {
            status: result.success ? 'sent' : 'failed',
            provider_response: result.providerResponse || undefined,
            error_message: result.error || undefined,
            sent_at: result.success ? new Date().toISOString() : undefined,
            retry_count: (log.retry_count || 0) + 1
        });

        return {
            success: result.success,
            message: result.success
                ? 'Notifikasi berhasil dikirim ulang'
                : `Gagal mengirim ulang: ${result.error}`
        };
    }
};
