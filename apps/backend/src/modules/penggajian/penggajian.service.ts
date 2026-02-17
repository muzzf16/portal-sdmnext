
import { PenggajianRepository } from './penggajian.repository';
import { PegawaiRepository } from '../pegawai/pegawai.repository';
import { AppError } from '../../utils/errors';
import PDFDocument from 'pdfkit';

class PenggajianService {
  static async getAllPenggajian(query: any) {
    try {
      return await PenggajianRepository.findAll(query);
    } catch (error: any) {
      throw new AppError(`Error retrieving payrolls: ${error.message}`, 500);
    }
  }

  static async getPenggajianById(id: string) {
    try {
      const payroll = await PenggajianRepository.findById(id);
      if (!payroll) {
        throw new AppError('Payroll not found', 404);
      }
      return payroll;
    } catch (error: any) {
      if (error.message === 'Payroll not found') {
        throw error;
      }
      throw new AppError(`Error retrieving payroll: ${error.message}`, 500);
    }
  }

  static async getPenggajianByEmployeeId(employeeId: string) {
    try {
      return await PenggajianRepository.findByEmployeeId(employeeId);
    } catch (error: any) {
      throw new AppError(`Error retrieving payrolls for employee: ${error.message}`, 500);
    }
  }

  static async createPenggajian(payrollData: any) {
    try {
      return await PenggajianRepository.create(payrollData);
    } catch (error: any) {
      throw new AppError(`Error creating payroll: ${error.message}`, 500);
    }
  }

  static async updatePenggajian(id: string, payrollData: any) {
    try {
      const updatedPayroll = await PenggajianRepository.update(id, payrollData);
      if (!updatedPayroll) {
        throw new AppError('Payroll not found', 404);
      }
      return updatedPayroll;
    } catch (error: any) {
      if (error.message === 'Payroll not found') {
        throw error;
      }
      throw new AppError(`Error updating payroll: ${error.message}`, 500);
    }
  }

  static async deletePenggajian(id: string) {
    try {
      const deleted = await PenggajianRepository.delete(id);
      if (!deleted) {
        throw new AppError('Payroll not found', 404);
      }
      return { message: 'Payroll deleted successfully' };
    } catch (error: any) {
      if (error.message === 'Payroll not found') {
        throw error;
      }
      throw new AppError(`Error deleting payroll: ${error.message}`, 500);
    }
  }

  static async addSalaryComponent(id: string, component: { name: string; type: 'income' | 'deduction'; amount: number }) {
    try {
      const payroll = await PenggajianRepository.findById(id);
      if (!payroll) {
        throw new AppError('Payroll not found', 404);
      }

      if (component.type === 'income') {
        payroll.incomes = payroll.incomes || [];
        payroll.incomes.push({ name: component.name, amount: component.amount });
      } else {
        payroll.deductions = payroll.deductions || [];
        payroll.deductions.push({ name: component.name, amount: component.amount });
      }

      return await PenggajianRepository.update(id, payroll);

    } catch (error: any) {
      if (error.message === 'Payroll not found') {
        throw error;
      }
      throw new AppError(`Error adding salary component: ${error.message}`, 500);
    }
  }

  static async runPayroll(period: string) {
    try {
      const employees = await PegawaiRepository.findAll();
      const createdPayrolls = [];

      // Get all attendance data for this period (Mock implementation for now)
      // In a real scenario, we would query the AttendanceRepository
      // const attendanceSummary = await AttendanceRepository.getSummaryByPeriod(period);

      // Determine previous period (e.g., '2024-02' -> '2024-01')
      const [year, month] = period.split('-').map(Number);
      const prevDate = new Date(year, month - 2, 1); // month is 0-indexed in Date, so month-2 gives previous month
      const prevYear = prevDate.getFullYear();
      const prevMonth = String(prevDate.getMonth() + 1).padStart(2, '0');
      const previousPeriod = `${prevYear}-${prevMonth}`;

      for (const employee of employees) {
        if (employee.statusKaryawan !== 'aktif') {
          if (employee.isActive === 0) continue;
        }

        const existingPayroll = await PenggajianRepository.findByEmployeeIdAndPeriod(employee.id, period);
        if (existingPayroll) {
          continue;
        }

        // Try to fetch previous month's payroll
        const previousPayroll = await PenggajianRepository.findByEmployeeIdAndPeriod(employee.id, previousPeriod);

        let baseSalary = 0;
        let incomes = [];
        let deductions = [];

        if (previousPayroll) {
          // Copy from previous month
          baseSalary = previousPayroll.baseSalary;
          incomes = previousPayroll.incomes;
          deductions = previousPayroll.deductions;
        } else {
          // Fallback to Employee Master Data
          if (employee.payrollInfo) {
            try {
              const payrollInfo = typeof employee.payrollInfo === 'string'
                ? JSON.parse(employee.payrollInfo)
                : employee.payrollInfo;
              baseSalary = payrollInfo.baseSalary || 0;
              incomes = payrollInfo.incomes || [];
              deductions = payrollInfo.deductions || [];
            } catch (e) {
              console.error(`Error parsing payroll info for employee ${employee.id}`, e);
            }
          }
        }

        // Mock Attendance Data Calculation
        // TODO: Replace with actual AttendanceRepository call
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

        const createdPayroll = await PenggajianRepository.create(newPayrollData);
        createdPayrolls.push(createdPayroll);
      }

      return {
        message: `${createdPayrolls.length} payrolls generated for period ${period}. (Copied from ${previousPeriod} if available)`,
        data: createdPayrolls
      };

    } catch (error: any) {
      throw new AppError(`Error running payroll generation: ${error.message}`, 500);
    }
  }

  static async updateStatus(id: string, status: 'Draft' | 'Final' | 'Paid') {
    try {
      const payroll = await PenggajianRepository.findById(id);
      if (!payroll) throw new AppError('Payroll not found', 404);

      return await PenggajianRepository.update(id, { ...payroll, status });
    } catch (error: any) {
      throw new AppError(`Error updating payroll status: ${error.message}`, 500);
    }
  }

  static async generatePayslip(payrollId: string): Promise<Buffer> {
    try {
      const payroll = await PenggajianRepository.findById(payrollId);
      if (!payroll) {
        throw new AppError('Payroll not found', 404);
      }

      // For now, return a simple PDF buffer as a placeholder
      // In a real application, you would use a PDF generation library (e.g., pdf-lib, html-pdf)
      // to create a detailed payslip based on the payroll data.
      const doc = new PDFDocument();
      const buffers: Buffer[] = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        // This is a hack to return the buffer synchronously.
        // In a real app, you'd handle this with a Promise or stream.
      });

      doc.fontSize(25).text('Slip Gaji', { align: 'center' });
      doc.fontSize(12).text(`Periode: ${payroll.period}`);
      doc.text(`Nama Karyawan: ${payroll.employeeName}`);
      doc.text(`Gaji Pokok: ${payroll.baseSalary}`);
      doc.text(`Total Pendapatan: ${payroll.totalIncome}`);
      doc.text(`Total Potongan: ${payroll.totalDeductions}`);
      doc.text(`Gaji Bersih: ${payroll.netSalary}`);

      doc.end();

      // This is a simplified way to get the buffer.
      // A proper implementation would use a Promise to wait for the 'end' event.
      return new Promise((resolve) => {
        doc.on('end', () => {
          resolve(Buffer.concat(buffers));
        });
      });

    } catch (error: any) {
      throw new AppError(`Error generating payslip: ${error.message}`, 500);
    }
  }
}

export default PenggajianService;
