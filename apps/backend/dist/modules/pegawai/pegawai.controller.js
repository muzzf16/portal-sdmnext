"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pegawai_service_1 = __importDefault(require("./pegawai.service"));
class PegawaiController {
    static async getAllPegawai(req, res, next) {
        try {
            const pegawai = await pegawai_service_1.default.getAllPegawai();
            res.status(200).json(pegawai);
        }
        catch (error) {
            next(error);
        }
    }
    static async getPegawaiById(req, res, next) {
        try {
            const { id } = req.params;
            const pegawai = await pegawai_service_1.default.getPegawaiById(id);
            res.status(200).json(pegawai);
        }
        catch (error) {
            next(error);
        }
    }
    static async createPegawai(req, res, next) {
        try {
            const { name, email, ...pegawaiData } = req.body;
            const newPegawai = await pegawai_service_1.default.createPegawai(name, email, pegawaiData);
            res.status(201).json(newPegawai);
        }
        catch (error) {
            next(error);
        }
    }
    static async updatePegawai(req, res, next) {
        try {
            const { id } = req.params;
            const { name, email, ...pegawaiData } = req.body;
            const updatedPegawai = await pegawai_service_1.default.updatePegawai(id, name, email, pegawaiData);
            res.status(200).json(updatedPegawai);
        }
        catch (error) {
            next(error);
        }
    }
    static async deletePegawai(req, res, next) {
        try {
            const { id } = req.params;
            const result = await pegawai_service_1.default.deletePegawai(id);
            res.status(200).json(result);
        }
        catch (error) {
            next(error);
        }
    }
    static async updatePegawaiPayrollInfo(req, res, next) {
        try {
            const { id } = req.params;
            const payrollInfo = req.body;
            const result = await pegawai_service_1.default.updatePegawaiPayrollInfo(id, payrollInfo);
            res.status(200).json(result);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = PegawaiController;
//# sourceMappingURL=pegawai.controller.js.map