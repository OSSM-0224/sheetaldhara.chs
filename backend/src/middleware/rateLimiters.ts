import rateLimit from 'express-rate-limit';
import type { RateLimitRequestHandler } from 'express-rate-limit';

// Standard rate limit options avoiding proxy header validation errors behind Cloud Run / reverse proxies
const defaultRateLimitOptions = {
  standardHeaders: true,
  legacyHeaders: false,
  validate: {
    xForwardedForHeader: false,
    forwardedHeader: false,
    default: true,
  },
};

// Login limiters only count *failed* attempts. A society behind one shared
// public IP (very common on Indian mobile networks) would otherwise have one
// guard's typo lock every other guard and the admin out of logging in.
const failedAttemptsOnly = {
  ...defaultRateLimitOptions,
  skipSuccessfulRequests: true,
};

export const rateLimitResidentSignin: RateLimitRequestHandler = rateLimit({
  ...failedAttemptsOnly,
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: {
    error: 'Too many resident sign-in attempts from this IP. Please try again in 15 minutes.',
  },
});

export const rateLimitAdminLogin: RateLimitRequestHandler = rateLimit({
  ...failedAttemptsOnly,
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15,
  message: {
    error: 'Too many admin login attempts from this IP. Please try again in 15 minutes.',
  },
});

export const rateLimitWatchmanLogin: RateLimitRequestHandler = rateLimit({
  ...failedAttemptsOnly,
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    error: 'Too many watchman login attempts from this IP. Please try again in 15 minutes.',
  },
});

export const rateLimitSearch: RateLimitRequestHandler = rateLimit({
  ...defaultRateLimitOptions,
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 120,
  message: { error: 'Search rate limit exceeded. Please wait a moment before searching again.' },
});

export const rateLimitOutsiderEntry: RateLimitRequestHandler = rateLimit({
  ...defaultRateLimitOptions,
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 60,
  message: { error: 'Too many vehicle registration requests. Please slow down.' },
});

/**
 * GET /api/auth/me is unauthenticated and re-reads the user document from Mongo
 * on every call (see parseSession). Unthrottled, it is a free database
 * amplification vector, and it is the endpoint a page load hits first.
 */
export const rateLimitSessionProbe: RateLimitRequestHandler = rateLimit({
  ...defaultRateLimitOptions,
  windowMs: 10 * 60 * 1000,
  max: 180,
  message: { error: 'Too many session checks from this network. Please reload in a moment.' },
});

export const rateLimitLogout: RateLimitRequestHandler = rateLimit({
  ...defaultRateLimitOptions,
  windowMs: 10 * 60 * 1000,
  max: 30,
  message: { error: 'Too many sign-out attempts from this IP. Please wait a moment.' },
});

/**
 * Backstop for the whole authenticated management surface. Generous enough that
 * a busy admin never notices, low enough to blunt credential-stuffing and
 * enumeration across /api/admin/*.
 */
export const rateLimitAdminApi: RateLimitRequestHandler = rateLimit({
  ...defaultRateLimitOptions,
  windowMs: 15 * 60 * 1000,
  max: 600,
  message: { error: 'Too many admin requests. Please slow down and try again shortly.' },
});

/**
 * Destructive, non-idempotent, and unaudited today: reset-seed purges the whole
 * society registry. Deliberately tight.
 */
export const rateLimitDestructive: RateLimitRequestHandler = rateLimit({
  ...defaultRateLimitOptions,
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: { error: 'Too many destructive operations in the last hour. Contact the developer.' },
});

/** Wide backstop across the entire API surface. */
export const rateLimitApiGlobal: RateLimitRequestHandler = rateLimit({
  ...defaultRateLimitOptions,
  windowMs: 15 * 60 * 1000,
  max: 1500,
  message: { error: 'Too many requests from this IP. Please slow down.' },
});
