// config/config.ts
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const requiredEnvVars = ['JWT_SECRET'];

// Crash application if mandatory variables are missing in production
if (process.env.NODE_ENV === 'production') {
  const missing = requiredEnvVars.filter(envVar => !process.env[envVar]);
  if (missing.length > 0) {
    console.error(`\x1b[31m[FATAL] Missing mandatory environment variables: ${missing.join(', ')}\x1b[0m`);
    console.error(`Production requires these variables to be set for security.`);
    process.exit(1);
  }
}

const config = {
  port: process.env.PORT || 3333,
  dbSource: process.env.DB_SOURCE || 'database.sqlite',
  dbJsonSeedSource: process.env.DB_JSON_SEED_SOURCE || './db.json',
  jwtSecret: process.env.JWT_SECRET || 'dev_secret_only',
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
};

export default config;
