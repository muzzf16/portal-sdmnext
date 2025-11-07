"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const notifikasi_repository_1 = require("./notifikasi.repository");
const kontrak_repository_1 = require("../kontrak/kontrak.repository");
const permintaanCuti_repository_1 = require("../cuti/permintaanCuti.repository");
const penggajian_repository_1 = require("../penggajian/penggajian.repository");
const penilaianKinerja_repository_1 = require("../kinerja/penilaianKinerja.repository");
const errors_1 = require("../../utils/errors");
class PengingatOtomatisService {
    static async sendContractExpirationReminders() {
        try {
            const expiringContracts = await kontrak_repository_1.KontrakRepository.findExpiringContracts();
            const notifications = [];
            for (const contract of expiringContracts) {
                let daysUntilExpiration = 0;
                if (contract.endDate) {
                    const endDate = new Date(contract.endDate);
                    const today = new Date();
                    daysUntilExpiration = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                }
                let messageType = '';
                if (daysUntilExpiration === 30) {
                    messageType = 'kontrak_30_hari';
                }
                else if (daysUntilExpiration === 14) {
                    messageType = 'kontrak_14_hari';
                }
                else if (daysUntilExpiration === 7) {
                    messageType = 'kontrak_7_hari';
                }
                if (messageType) {
                    const notification = {
                        employee_id: contract.employeeId,
                        message: `Kontrak Anda akan berakhir dalam ${daysUntilExpiration} hari pada tanggal ${contract.endDate}. Silakan hubungi HR untuk perpanjangan.`,
                        type: 'warning',
                        delivery_channel: 'in_app',
                        related_entity: 'contract',
                        related_entity_id: contract.id,
                        scheduled_for: new Date().toISOString()
                    };
                    notifications.push(notification);
                }
            }
            for (const notification of notifications) {
                await notifikasi_repository_1.NotifikasiRepository.create(notification);
            }
            return {
                success: true,
                message: `Sent ${notifications.length} contract expiration reminders`,
                notificationsSent: notifications.length
            };
        }
        catch (error) {
            throw new errors_1.AppError(`Error sending contract expiration reminders: ${error.message}`, 500);
        }
    }
    static async sendLeaveApprovalNotifications() {
        try {
            const recentLeaveRequests = await permintaanCuti_repository_1.PermintaanCutiRepository.findRecentlyProcessed();
            const notifications = [];
            for (const leaveRequest of recentLeaveRequests) {
                const statusText = leaveRequest.status === 'disetujui' ? 'disetujui' : 'ditolak';
                const notification = {
                    employee_id: leaveRequest.employeeId,
                    message: `Permohonan cuti Anda untuk tanggal ${leaveRequest.startDate} sampai ${leaveRequest.endDate} telah ${statusText}.`,
                    type: leaveRequest.status === 'disetujui' ? 'success' : 'error',
                    delivery_channel: 'in_app',
                    related_entity: 'leave',
                    related_entity_id: leaveRequest.id,
                    scheduled_for: new Date().toISOString()
                };
                notifications.push(notification);
            }
            for (const notification of notifications) {
                await notifikasi_repository_1.NotifikasiRepository.create(notification);
            }
            return {
                success: true,
                message: `Sent ${notifications.length} leave approval notifications`,
                notificationsSent: notifications.length
            };
        }
        catch (error) {
            throw new errors_1.AppError(`Error sending leave approval notifications: ${error.message}`, 500);
        }
    }
    static async sendPayrollReleaseNotifications() {
        try {
            const recentPayrolls = await penggajian_repository_1.PenggajianRepository.findRecentlyProcessed();
            const notifications = [];
            for (const payroll of recentPayrolls) {
                const notification = {
                    employee_id: payroll.employeeId,
                    message: `Slip gaji untuk periode ${payroll.period} telah tersedia. Silakan cek halaman penggajian.`,
                    type: 'info',
                    delivery_channel: 'in_app',
                    related_entity: 'payroll',
                    related_entity_id: payroll.id,
                    scheduled_for: new Date().toISOString()
                };
                notifications.push(notification);
            }
            for (const notification of notifications) {
                await notifikasi_repository_1.NotifikasiRepository.create(notification);
            }
            return {
                success: true,
                message: `Sent ${notifications.length} payroll release notifications`,
                notificationsSent: notifications.length
            };
        }
        catch (error) {
            throw new errors_1.AppError(`Error sending payroll release notifications: ${error.message}`, 500);
        }
    }
    static async sendPerformanceReviewReminders() {
        try {
            const upcomingReviews = await penilaianKinerja_repository_1.PenilaianKinerjaRepository.findUpcomingReviews();
            const notifications = [];
            for (const review of upcomingReviews) {
                const notification = {
                    employee_id: review.employeeId,
                    message: `Jadwal evaluasi kinerja Anda untuk periode ${review.period} akan segera dilakukan. Silakan siapkan dokumen yang diperlukan.`,
                    type: 'info',
                    delivery_channel: 'in_app',
                    related_entity: 'performance',
                    related_entity_id: review.id,
                    scheduled_for: new Date().toISOString()
                };
                notifications.push(notification);
            }
            for (const notification of notifications) {
                await notifikasi_repository_1.NotifikasiRepository.create(notification);
            }
            return {
                success: true,
                message: `Sent ${notifications.length} performance review reminders`,
                notificationsSent: notifications.length
            };
        }
        catch (error) {
            throw new errors_1.AppError(`Error sending performance review reminders: ${error.message}`, 500);
        }
    }
    static async sendBirthdayReminders() {
        try {
            const birthdayEmployees = await PengingatOtomatisService.getEmployeesWithBirthdaysToday();
            const notifications = [];
            for (const employee of birthdayEmployees) {
                const teamMembers = await PengingatOtomatisService.getTeamMembers(employee.department);
                for (const teamMember of teamMembers) {
                    if (teamMember.id !== employee.id) {
                        const notification = {
                            employee_id: teamMember.id,
                            message: `Hari ini ulang tahun ${employee.name}! Jangan lupa memberikan ucapan selamat.`,
                            type: 'info',
                            delivery_channel: 'in_app',
                            related_entity: 'birthday',
                            related_entity_id: employee.id,
                            scheduled_for: new Date().toISOString()
                        };
                        notifications.push(notification);
                    }
                }
            }
            for (const notification of notifications) {
                await notifikasi_repository_1.NotifikasiRepository.create(notification);
            }
            return {
                success: true,
                message: `Sent ${notifications.length} birthday reminders`,
                notificationsSent: notifications.length
            };
        }
        catch (error) {
            throw new errors_1.AppError(`Error sending birthday reminders: ${error.message}`, 500);
        }
    }
    static async getEmployeesWithBirthdaysToday() {
        return [];
    }
    static async getTeamMembers(department) {
        return [];
    }
    static async sendAllAutomatedReminders() {
        try {
            const results = await Promise.allSettled([
                PengingatOtomatisService.sendContractExpirationReminders(),
                PengingatOtomatisService.sendLeaveApprovalNotifications(),
                PengingatOtomatisService.sendPayrollReleaseNotifications(),
                PengingatOtomatisService.sendPerformanceReviewReminders(),
                PengingatOtomatisService.sendBirthdayReminders()
            ]);
            const successful = results.filter(result => result.status === 'fulfilled');
            const failed = results.filter(result => result.status === 'rejected');
            return {
                success: true,
                message: `Sent automated reminders: ${successful.length} successful, ${failed.length} failed`,
                results: {
                    successful,
                    failed
                }
            };
        }
        catch (error) {
            throw new errors_1.AppError(`Error sending all automated reminders: ${error.message}`, 500);
        }
    }
}
exports.default = PengingatOtomatisService;
//# sourceMappingURL=pengingat.otomatis.service.js.map