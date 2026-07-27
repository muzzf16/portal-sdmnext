import { withTransaction } from '../../config/db';
import { AppError } from '../../utils/errors';
import { getCompanySettings } from '../company-settings/company-settings.repository';
import { PermintaanCutiRepository } from './permintaanCuti.repository';
import {
  CreateLeaveRequestInput,
  LEAVE_STATUSES,
  LeaveBalanceSummary,
  LeaveRequestFilters,
  isAnnualLeaveType,
  shouldDeductAnnualLeave,
  normalizeLeaveStatus
} from './cuti.types';

import { HolidaysRepository } from '../holidays/holidays.repository';

const parseFilters = (query: Record<string, unknown>): LeaveRequestFilters => ({
  employeeId: typeof query.employeeId === 'string' ? query.employeeId : undefined,
  status: typeof query.status === 'string' ? query.status : undefined
});

const assertValidDateRange = (startDate: string, endDate: string) => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    throw new AppError('Tanggal cuti tidak valid', 400);
  }

  if (end < start) {
    throw new AppError('Tanggal selesai tidak boleh lebih awal dari tanggal mulai', 400);
  }
};

const assertRequiredLeaveFields = (requestData: Partial<CreateLeaveRequestInput>) => {
  if (!requestData.employeeId || !requestData.employeeName || !requestData.leaveType || !requestData.startDate || !requestData.endDate) {
    throw new AppError('Data pengajuan cuti belum lengkap', 400);
  }
};

class CutiService {
  static async getAllPermintaanCuti(query: Record<string, unknown>) {
    try {
      return await PermintaanCutiRepository.findAll(parseFilters(query));
    } catch (error: any) {
      throw new AppError(`Error retrieving leave requests: ${error.message}`, 500);
    }
  }

  static async getPermintaanCutiById(id: string) {
    try {
      const request = await PermintaanCutiRepository.findById(id);
      if (!request) {
        throw new AppError('Leave request not found', 404);
      }
      return request;
    } catch (error: any) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(`Error retrieving leave request: ${error.message}`, 500);
    }
  }

  static async getPermintaanCutiByEmployeeId(employeeId: string) {
    try {
      return await PermintaanCutiRepository.findByEmployeeId(employeeId);
    } catch (error: any) {
      throw new AppError(`Error retrieving leave requests: ${error.message}`, 500);
    }
  }

  static async submitPermintaanCuti(requestData: Partial<CreateLeaveRequestInput>) {
    try {
      assertRequiredLeaveFields(requestData);
      assertValidDateRange(requestData.startDate!, requestData.endDate!);

      return await PermintaanCutiRepository.create({
        employeeId: requestData.employeeId!,
        employeeName: requestData.employeeName!,
        leaveType: requestData.leaveType!,
        startDate: requestData.startDate!,
        endDate: requestData.endDate!,
        reason: requestData.reason || '',
        supportingDocument: requestData.supportingDocument || null,
        rejectionReason: requestData.rejectionReason || null
      });
    } catch (error: any) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(`Error submitting leave request: ${error.message}`, 500);
    }
  }

  static async updatePermintaanCuti(id: string, requestData: Partial<CreateLeaveRequestInput>) {
    try {
      if (requestData.startDate && requestData.endDate) {
        assertValidDateRange(requestData.startDate, requestData.endDate);
      }
      return await PermintaanCutiRepository.update(id, requestData);
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      throw new AppError(`Error updating leave request: ${error.message}`, 500);
    }
  }

  static async updateStatusCuti(id: string, status: string, rejectionReason: string | null) {
    try {
      const nextStatus = normalizeLeaveStatus(status);
      return await withTransaction(async (db) => {
        const existingRequest = await PermintaanCutiRepository.findById(id, db);

        if (!existingRequest) {
          throw new AppError('Leave request not found', 404);
        }

        const previousStatus = normalizeLeaveStatus(existingRequest.status);
        const updatedRequest = await PermintaanCutiRepository.updateStatus(
          id,
          nextStatus,
          nextStatus === LEAVE_STATUSES.rejected ? rejectionReason : null,
          db
        );

        if (shouldDeductAnnualLeave(existingRequest.leaveType, existingRequest.supportingDocument)) {
          const leaveDays = existingRequest.jumlahHari ?? PermintaanCutiRepository.calculateLeaveDuration(existingRequest.startDate, existingRequest.endDate);
          const employee = await PermintaanCutiRepository.findEmployeeLeaveBalance(existingRequest.employeeId, db);

          if (employee) {
            if (previousStatus !== LEAVE_STATUSES.approved && nextStatus === LEAVE_STATUSES.approved) {
              await PermintaanCutiRepository.updateEmployeeLeaveBalance(
                existingRequest.employeeId,
                Math.max(0, employee.leaveBalance - leaveDays),
                db
              );
            }

            if (previousStatus === LEAVE_STATUSES.approved && nextStatus !== LEAVE_STATUSES.approved) {
              await PermintaanCutiRepository.updateEmployeeLeaveBalance(
                existingRequest.employeeId,
                employee.leaveBalance + leaveDays,
                db
              );
            }
          }
        }

        return updatedRequest;
      });
    } catch (error: any) {
      if (error instanceof AppError) {
        throw error;
      }

      if (error.message?.includes('not found')) {
        throw new AppError(error.message, 404);
      }

      throw new AppError(`Error updating leave request status: ${error.message}`, 500);
    }
  }

  static async deletePermintaanCuti(id: string) {
    try {
      const deleted = await PermintaanCutiRepository.delete(id);
      if (!deleted) {
        throw new AppError('Leave request not found', 404);
      }
      return { message: 'Leave request deleted successfully' };
    } catch (error: any) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(`Error deleting leave request: ${error.message}`, 500);
    }
  }

  static async getSisaCuti(employeeId: string): Promise<LeaveBalanceSummary> {
    try {
      const approvedLeaves = await PermintaanCutiRepository.findApprovedByEmployeeId(employeeId);
      const annualApprovedLeaves = approvedLeaves.filter((cutiItem) =>
        shouldDeductAnnualLeave(cutiItem.leaveType, cutiItem.supportingDocument)
      );

      const totalCutiDiambil = annualApprovedLeaves.reduce((total, cutiItem) => {
        const leaveDays = cutiItem.jumlahHari ?? PermintaanCutiRepository.calculateLeaveDuration(cutiItem.startDate, cutiItem.endDate);
        return total + leaveDays;
      }, 0);

      const companySettings = await getCompanySettings();
      const jumlahJatahCuti = companySettings?.annualLeaveQuota || 12;
      const currentYear = new Date().getFullYear();
      
      const cutiBersamaData = await HolidaysRepository.findAll();
      const cutiBersamaTahunIni = cutiBersamaData.filter((cutiBersama) =>
        new Date(cutiBersama.tanggal).getFullYear() === currentYear &&
        (cutiBersama.deskripsi || '').toLowerCase().includes('cuti bersama')
      ).length;

      return {
        jatahCuti: jumlahJatahCuti,
        cutiDiambil: totalCutiDiambil,
        cutiBersama: cutiBersamaTahunIni,
        sisaCuti: jumlahJatahCuti - totalCutiDiambil - cutiBersamaTahunIni,
        sumberJatah: companySettings ? 'company_settings' : 'default_uu13_2003'
      };
    } catch (error: any) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(`Error calculating remaining leave: ${error.message}`, 500);
    }
  }

  static async getCutiBersama() {
    const currentYear = new Date().getFullYear();
    const cutiBersamaData = await HolidaysRepository.findAll();
    return cutiBersamaData.filter(
      (cb) => new Date(cb.tanggal).getFullYear() === currentYear &&
      (cb.deskripsi || '').toLowerCase().includes('cuti bersama')
    );
  }

  static async getBatchSisaCuti(): Promise<Array<LeaveBalanceSummary & { employeeId: string; employeeName: string }>> {
    try {
      const companySettings = await getCompanySettings();
      const jumlahJatahCuti = companySettings?.annualLeaveQuota || 12;
      const currentYear = new Date().getFullYear();
      
      const cutiBersamaData = await HolidaysRepository.findAll();
      const cutiBersamaTahunIni = cutiBersamaData.filter(
        (cb) => new Date(cb.tanggal).getFullYear() === currentYear &&
        (cb.deskripsi || '').toLowerCase().includes('cuti bersama')
      ).length;
      const sumberJatah = companySettings ? 'company_settings' : 'default_uu13_2003';

      const allEmployees = await PermintaanCutiRepository.findAllActiveEmployees();
      const allApprovedLeaves = await PermintaanCutiRepository.findAll({ status: 'disetujui' });

      return allEmployees.map((emp) => {
        const empLeaves = allApprovedLeaves.filter(
          (l) => l.employeeId === emp.id && shouldDeductAnnualLeave(l.leaveType, l.supportingDocument)
        );
        const cutiDiambil = empLeaves.reduce((total, item) => {
          return total + (item.jumlahHari ?? PermintaanCutiRepository.calculateLeaveDuration(item.startDate, item.endDate));
        }, 0);

        return {
          employeeId: emp.id,
          employeeName: emp.name,
          jatahCuti: jumlahJatahCuti,
          cutiDiambil,
          cutiBersama: cutiBersamaTahunIni,
          sisaCuti: jumlahJatahCuti - cutiDiambil - cutiBersamaTahunIni,
          sumberJatah
        };
      });
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      throw new AppError(`Error calculating batch leave balance: ${error.message}`, 500);
    }
  }
}

export default CutiService;
