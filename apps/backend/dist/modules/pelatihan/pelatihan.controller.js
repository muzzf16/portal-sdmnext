"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pelatihan_service_1 = __importDefault(require("./pelatihan.service"));
class PelatihanController {
    static async getAllPelatihan(req, res, next) {
        try {
            const pelatihan = await pelatihan_service_1.default.getAllPelatihan();
            res.status(200).json(pelatihan);
        }
        catch (error) {
            next(error);
        }
    }
    static async getPelatihanByEmployeeId(req, res, next) {
        try {
            const { id } = req.params;
            const pelatihan = await pelatihan_service_1.default.getPelatihanByEmployeeId(id);
            res.status(200).json(pelatihan);
        }
        catch (error) {
            next(error);
        }
    }
    static async addPelatihan(req, res, next) {
        try {
            const { id } = req.params;
            const pelatihanData = req.body;
            const newPelatihan = await pelatihan_service_1.default.addPelatihan(id, pelatihanData);
            res.status(201).json(newPelatihan);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = PelatihanController;
//# sourceMappingURL=pelatihan.controller.js.map