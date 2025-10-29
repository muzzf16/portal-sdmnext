import app from './app';
import Scheduler from './jobs/scheduler';

const PORT = parseInt(process.env.PORT || '3333', 10);

const server = app.listen(PORT, () => console.log(`API running on ${PORT}`));

// Start the scheduler for automated reminders
const scheduler = Scheduler.getInstance();
scheduler.startAllJobs();

// Graceful shutdown
const shutdown = (signal: string) => {
	console.log(`Received ${signal}. Shutting down gracefully...`);
	
	// Stop all scheduled jobs
	scheduler.stopAllJobs();
	
	server.close(() => {
		console.log('Closed out remaining connections.');
		process.exit(0);
	});
	// Force exit after timeout
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