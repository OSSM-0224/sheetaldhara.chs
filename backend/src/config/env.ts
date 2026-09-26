import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

const cwd = process.cwd();
const projectRoot = fs.existsSync(path.join(cwd, 'frontend')) ? cwd : path.resolve(cwd, '..');

// Load .env if present
dotenv.config({ path: path.join(projectRoot, '.env') });

export const ENV = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: Number(process.env.PORT) || 3000,
  JWT_SECRET: process.env.JWT_SECRET || 'sheetaldhara-society-secret-key-jwt-2026',
  ADMIN_PHONE: process.env.ADMIN_PHONE || '9820011223',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'admin123',
  DATA_DIR: path.join(projectRoot, 'data'),
  DB_FILE: path.join(projectRoot, 'data', 'society_db.json'),
  COOKIE_SECRET: process.env.COOKIE_SECRET || 'sheetaldhara-cookie-secret-2026',
  MONGODB_URI: process.env.MONGODB_URI || '',
};
