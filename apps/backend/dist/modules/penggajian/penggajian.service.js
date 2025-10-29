"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const penggajian_repository_1 = require("./penggajian.repository");
const errors_1 = require("../../utils/errors");
class PenggajianService {
    static async getAllPenggajian() {
        try {
            return await penggajian_repository_1.PenggajianRepository.findAll();
        }
        catch (error) {
            throw new errors_1.AppError(`Error retrieving payrolls: ${error.message}`, 500);
        }
    }
    static async getPenggajianById(id) {
        try {
            const payroll = await penggajian_repository_1.PenggajianRepository.findById(id);
            if (!payroll) {
                throw new errors_1.AppError('Payroll not found', 404);
            }
            return payroll;
        }
        catch (error) {
            if (error.message === 'Payroll not found') {
                throw error;
            }
            throw new errors_1.AppError(`Error retrieving payroll: ${error.message}`, 500);
        }
    }
    static async getPenggajianByEmployeeId(employeeId) {
        try {
            return await penggajian_repository_1.PenggajianRepository.findByEmployeeId(employeeId);
        }
        catch (error) {
            throw new errors_1.AppError(`Error retrieving payrolls for employee: ${error.message}`, 500);
        }
    }
    static async createPenggajian(payrollData) {
        try {
            return await penggajian_repository_1.PenggajianRepository.create(payrollData);
        }
        catch (error) {
            throw new errors_1.AppError(`Error creating payroll: ${error.message}`, 500);
        }
    }
    static async updatePenggajian(id, payrollData) {
        try {
            const updatedPayroll = await penggajian_repository_1.PenggajianRepository.update(id, payrollData);
            if (!updatedPayroll) {
                throw new errors_1.AppError('Payroll not found', 404);
            }
            return updatedPayroll;
        }
        catch (error) {
            if (error.message === 'Payroll not found') {
                throw error;
            }
            throw new errors_1.AppError(`Error updating payroll: ${error.message}`, 500);
        }
    }
    static async deletePenggajian(id) {
        try {
            const deleted = await penggajian_repository_1.PenggajianRepository.delete(id);
            if (!deleted) {
                throw new errors_1.AppError('Payroll not found', 404);
            }
            return { message: 'Payroll deleted successfully' };
        }
        catch (error) {
            if (error.message === 'Payroll not found') {
                throw error;
            }
            throw new errors_1.AppError(`Error deleting payroll: ${error.message}`, 500);
        }
    }
    static async addSalaryComponent(id, component) {
        try {
            const payroll = await penggajian_repository_1.PenggajianRepository.findById(id);
            if (!payroll) {
                throw new errors_1.AppError('Payroll not found', 404);
            }
            if (component.type === 'income') {
                payroll.incomes.push({ name: component.name, amount: component.amount });
            }
            else {
                payroll.deductions.push({ name: component.name, amount: component.amount });
            }
            return await penggajian_repository_1.PenggajianRepository.update(id, payroll);
        }
        catch (error) {
            if (error.message === 'Payroll not found') {
                throw error;
            }
            throw new errors_1.AppError(`Error adding salary component: ${error.message}`, 500);
        }
    }
}
exports.default = PenggajianService;
//# sourceMappingURL=penggajian.service.js.map