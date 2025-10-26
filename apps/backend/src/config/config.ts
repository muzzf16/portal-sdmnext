// config/config.ts
import dotenv from 'dotenv';
dotenv.config();

const config = {
  port: process.env.PORT || 3333,
  dbSource: process.env.DB_SOURCE || 'database.sqlite',
  dbJsonSeedSource: process.env.DB_JSON_SEED_SOURCE || './db.json',
  jwtSecret: process.env.JWT_SECRET || 'default_secret_for_development',
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
};

export default config;
