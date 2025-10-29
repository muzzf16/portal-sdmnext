declare class Scheduler {
    private static instance;
    private intervalIds;
    private constructor();
    static getInstance(): Scheduler;
    startAllJobs(): void;
    private scheduleDailyJob;
    private scheduleHourlyJob;
    stopAllJobs(): void;
}
export default Scheduler;
//# sourceMappingURL=scheduler.d.ts.map