"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const config = {
    port: process.env.PORT || 3333,
    dbSource: process.env.DB_SOURCE || 'database.sqlite',
    dbJsonSeedSource: process.env.DB_JSON_SEED_SOURCE || './db.json',
    jwtSecret: process.env.JWT_SECRET || 'default_secret_for_development',
    nodeEnv: process.env.NODE_ENV || 'development',
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
};
exports.default = config;
//# sourceMappingURL=config.js.map