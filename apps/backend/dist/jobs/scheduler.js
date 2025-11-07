"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pengingat_otomatis_service_1 = __importDefault(require("../modules/notifikasi/pengingat.otomatis.service"));
class Scheduler {
    constructor() {
        this.intervalIds = [];
    }
    static getInstance() {
        if (!Scheduler.instance) {
            Scheduler.instance = new Scheduler();
        }
        return Scheduler.instance;
    }
    startAllJobs() {
        this.scheduleDailyJob(() => {
            console.log('Running contract expiration reminders...');
            pengingat_otomatis_service_1.default.sendContractExpirationReminders()
                .then(result => console.log('Contract expiration reminders result:', result))
                .catch(error => console.error('Error in contract expiration reminders:', error));
        }, 9, 0);
        this.scheduleHourlyJob(() => {
            console.log('Running leave approval notifications...');
            pengingat_otomatis_service_1.default.sendLeaveApprovalNotifications()
                .then(result => console.log('Leave approval notifications result:', result))
                .catch(error => console.error('Error in leave approval notifications:', error));
        }, 0);
        this.scheduleDailyJob(() => {
            console.log('Running payroll release notifications...');
            pengingat_otomatis_service_1.default.sendPayrollReleaseNotifications()
                .then(result => console.log('Payroll release notifications result:', result))
                .catch(error => console.error('Error in payroll release notifications:', error));
        }, 10, 0);
        this.scheduleDailyJob(() => {
            console.log('Running performance review reminders...');
            pengingat_otomatis_service_1.default.sendPerformanceReviewReminders()
                .then(result => console.log('Performance review reminders result:', result))
                .catch(error => console.error('Error in performance review reminders:', error));
        }, 11, 0);
        this.scheduleDailyJob(() => {
            console.log('Running birthday reminders...');
            pengingat_otomatis_service_1.default.sendBirthdayReminders()
                .then(result => console.log('Birthday reminders result:', result))
                .catch(error => console.error('Error in birthday reminders:', error));
        }, 8, 0);
        this.scheduleDailyJob(() => {
            console.log('Running all automated reminders...');
            pengingat_otomatis_service_1.default.sendAllAutomatedReminders()
                .then(result => console.log('All automated reminders result:', result))
                .catch(error => console.error('Error in all automated reminders:', error));
        }, 0, 0);
        console.log('All scheduled jobs started');
    }
    scheduleDailyJob(job, hour, minute) {
        const now = new Date();
        const nextRun = new Date();
        nextRun.setHours(hour, minute, 0, 0);
        if (nextRun <= now) {
            nextRun.setDate(nextRun.getDate() + 1);
        }
        const timeToNextRun = nextRun.getTime() - now.getTime();
        const initialTimeoutId = setTimeout(() => {
            job();
            const intervalId = setInterval(job, 24 * 60 * 60 * 1000);
            this.intervalIds.push(intervalId);
        }, timeToNextRun);
        this.intervalIds.push(initialTimeoutId);
    }
    scheduleHourlyJob(job, minute) {
        const now = new Date();
        const nextRun = new Date();
        nextRun.setMinutes(minute, 0, 0);
        if (nextRun <= now) {
            nextRun.setHours(nextRun.getHours() + 1);
        }
        const timeToNextRun = nextRun.getTime() - now.getTime();
        const initialTimeoutId = setTimeout(() => {
            job();
            const intervalId = setInterval(job, 60 * 60 * 1000);
            this.intervalIds.push(intervalId);
        }, timeToNextRun);
        this.intervalIds.push(initialTimeoutId);
    }
    stopAllJobs() {
        this.intervalIds.forEach(id => clearInterval(id));
        this.intervalIds = [];
        console.log('All scheduled jobs stopped');
    }
}
exports.default = Scheduler;
//# sourceMappingURL=scheduler.js.map