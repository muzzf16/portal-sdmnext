"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const perekrutan_service_1 = __importDefault(require("./perekrutan.service"));
class PerekrutanController {
    static async getAllKandidat(req, res, next) {
        try {
            const candidates = await perekrutan_service_1.default.getAllKandidat();
            res.status(200).json(candidates);
        }
        catch (error) {
            next(error);
        }
    }
    static async getKandidatById(req, res, next) {
        try {
            const { id } = req.params;
            const candidate = await perekrutan_service_1.default.getKandidatById(id);
            res.status(200).json(candidate);
        }
        catch (error) {
            next(error);
        }
    }
    static async createKandidat(req, res, next) {
        try {
            const candidateData = req.body;
            const newCandidate = await perekrutan_service_1.default.createKandidat(candidateData);
            res.status(201).json(newCandidate);
        }
        catch (error) {
            next(error);
        }
    }
    static async updateKandidat(req, res, next) {
        try {
            const { id } = req.params;
            const candidateData = req.body;
            const updatedCandidate = await perekrutan_service_1.default.updateKandidat(id, candidateData);
            res.status(200).json(updatedCandidate);
        }
        catch (error) {
            next(error);
        }
    }
    static async deleteKandidat(req, res, next) {
        try {
            const { id } = req.params;
            const result = await perekrutan_service_1.default.deleteKandidat(id);
            res.status(200).json(result);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = PerekrutanController;
//# sourceMappingURL=perekrutan.controller.js.map