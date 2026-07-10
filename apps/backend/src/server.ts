import app from './app';
import Scheduler from './jobs/scheduler';
import { openDb } from './config/db';

const PORT = parseInt(process.env.PORT || '3333', 10);

// Run pending migrations before starting the server
const runMigrations = async () => {
  const db = await openDb();
  const migrations = [
    { table: 'pengguna', column: 'avatarUrl', type: 'TEXT' },
    { table: 'pegawai', column: 'tanggalCalonPegawai', type: 'TEXT' },
    { table: 'pegawai', column: 'tanggalKenaikanPangkatTerakhir', type: 'TEXT' },
    { table: 'pegawai', column: 'tanggalKenaikanPangkatSelanjutnya', type: 'TEXT' },
    { table: 'pegawai', column: 'tanggalKenaikanGajiBerkala', type: 'TEXT' },
  ];

  for (const m of migrations) {
    try {
      await db.run(`ALTER TABLE ${m.table} ADD COLUMN ${m.column} ${m.type}`);
      console.log(`Migration: added ${m.table}.${m.column}`);
    } catch (err: any) {
      // Column already exists — ignore silently
      if (!err.message?.includes('duplicate column name')) {
        console.error(`Migration error (${m.table}.${m.column}):`, err.message);
      }
    }
  }
};

runMigrations()
  .then(() => {
    const server = app.listen(PORT, () => console.log(`API running on ${PORT}`));

    // Start the scheduler for automated reminders
    const scheduler = Scheduler.getInstance();
    scheduler.startAllJobs();

    // Graceful shutdown
    const shutdown = (signal: string) => {
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
  })
  .catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection at:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception thrown:', err);
  process.exit(1);
});