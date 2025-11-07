"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const routes_1 = __importDefault(require("./routes"));
const errorHandler_1 = __importDefault(require("./middleware/errorHandler"));
const app = (0, express_1.default)();
app.use((0, helmet_1.default)({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(express_1.default.json());
app.use((0, cors_1.default)({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }));
app.use('/api', routes_1.default);
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '..', 'public', 'uploads')));
app.use('/avatars', express_1.default.static(path_1.default.join(__dirname, '..', 'public', 'avatars')));
app.use('/documents', express_1.default.static(path_1.default.join(__dirname, '..', 'public', 'documents')));
app.use('/logos', express_1.default.static(path_1.default.join(__dirname, '..', 'public', 'logos')));
app.use(errorHandler_1.default);
exports.default = app;
//# sourceMappingURL=app.js.map