"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiKeyMiddleware = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const db_1 = require("../config/db");
const apiKeyMiddleware = async (req, res, next) => {
    const startTime = Date.now();
    const apiKey = req.header('x-api-key');
    const logIntegrationRequest = async (apiKeyId, statusCode, errorMessage = null) => {
        try {
            const db = await (0, db_1.openDb)();
            const responseTime = Date.now() - startTime;
            await db.run(`INSERT INTO integration_logs (api_key_id, endpoint, method, status_code, response_time_ms, error_message)
                 VALUES (?, ?, ?, ?, ?, ?)`, [apiKeyId, req.originalUrl, req.method, statusCode, responseTime, errorMessage]);
        }
        catch (error) {
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
        const db = await (0, db_1.openDb)();
        const activeKeys = await db.all('SELECT id, key_hash FROM api_keys WHERE status = "aktif"');
        let validKeyId = null;
        for (const keyDef of activeKeys) {
            const isMatch = await bcryptjs_1.default.compare(apiKey, keyDef.key_hash);
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
        req.integrationApiKeyId = validKeyId;
        const originalSend = res.send.bind(res);
        res.send = (body) => {
            logIntegrationRequest(validKeyId, res.statusCode);
            return originalSend(body);
        };
        next();
    }
    catch (error) {
        console.error('API Key validation error:', error);
        await logIntegrationRequest(null, 500, error.message || 'Internal Server Error during auth');
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
exports.apiKeyMiddleware = apiKeyMiddleware;
//# sourceMappingURL=apiKeyMiddleware.js.map