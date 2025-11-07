"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.openDb = openDb;
const sqlite3_1 = __importDefault(require("sqlite3"));
const sqlite_1 = require("sqlite");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
async function openDb() {
    const filename = process.env.DB_SOURCE || './database.sqlite';
    const resolved = path_1.default.resolve(filename);
    try {
        const dir = path_1.default.dirname(resolved);
        if (dir && dir !== '.') {
            fs_1.default.mkdirSync(dir, { recursive: true });
        }
    }
    catch (err) {
        console.error('Failed to ensure DB directory exists:', err);
        throw err;
    }
    return (0, sqlite_1.open)({
        filename: resolved,
        driver: sqlite3_1.default.Database
    });
}
//# sourceMappingURL=db.js.map