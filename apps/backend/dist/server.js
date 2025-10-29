"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const scheduler_1 = __importDefault(require("./jobs/scheduler"));
const PORT = parseInt(process.env.PORT || '3333', 10);
const server = app_1.default.listen(PORT, () => console.log(`API running on ${PORT}`));
const scheduler = scheduler_1.default.getInstance();
scheduler.startAllJobs();
const shutdown = (signal) => {
    console.log(`Received ${signal}. Shutting down gracefully...`);
    scheduler.stopAllJobs();
    server.close(() => {
        console.log('Closed out remaining connections.');
        process.exit(0);
    });
    setTimeout(() => {
        console.error('Could not close connections in time, forcing shut down');
        process.exit(1);
    }, 10000).unref();
};
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('unhandledRejection', (reason) => {
    console.error('Unhandled Rejection at:', reason);
});
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception thrown:', err);
    process.exit(1);
});
//# sourceMappingURL=server.js.map