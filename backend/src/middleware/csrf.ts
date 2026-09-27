import type { Request, Response, NextFunction } from 'express';
import { ENV } from '../config/env.ts';

/**
 * Origin enforcement for state-changing requests.
 *
 * When the frontend is served from a different origin than the API (Vercel +
 * Render, see render.yaml) the session cookie must be `sameSite: 'none'`, which
 * means the browser attaches it to *any* cross-site request. CORS stops a
 * hostile page from reading the response, but it does not stop the request from
 * being sent and acted on. Without this check, a plain cross-site
 * `<form method="POST">` to a bodyless endpoint such as /api/admin/reset-seed
 * executes with the victim's session.
 *
 * `express.json()` only parses `application/json`, which incidentally forces a
 * CORS preflight on most routes. That is luck, not a control, so we verify the
 * Origin directly instead of relying on it.
 */

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

export function enforceTrustedOrigin(req: Request, res: Response, next: NextFunction) {
  if (SAFE_METHODS.has(req.method)) {
    return next();
  }

  // Single-origin deployment (the API also serves the SPA). Cookies are
  // sameSite: 'lax' there, so cross-site form posts already carry no cookie.
  if (ENV.CORS_ORIGINS.length === 0) {
    return next();
  }

  const origin = req.headers.origin;

  if (origin) {
    if (!ENV.CORS_ORIGINS.includes(origin)) {
      return res.status(403).json({
        error: 'Request blocked: untrusted origin. Please reload the page and try again.',
      });
    }
    return next();
  }

  // No Origin header at all. Browsers send one on every cross-site state-changing
  // request, so its absence means a non-browser client (curl, a seed script).
  // Sec-Fetch-Site lets us tell those apart from a stripped-header attack.
  const fetchSite = req.headers['sec-fetch-site'];
  if (typeof fetchSite === 'string' && fetchSite === 'cross-site') {
    return res.status(403).json({
      error: 'Request blocked: cross-site request rejected.',
    });
  }

  return next();
}
