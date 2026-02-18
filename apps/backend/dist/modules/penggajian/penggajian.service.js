"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const penggajian_repository_1 = require("./penggajian.repository");
const pegawai_repository_1 = require("../pegawai/pegawai.repository");
const errors_1 = require("../../utils/errors");
const pdfkit_1 = __importDefault(require("pdfkit"));
class PenggajianService {
    static async getAllPenggajian(query) {
        try {
            return await penggajian_repository_1.PenggajianRepository.findAll(query);
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
                payroll.incomes = payroll.incomes || [];
                payroll.incomes.push({ name: component.name, amount: component.amount });
            }
            else {
                payroll.deductions = payroll.deductions || [];
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
    static async runPayroll(period) {
        try {
            const employees = await pegawai_repository_1.PegawaiRepository.findAll();
            const createdPayrolls = [];
            const [year, month] = period.split('-').map(Number);
            const prevDate = new Date(year, month - 2, 1);
            const prevYear = prevDate.getFullYear();
            const prevMonth = String(prevDate.getMonth() + 1).padStart(2, '0');
            const previousPeriod = `${prevYear}-${prevMonth}`;
            for (const employee of employees) {
                if (employee.statusKaryawan !== 'aktif') {
                    if (employee.isActive === 0)
                        continue;
                }
                const existingPayroll = await penggajian_repository_1.PenggajianRepository.findByEmployeeIdAndPeriod(employee.id, period);
                if (existingPayroll) {
                    continue;
                }
                const previousPayroll = await penggajian_repository_1.PenggajianRepository.findByEmployeeIdAndPeriod(employee.id, previousPeriod);
                let baseSalary = 0;
                let incomes = [];
                let deductions = [];
                if (previousPayroll) {
                    baseSalary = previousPayroll.baseSalary;
                    incomes = previousPayroll.incomes;
                    deductions = previousPayroll.deductions;
                }
                else {
                    if (employee.payrollInfo) {
                        try {
                            const payrollInfo = typeof employee.payrollInfo === 'string'
                                ? JSON.parse(employee.payrollInfo)
                                : employee.payrollInfo;
                            baseSalary = payrollInfo.baseSalary || 0;
                            incomes = payrollInfo.incomes || [];
                            deductions = payrollInfo.deductions || [];
                        }
                        catch (e) {
                            console.error(`Error parsing payroll info for employee ${employee.id}`, e);
                        }
                    }
                }
                const totalAttendance = 22;
                const totalOvertime = Math.floor(Math.random() * 10);
                const totalLateness = Math.floor(Math.random() * 3);
                const newPayrollData = {
                    employeeId: employee.id,
                    employeeName: employee.name,
                    period: period,
                    baseSalary,
                    incomes,
                    deductions,
                    status: 'Draft',
                    totalAttendance,
                    totalOvertime,
                    totalLateness
                };
                const createdPayroll = await penggajian_repository_1.PenggajianRepository.create(newPayrollData);
                createdPayrolls.push(createdPayroll);
            }
            return {
                message: `${createdPayrolls.length} payrolls generated for period ${period}. (Copied from ${previousPeriod} if available)`,
                data: createdPayrolls
            };
        }
        catch (error) {
            throw new errors_1.AppError(`Error running payroll generation: ${error.message}`, 500);
        }
    }
    static async updateStatus(id, status) {
        try {
            const payroll = await penggajian_repository_1.PenggajianRepository.findById(id);
            if (!payroll)
                throw new errors_1.AppError('Payroll not found', 404);
            return await penggajian_repository_1.PenggajianRepository.update(id, { ...payroll, status });
        }
        catch (error) {
            throw new errors_1.AppError(`Error updating payroll status: ${error.message}`, 500);
        }
    }
    static async generatePayslip(payrollId) {
        try {
            const payroll = await penggajian_repository_1.PenggajianRepository.findById(payrollId);
            if (!payroll) {
                throw new errors_1.AppError('Payroll not found', 404);
            }
            const doc = new pdfkit_1.default();
            const buffers = [];
            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
            });
            doc.fontSize(25).text('Slip Gaji', { align: 'center' });
            doc.fontSize(12).text(`Periode: ${payroll.period}`);
            doc.text(`Nama Karyawan: ${payroll.employeeName}`);
            doc.text(`Gaji Pokok: ${payroll.baseSalary}`);
            doc.text(`Total Pendapatan: ${payroll.totalIncome}`);
            doc.text(`Total Potongan: ${payroll.totalDeductions}`);
            doc.text(`Gaji Bersih: ${payroll.netSalary}`);
            doc.end();
            return new Promise((resolve) => {
                doc.on('end', () => {
                    resolve(Buffer.concat(buffers));
                });
            });
        }
        catch (error) {
            throw new errors_1.AppError(`Error generating payslip: ${error.message}`, 500);
        }
    }
}
exports.default = PenggajianService;
//# sourceMappingURL=penggajian.service.js.map