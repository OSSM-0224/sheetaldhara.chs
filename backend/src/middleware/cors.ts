import type { Request, Response, NextFunction } from 'express';
import { ENV } from '../config/env.ts';

/**
 * Credentialed CORS for an explicit allowlist of frontend origins.
 *
 * The allowlist is deliberately explicit. Reflecting an arbitrary Origin while
 * sending `credentials: true` would let any site on the internet make
 * authenticated requests as the logged-in user. Unlisted origins get no CORS
 * headers at all, so the browser blocks them.
 */
export function cors(req: Request, res: Response, next: NextFunction) {
  const origin = req.headers.origin;

  // Always set, so caches don't serve one origin's response to another.
  res.setHeader('Vary', 'Origin');

  if (origin && ENV.CORS_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Max-Age', '86400');
  }

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  next();
}
