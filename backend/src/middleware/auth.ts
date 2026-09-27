import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.ts';
import { Resident, Admin, Watchman } from '../models/index.ts';
import { UserRole, JWTPayload } from '../types/index.ts';

export interface AuthenticatedUser {
  id: string;
  phone: string;
  role: 'ADMIN' | 'WATCHMAN';
  full_name?: string;
  status?: 'active' | 'inactive';
  created_at?: string;
  _id?: any;
}

export interface AuthenticatedResident {
  id: string;
  full_name: string;
  room_number: string;
  phone: string;
  created_at?: string;
  role?: 'RESIDENT';
  _id?: any;
}

export interface AuthenticatedRequest extends Request {
  role?: UserRole;
  user?: AuthenticatedUser;
  resident?: AuthenticatedResident;
  watchman?: AuthenticatedUser;
}

export function generateToken(payload: {
  role: UserRole;
  userId?: string;
  residentId?: string;
}): string {
  // Watchman tokens 12 hours (shift based), Resident & Admin tokens 30 days
  const expiresIn = payload.role === 'WATCHMAN' ? '12h' : '30d';
  return jwt.sign(payload, ENV.JWT_SECRET, { expiresIn });
}

export async function parseSession(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    // Signed cookies are exposed via req.signedCookies; the plain req.cookies
    // fallback keeps sessions issued before signing was introduced working.
    let token = req.signedCookies?.society_token || req.cookies?.society_token;

    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next();
    }

    const decoded = jwt.verify(token, ENV.JWT_SECRET) as JWTPayload;
    req.role = decoded.role;

    if (decoded.role === 'RESIDENT' && decoded.residentId) {
      const resDoc = await Resident.findById(decoded.residentId);
      if (resDoc) {
        req.resident = resDoc.toJSON() as any;
      }
    } else if (decoded.userId) {
      if (decoded.role === 'ADMIN') {
        const adminDoc = await Admin.findById(decoded.userId);
        if (adminDoc) {
          req.user = adminDoc.toJSON() as any;
        }
      } else if (decoded.role === 'WATCHMAN') {
        const watchmanDoc = await Watchman.findById(decoded.userId);
        if (watchmanDoc) {
          const wSafe = watchmanDoc.toJSON() as any;
          req.user = wSafe;
          req.watchman = wSafe;
        }
      }
    }

    next();
  } catch (err) {
    // Invalid or expired token; proceed as unauthenticated
    next();
  }
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.role) {
    return res.status(401).json({ error: 'Authentication required. Please log in.' });
  }

  if (req.role === 'RESIDENT' && !req.resident) {
    return res.status(401).json({ error: 'Resident account no longer exists.' });
  }

  if ((req.role === 'ADMIN' || req.role === 'WATCHMAN') && !req.user) {
    return res.status(401).json({ error: 'User account not found.' });
  }

  if (req.role === 'WATCHMAN' && req.user?.status === 'inactive') {
    return res.status(403).json({ error: 'Watchman account is deactivated.' });
  }

  next();
}

export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (req.role !== 'ADMIN' || !req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Access denied. Administrator privileges required.' });
  }
  next();
}

export function requireResident(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (req.role !== 'RESIDENT' || !req.resident) {
    return res.status(403).json({ error: 'Access denied. Society resident access required.' });
  }
  next();
}

export function requireWatchman(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (req.role !== 'WATCHMAN' || !req.watchman || req.watchman.role !== 'WATCHMAN') {
    return res.status(403).json({ error: 'Access denied. Gate Watchman privileges required.' });
  }
  if (req.watchman.status === 'inactive') {
    return res.status(403).json({ error: 'Watchman account has been deactivated.' });
  }
  next();
}
