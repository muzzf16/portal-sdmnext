"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processChangeRequest = exports.getAllChangeRequests = exports.createChangeRequest = void 0;
const repository = __importStar(require("./permintaanPerubahanData.repository"));
const notifikasi_service_1 = __importDefault(require("../notifikasi/notifikasi.service"));
const pengguna_repository_1 = require("../pengguna/pengguna.repository");
const pegawai_repository_1 = require("../pegawai/pegawai.repository");
const createChangeRequest = async (request) => {
    const newRequestId = await repository.createRequest(request);
    if (newRequestId) {
        const admins = await pengguna_repository_1.PenggunaRepository.findAdminUsers();
        const employee = await pegawai_repository_1.PegawaiRepository.findById(request.employeeId);
        for (const admin of admins) {
            await notifikasi_service_1.default.createNotifikasi({
                employee_id: admin.employeeId,
                message: `Pegawai ${employee?.name} mengajukan permintaan perubahan data.`,
                type: 'info',
                related_entity: 'data_change_request',
                related_entity_id: newRequestId.toString(),
            });
        }
    }
    return newRequestId;
};
exports.createChangeRequest = createChangeRequest;
const getAllChangeRequests = async () => {
    return repository.findAllRequests();
};
exports.getAllChangeRequests = getAllChangeRequests;
const processChangeRequest = async (id, status, reviewedBy, reviewNotes) => {
    const request = await repository.findRequestById(id);
    if (!request) {
        throw new Error('Request not found');
    }
    await repository.updateRequestStatus(id, status, reviewedBy, reviewNotes);
    await notifikasi_service_1.default.createNotifikasi({
        employee_id: request.employeeId,
        message: `Permintaan perubahan data Anda telah di-${status}.`,
        type: status === 'approved' ? 'success' : 'error',
        related_entity: 'data_change_request',
        related_entity_id: id.toString(),
    });
};
exports.processChangeRequest = processChangeRequest;
//# sourceMappingURL=permintaanPerubahanData.service.js.map