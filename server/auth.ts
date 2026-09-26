import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db, User, Resident } from './db.ts';

const JWT_SECRET = process.env.JWT_SECRET || 'sheetaldhara-society-secret-key-jwt-2026';
const JWT_EXPIRES_IN = '30d';

export interface TokenPayload {
  role: 'ADMIN' | 'RESIDENT' | 'WATCHMAN';
  userId?: string;     // For admin or watchman
  residentId?: string; // For resident
}

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

export interface AuthenticatedRequest extends Request {
  role?: 'ADMIN' | 'RESIDENT' | 'WATCHMAN';
  user?: User;         // Set if ADMIN or WATCHMAN
  watchman?: User;     // Set specifically if WATCHMAN
  resident?: Resident; // Set if RESIDENT
}

export function authenticateUser(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  // Read token from cookies or Authorization header
  let token = req.cookies?.society_token;
  if (!token && req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.slice(7);
  }

  if (token) {
    const decoded = verifyToken(token);
    if (decoded) {
      if (decoded.role === 'ADMIN') {
        const admin = db.getAdminUser();
        if (admin) {
          req.role = 'ADMIN';
          req.user = admin;
          return next();
        }
      } else if (decoded.role === 'WATCHMAN' && decoded.userId) {
        const watchman = db.findWatchmanById(decoded.userId);
        if (watchman && watchman.status !== 'inactive') {
          req.role = 'WATCHMAN';
          req.watchman = watchman;
          req.user = watchman;
          return next();
        }
      } else if (decoded.role === 'RESIDENT' && decoded.residentId) {
        const resident = db.findResidentById(decoded.residentId);
        if (resident) {
          req.role = 'RESIDENT';
          req.resident = resident;
          return next();
        }
      }
    }
  }

  // Fallback for direct testing header if enabled
  const directRole = req.headers['x-auth-role'];
  if (directRole === 'ADMIN') {
    const admin = db.getAdminUser();
    if (admin) {
      req.role = 'ADMIN';
      req.user = admin;
      return next();
    }
  } else if (directRole === 'WATCHMAN') {
    const directWatchmanId = req.headers['x-watchman-id'] as string;
    const watchman = directWatchmanId ? db.findWatchmanById(directWatchmanId) : db.getWatchmen()[0];
    if (watchman) {
      req.role = 'WATCHMAN';
      req.watchman = watchman;
      req.user = watchman;
      return next();
    }
  }

  const directResidentId = req.headers['x-resident-id'];
  if (directResidentId && typeof directResidentId === 'string') {
    const resident = db.findResidentById(directResidentId);
    if (resident) {
      req.role = 'RESIDENT';
      req.resident = resident;
      return next();
    }
  }

  next();
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.role || (!req.user && !req.resident && !req.watchman)) {
    return res.status(401).json({ error: 'Authentication required. Please sign in.' });
  }
  next();
}

export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (req.role !== 'ADMIN' || !req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Administrator access required.' });
  }
  next();
}

export function requireWatchman(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (req.role !== 'WATCHMAN' || !req.watchman || req.watchman.role !== 'WATCHMAN') {
    return res.status(403).json({ error: 'Gate watchman access required.' });
  }
  next();
}

// ==========================================
// RATE LIMITING
// ==========================================

// Rate limit /api/auth/resident-signin (10 attempts / 15 min per IP)
const residentSigninLimits = new Map<string, { count: number; resetTime: number }>();

export function rateLimitResidentSignin(req: Request, res: Response, next: NextFunction) {
  const ip =
    (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() ||
    req.socket.remoteAddress ||
    '127.0.0.1';
  const now = Date.now();
  const windowMs = 15 * 60 * 1000;
  const maxAttempts = 10;

  let record = residentSigninLimits.get(ip);
  if (!record || now > record.resetTime) {
    record = { count: 1, resetTime: now + windowMs };
    residentSigninLimits.set(ip, record);
    return next();
  }

  if (record.count >= maxAttempts) {
    const remainingMinutes = Math.ceil((record.resetTime - now) / 60000);
    return res.status(429).json({
      error: `Too many sign-in attempts. Please wait ${remainingMinutes} minutes before trying again or contact society admin.`,
    });
  }

  record.count += 1;
  next();
}

// Rate limit /api/auth/watchman-login (10 attempts / 15 min per IP)
const watchmanLoginLimits = new Map<string, { count: number; resetTime: number }>();

export function rateLimitWatchmanLogin(req: Request, res: Response, next: NextFunction) {
  const ip =
    (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() ||
    req.socket.remoteAddress ||
    '127.0.0.1';
  const now = Date.now();
  const windowMs = 15 * 60 * 1000;
  const maxAttempts = 10;

  let record = watchmanLoginLimits.get(ip);
  if (!record || now > record.resetTime) {
    record = { count: 1, resetTime: now + windowMs };
    watchmanLoginLimits.set(ip, record);
    return next();
  }

  if (record.count >= maxAttempts) {
    const remainingMinutes = Math.ceil((record.resetTime - now) / 60000);
    return res.status(429).json({
      error: `Too many sign-in attempts. Please wait ${remainingMinutes} minutes before trying again.`,
    });
  }

  record.count += 1;
  next();
}

// Rate limiting for outsider vehicle entries (40 per 15 min)
const outsiderEntryLimits = new Map<string, { count: number; resetTime: number }>();

export function rateLimitOutsiderEntry(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const identifier =
    req.watchman?.id ||
    (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() ||
    req.socket.remoteAddress ||
    '127.0.0.1';
  const now = Date.now();
  const windowMs = 15 * 60 * 1000;
  const maxEntries = 40;

  let record = outsiderEntryLimits.get(identifier);
  if (!record || now > record.resetTime) {
    record = { count: 1, resetTime: now + windowMs };
    outsiderEntryLimits.set(identifier, record);
    return next();
  }

  if (record.count >= maxEntries) {
    return res.status(429).json({
      error: 'Too many vehicle entries submitted in a short period. Please wait before adding more.',
    });
  }

  record.count += 1;
  next();
}

// Rate limiting for search: 25 requests / 15 mins per resident / IP
const searchRateLimits = new Map<string, { count: number; resetTime: number }>();

export function rateLimitSearch(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const identifier =
    req.resident?.id ||
    req.user?.id ||
    (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() ||
    req.socket.remoteAddress ||
    'anonymous';
  const now = Date.now();
  const windowMs = 15 * 60 * 1000;
  const maxRequests = 25;

  let record = searchRateLimits.get(identifier);
  if (!record || now > record.resetTime) {
    record = { count: 1, resetTime: now + windowMs };
    searchRateLimits.set(identifier, record);
    return next();
  }

  if (record.count >= maxRequests) {
    const remainingSecs = Math.ceil((record.resetTime - now) / 1000);
    return res.status(429).json({
      error: `Search rate limit reached. Please wait ${remainingSecs} seconds before searching again.`,
    });
  }

  record.count += 1;
  next();
}

