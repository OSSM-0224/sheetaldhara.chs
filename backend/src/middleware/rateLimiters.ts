import rateLimit from 'express-rate-limit';

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

export const rateLimitResidentSignin = rateLimit({
  ...defaultRateLimitOptions,
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: {
    error: 'Too many resident sign-in attempts from this IP. Please try again in 15 minutes.',
  },
});

export const rateLimitAdminLogin = rateLimit({
  ...defaultRateLimitOptions,
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15,
  message: {
    error: 'Too many admin login attempts from this IP. Please try again in 15 minutes.',
  },
});

export const rateLimitWatchmanLogin = rateLimit({
  ...defaultRateLimitOptions,
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    error: 'Too many watchman login attempts from this IP. Please try again in 15 minutes.',
  },
});

export const rateLimitSearch = rateLimit({
  ...defaultRateLimitOptions,
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 120,
  message: {
    error: 'Search rate limit exceeded. Please wait a moment before searching again.',
  },
});

export const rateLimitOutsiderEntry = rateLimit({
  ...defaultRateLimitOptions,
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 60,
  message: {
    error: 'Too many vehicle registration requests. Please slow down.',
  },
});
