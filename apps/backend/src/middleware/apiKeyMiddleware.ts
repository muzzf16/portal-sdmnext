import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { openDb } from '../config/db';

/**
 * Middleware untuk memvalidasi API Key pada endpoint integrasi (M2M)
 */
export const apiKeyMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();
    const apiKey = req.header('x-api-key');

    // Helper untuk log ke tabel integration_logs
    const logIntegrationRequest = async (
        apiKeyId: number | null,
        statusCode: number,
        errorMessage: string | null = null
    ) => {
        try {
            const db = await openDb();
            const responseTime = Date.now() - startTime;

            await db.run(
                `INSERT INTO integration_logs (api_key_id, endpoint, method, status_code, response_time_ms, error_message)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [apiKeyId, req.originalUrl, req.method, statusCode, responseTime, errorMessage]
            );
        } catch (error) {
            console.error('Failed to log integration request:', error);
        }
    };

    if (!apiKey) {
        await logIntegrationRequest(null, 401, 'Missing x-api-key header');
        return res.status(401).json({
            success: false,
            message: 'Unauthorized: Missing x-api-key header'
        });
    }

    try {
        const db = await openDb();

        // Ambil semua API keys yang aktif
        // Catatan: Idealnya untuk efisiensi kita mengecek hash spesifik,
        // namun karena bcrypt didesain lambat (salt per hash),
        // pendekatan ini hanya cocok untuk jumlah API Key yang sedikit.
        // Untuk produksi dengan banyak key, lebih baik menggunakan Client ID + Client Secret.
        const activeKeys = await db.all('SELECT id, key_hash FROM api_keys WHERE status = "aktif"');

        let validKeyId: number | null = null;

        for (const keyDef of activeKeys) {
            const isMatch = await bcrypt.compare(apiKey, keyDef.key_hash);
            if (isMatch) {
                validKeyId = keyDef.id;
                break;
            }
        }

        if (!validKeyId) {
            await logIntegrationRequest(null, 403, 'Invalid API Key');
            return res.status(403).json({
                success: false,
                message: 'Forbidden: Invalid API Key'
            });
        }

        // Simpan API Key ID ke object req jika endpoint butuh info auth
        (req as any).integrationApiKeyId = validKeyId;

        // Catat success request.
        // Atau kita bisa serahkan logging pada controller jika ingin spesifik,
        // tapi middleware mencatat "auth success, processing started" adalah ide bagus.
        const originalSend = res.send.bind(res);
        res.send = (body: any) => {
            logIntegrationRequest(validKeyId, res.statusCode);
            return originalSend(body);
        };

        next();
    } catch (error: any) {
        console.error('API Key validation error:', error);
        await logIntegrationRequest(null, 500, error.message || 'Internal Server Error during auth');
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
