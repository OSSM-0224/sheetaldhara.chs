import { ENV } from './env.ts';

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * A non-empty CORS_ORIGINS means the frontend is served from a different site
 * (Vercel) than the API (Render). Browsers only send cookies in that setup when
 * sameSite is 'none', and 'none' is only accepted alongside secure.
 */
const isCrossSite = ENV.CORS_ORIGINS.length > 0 && ENV.NODE_ENV === 'production';

export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isCrossSite || ENV.NODE_ENV === 'production',
  sameSite: isCrossSite ? ('none' as const) : ('lax' as const),
  maxAge: THIRTY_DAYS_MS,
  path: '/',
  // Signed with COOKIE_SECRET so a tampered cookie is rejected by cookie-parser
  // instead of being handed to jwt.verify as if it were legitimate.
  signed: true,
};
