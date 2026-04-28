import PengingatOtomatisService from '../modules/notifikasi/pengingat.otomatis.service';
import * as BackupService from '../modules/backup/backup.service';

class Scheduler {
  private static instance: Scheduler;
  private intervalIds: NodeJS.Timeout[] = [];

  private constructor() {}

  static getInstance(): Scheduler {
    if (!Scheduler.instance) {
      Scheduler.instance = new Scheduler();
    }
    return Scheduler.instance;
  }

  // Start all scheduled jobs
  startAllJobs() {
    // Run database backup daily at 2 AM
    this.scheduleDailyJob(() => {
      console.log('Running daily database backup...');
      BackupService.backupDatabase()
        .then(result => console.log('Daily database backup created:', result.data.filename))
        .catch(error => console.error('Error in daily database backup:', error));
    }, 2, 0);

    // Run contract expiration reminders daily at 9 AM
    this.scheduleDailyJob(() => {
      console.log('Running contract expiration reminders...');
      PengingatOtomatisService.sendContractExpirationReminders()
        .then(result => console.log('Contract expiration reminders result:', result))
        .catch(error => console.error('Error in contract expiration reminders:', error));
    }, 9, 0);

    // Run leave approval notifications every hour
    this.scheduleHourlyJob(() => {
      console.log('Running leave approval notifications...');
      PengingatOtomatisService.sendLeaveApprovalNotifications()
        .then(result => console.log('Leave approval notifications result:', result))
        .catch(error => console.error('Error in leave approval notifications:', error));
    }, 0); // Run at the start of every hour

    // Run payroll release notifications daily at 10 AM
    this.scheduleDailyJob(() => {
      console.log('Running payroll release notifications...');
      PengingatOtomatisService.sendPayrollReleaseNotifications()
        .then(result => console.log('Payroll release notifications result:', result))
        .catch(error => console.error('Error in payroll release notifications:', error));
    }, 10, 0);

    // Run performance review reminders daily at 11 AM
    this.scheduleDailyJob(() => {
      console.log('Running performance review reminders...');
      PengingatOtomatisService.sendPerformanceReviewReminders()
        .then(result => console.log('Performance review reminders result:', result))
        .catch(error => console.error('Error in performance review reminders:', error));
    }, 11, 0);

    // Run birthday reminders daily at 8 AM
    this.scheduleDailyJob(() => {
      console.log('Running birthday reminders...');
      PengingatOtomatisService.sendBirthdayReminders()
        .then(result => console.log('Birthday reminders result:', result))
        .catch(error => console.error('Error in birthday reminders:', error));
    }, 8, 0);

    // Run all automated reminders every day at midnight
    this.scheduleDailyJob(() => {
      console.log('Running all automated reminders...');
      PengingatOtomatisService.sendAllAutomatedReminders()
        .then(result => console.log('All automated reminders result:', result))
        .catch(error => console.error('Error in all automated reminders:', error));
    }, 0, 0);

    console.log('All scheduled jobs started');
  }

  // Schedule a job to run daily at a specific time
  private scheduleDailyJob(job: () => void, hour: number, minute: number) {
    const now = new Date();
    const nextRun = new Date();
    nextRun.setHours(hour, minute, 0, 0);

    // If the time has already passed today, schedule for tomorrow
    if (nextRun <= now) {
      nextRun.setDate(nextRun.getDate() + 1);
    }

    const timeToNextRun = nextRun.getTime() - now.getTime();
    
    // Set initial timeout
    const initialTimeoutId = setTimeout(() => {
      job();
      
      // Set recurring interval (every 24 hours)
      const intervalId = setInterval(job, 24 * 60 * 60 * 1000);
      this.intervalIds.push(intervalId);
    }, timeToNextRun);
    
    // Store the initial timeout ID so we can clear it if needed
    this.intervalIds.push(initialTimeoutId as any);
  }

  // Schedule a job to run hourly at a specific minute
  private scheduleHourlyJob(job: () => void, minute: number) {
    const now = new Date();
    const nextRun = new Date();
    nextRun.setMinutes(minute, 0, 0);

    // If the time has already passed this hour, schedule for next hour
    if (nextRun <= now) {
      nextRun.setHours(nextRun.getHours() + 1);
    }

    const timeToNextRun = nextRun.getTime() - now.getTime();
    
    // Set initial timeout
    const initialTimeoutId = setTimeout(() => {
      job();
      
      // Set recurring interval (every hour)
      const intervalId = setInterval(job, 60 * 60 * 1000);
      this.intervalIds.push(intervalId);
    }, timeToNextRun);
    
    // Store the initial timeout ID so we can clear it if needed
    this.intervalIds.push(initialTimeoutId as any);
  }

  // Stop all scheduled jobs
  stopAllJobs() {
    this.intervalIds.forEach(id => clearInterval(id));
    this.intervalIds = [];
    console.log('All scheduled jobs stopped');
  }
}

export default Scheduler;