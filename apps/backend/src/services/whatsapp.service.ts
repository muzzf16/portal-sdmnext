/**
 * WhatsApp Service — Adapter Pattern
 * 
 * Service untuk pengiriman pesan WhatsApp menggunakan adapter pattern.
 * Mendukung Custom Gateway (internal), dan Mock adapter untuk testing.
 * 
 * Konfigurasi via environment variables:
 *   WA_PROVIDER     = custom_gateway | mock   (default: mock)
 *   WA_API_KEY      = API key untuk gateway
 *   WA_GATEWAY_URL  = URL endpoint gateway internal
 *   WA_ENABLED      = true | false             (default: false)
 */

import { WAAdapter, WASendPayload, WAResponse } from './whatsapp.types';

// ─── Helper: Format nomor telepon ke format internasional ────────────
function formatPhoneNumber(phone: string): string {
    if (!phone) return '';

    // Hapus karakter non-digit kecuali leading +
    let cleaned = phone.replace(/[^\d+]/g, '');

    // Konversi format lokal ke internasional
    if (cleaned.startsWith('08')) {
        cleaned = '628' + cleaned.substring(2);
    } else if (cleaned.startsWith('+62')) {
        cleaned = cleaned.substring(1); // Hapus leading +
    } else if (cleaned.startsWith('62')) {
        // Sudah format internasional
    } else if (cleaned.startsWith('8')) {
        cleaned = '62' + cleaned;
    }

    return cleaned;
}

// ─── Adapter: Custom WhatsApp Gateway (Internal) ────────────────────
class CustomGatewayAdapter implements WAAdapter {
    readonly name = 'custom_gateway';
    private apiKey: string;
    private gatewayUrl: string;

    constructor() {
        this.apiKey = process.env.WA_API_KEY || '';
        this.gatewayUrl = process.env.WA_GATEWAY_URL || '';

        if (!this.apiKey) {
            console.warn('[WhatsApp] WA_API_KEY belum dikonfigurasi untuk Custom Gateway');
        }
        if (!this.gatewayUrl) {
            console.warn('[WhatsApp] WA_GATEWAY_URL belum dikonfigurasi untuk Custom Gateway');
        }
    }

    async send(payload: WASendPayload): Promise<WAResponse> {
        const phone = formatPhoneNumber(payload.phone);

        if (!this.apiKey || !this.gatewayUrl) {
            return {
                success: false,
                error: 'Custom Gateway belum dikonfigurasi (WA_API_KEY / WA_GATEWAY_URL kosong)'
            };
        }

        try {
            // TODO(security): Validate gatewayUrl against an allowlist of trusted internal hosts
            // to prevent SSRF if the env var is compromised.
            const response = await fetch(this.gatewayUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    number: phone,
                    message: payload.message
                })
            });

            const responseText = await response.text();
            let responseData: Record<string, unknown> = {};

            try {
                responseData = JSON.parse(responseText);
            } catch {
                // Response bukan JSON, simpan sebagai text
            }

            if (response.ok) {
                return {
                    success: true,
                    messageId: (responseData as Record<string, unknown>).messageId as string || (responseData as Record<string, unknown>).id as string || undefined,
                    providerResponse: responseText
                };
            } else {
                return {
                    success: false,
                    error: `Gateway returned ${response.status}: ${responseText}`,
                    providerResponse: responseText
                };
            }
        } catch (error: unknown) {
            const errMsg = error instanceof Error ? error.message : String(error);
            return {
                success: false,
                error: `Custom Gateway request failed: ${errMsg}`
            };
        }
    }
}

// ─── Adapter: Mock (Development / Testing) ──────────────────────────
class MockAdapter implements WAAdapter {
    readonly name = 'mock';

    async send(payload: WASendPayload): Promise<WAResponse> {
        const phone = formatPhoneNumber(payload.phone);
        const mockId = `mock-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        console.log(`[WhatsApp Mock] Sending to ${phone}:`);
        console.log(`[WhatsApp Mock] Message: ${payload.message.substring(0, 100)}...`);
        console.log(`[WhatsApp Mock] Message ID: ${mockId}`);

        return {
            success: true,
            messageId: mockId,
            providerResponse: JSON.stringify({
                mock: true,
                phone,
                timestamp: new Date().toISOString()
            })
        };
    }
}

// ─── WhatsApp Service (Main) ────────────────────────────────────────

function createAdapter(): WAAdapter {
    const provider = (process.env.WA_PROVIDER || 'mock').toLowerCase();

    switch (provider) {
        case 'custom_gateway':
            return new CustomGatewayAdapter();
        case 'mock':
        default:
            return new MockAdapter();
    }
}

const MAX_RETRIES = 3;
const RETRY_DELAYS = [1000, 3000, 5000]; // Exponential-ish backoff in ms

function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export const WhatsAppService = {
    /**
     * Kirim pesan WhatsApp dengan retry mechanism.
     * @returns WAResponse hasil pengiriman
     */
    async sendMessage(phone: string, message: string): Promise<WAResponse> {
        const enabled = (process.env.WA_ENABLED || 'false').toLowerCase() === 'true';

        if (!enabled) {
            console.log('[WhatsApp] WA_ENABLED=false. Pesan tidak dikirim.');
            return {
                success: true,
                messageId: `disabled-${Date.now()}`,
                providerResponse: JSON.stringify({ disabled: true })
            };
        }

        if (!phone) {
            return {
                success: false,
                error: 'Nomor telepon kosong'
            };
        }

        const adapter = createAdapter();
        const payload: WASendPayload = { phone, message };

        let lastResponse: WAResponse = { success: false, error: 'No attempts made' };

        for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
            if (attempt > 0) {
                const delay = RETRY_DELAYS[attempt - 1] || 5000;
                console.log(`[WhatsApp] Retry ${attempt}/${MAX_RETRIES} after ${delay}ms...`);
                await sleep(delay);
            }

            lastResponse = await adapter.send(payload);

            if (lastResponse.success) {
                console.log(`[WhatsApp] Pesan terkirim via ${adapter.name} ke ${formatPhoneNumber(phone)} (attempt ${attempt + 1})`);
                return lastResponse;
            }

            console.warn(`[WhatsApp] Gagal kirim via ${adapter.name} (attempt ${attempt + 1}): ${lastResponse.error}`);
        }

        console.error(`[WhatsApp] Semua retry gagal untuk ${formatPhoneNumber(phone)}`);
        return lastResponse;
    },

    /**
     * Format nomor telepon ke format internasional 62xxx
     */
    formatPhone(phone: string): string {
        return formatPhoneNumber(phone);
    }
};
