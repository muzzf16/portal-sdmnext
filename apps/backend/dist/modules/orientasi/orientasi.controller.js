"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const orientasi_service_1 = __importDefault(require("./orientasi.service"));
class OrientasiController {
    static async getTugasOrientasiByEmployeeId(req, res, next) {
        try {
            const { employeeId } = req.params;
            const tasks = await orientasi_service_1.default.getTugasOrientasiByEmployeeId(employeeId);
            res.status(200).json(tasks);
        }
        catch (error) {
            next(error);
        }
    }
    static async createTugasOrientasi(req, res, next) {
        try {
            const { employeeId } = req.params;
            const taskData = req.body;
            const newTask = await orientasi_service_1.default.createTugasOrientasi(employeeId, taskData);
            res.status(201).json(newTask);
        }
        catch (error) {
            next(error);
        }
    }
    static async updateTugasOrientasi(req, res, next) {
        try {
            const { taskId } = req.params;
            const taskData = req.body;
            const updatedTask = await orientasi_service_1.default.updateTugasOrientasi(taskId, taskData);
            res.status(200).json(updatedTask);
        }
        catch (error) {
            next(error);
        }
    }
    static async deleteTugasOrientasi(req, res, next) {
        try {
            const { taskId } = req.params;
            const result = await orientasi_service_1.default.deleteTugasOrientasi(taskId);
            res.status(200).json(result);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = OrientasiController;
//# sourceMappingURL=orientasi.controller.js.map