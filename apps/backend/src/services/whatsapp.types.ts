/**
 * Types & Interfaces untuk WhatsApp Service
 */

export interface WAResponse {
    success: boolean;
    messageId?: string;
    providerResponse?: string;
    error?: string;
}

export interface WASendPayload {
    phone: string;
    message: string;
}

export interface WAAdapter {
    /**
     * Kirim pesan teks ke nomor WA.
     * Implementasi spesifik per provider.
     */
    send(payload: WASendPayload): Promise<WAResponse>;

    /**
     * Nama adapter untuk logging.
     */
    readonly name: string;
}

export interface WANotificationLogEntry {
    id?: number;
    berkas_id: number;
    no_wa: string;
    nama_nasabah?: string;
    trigger_stage: WANotificationTrigger;
    message_content: string;
    status: WANotificationStatus;
    provider_response?: string;
    retry_count?: number;
    error_message?: string;
    sent_at?: string;
    created_at?: string;
}

export type WANotificationTrigger =
    | 'penerimaan'
    | 'delegasi_survey'
    | 'approval_keputusan'
    | 'ditolak';

export type WANotificationStatus =
    | 'pending'
    | 'sent'
    | 'failed'
    | 'retry';
