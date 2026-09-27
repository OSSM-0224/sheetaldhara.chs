import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

const cwd = process.cwd();
const projectRoot = fs.existsSync(path.join(cwd, 'frontend')) ? cwd : path.resolve(cwd, '..');

// Load .env if present
dotenv.config({ path: path.join(projectRoot, '.env') });

const NODE_ENV = process.env.NODE_ENV || 'development';
const isProd = NODE_ENV === 'production';

// Credentials that ship in this repo. If any of them reach production, the
// seeded admin/watchman accounts are wide open to anyone who has read the repo.
const KNOWN_INSECURE_PASSWORDS = new Set(['admin123', 'watchman123', 'password', '123456']);

/**
 * Read a credential that must be supplied in production.
 * In development we fall back to the demo values so local setup stays frictionless.
 */
function requiredInProd(name: string, devFallback: string): string {
  const value = process.env[name];

  if (value && value.trim().length > 0) {
    return value.trim();
  }

  if (isProd) {
    throw new Error(
      `${name} must be set in production. Refusing to start with the built-in demo value.`
    );
  }

  return devFallback;
}

/** Reject known demo passwords and anything too short, but only in production. */
function assertPasswordIsSafe(name: string, value: string, devFallback: string): string {
  if (isProd) {
    if (KNOWN_INSECURE_PASSWORDS.has(value.toLowerCase())) {
      throw new Error(
        `${name} is set to a well-known demo password. Change it before starting in production.`
      );
    }

    if (value.length < 8) {
      throw new Error(`${name} must be at least 8 characters long in production.`);
    }
  } else if (value === devFallback) {
    console.warn(
      `[env] ${name} is using the built-in demo value. This is allowed in development only.`
    );
  }

  return value;
}

const adminPassword = assertPasswordIsSafe(
  'ADMIN_PASSWORD',
  requiredInProd('ADMIN_PASSWORD', 'admin123'),
  'admin123'
);

const watchmanPassword = assertPasswordIsSafe(
  'WATCHMAN_PASSWORD',
  requiredInProd('WATCHMAN_PASSWORD', 'watchman123'),
  'watchman123'
);

// Secret values that ship in this repo. Using any of them in production means
// sessions/cookies can be forged by anyone who has read the repository.
const INSECURE_SECRET_PATTERN = /sheetaldhara|secret-key|cookie-secret/i;

if (isProd) {
  const weakSecrets: string[] = [];

  if (!process.env.JWT_SECRET || INSECURE_SECRET_PATTERN.test(process.env.JWT_SECRET)) {
    weakSecrets.push('JWT_SECRET');
  }
  if (!process.env.COOKIE_SECRET || INSECURE_SECRET_PATTERN.test(process.env.COOKIE_SECRET)) {
    weakSecrets.push('COOKIE_SECRET');
  }

  if (weakSecrets.length > 0) {
    throw new Error(
      `${weakSecrets.join(' and ')} ${weakSecrets.length > 1 ? 'are' : 'is'} using a built-in demo value. ` +
        'Set strong random secrets in production.'
    );
  }
}

export const ENV = {
  NODE_ENV,
  PORT: Number(process.env.PORT) || 3000,
  JWT_SECRET: process.env.JWT_SECRET || 'sheetaldhara-society-secret-key-jwt-2026',
  ADMIN_PHONE: requiredInProd('ADMIN_PHONE', '9820011223'),
  ADMIN_PASSWORD: adminPassword,
  ADMIN_NAME: process.env.ADMIN_NAME || 'Ramesh Sharma',
  WATCHMAN_PHONE: requiredInProd('WATCHMAN_PHONE', '9820099001'),
  WATCHMAN_PASSWORD: watchmanPassword,
  WATCHMAN_NAME: process.env.WATCHMAN_NAME || 'Sanjay Yadav',
  COOKIE_SECRET: process.env.COOKIE_SECRET || 'sheetaldhara-cookie-secret-2026',
  MONGODB_URI: process.env.MONGODB_URI || '',
  // Comma-separated frontend origins allowed to call the API with credentials,
  // e.g. "https://your-app.vercel.app". Leave empty when the API serves the frontend itself.
  CORS_ORIGINS: (process.env.CORS_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
};
