import { Router } from 'express';
import {
  residentSignin,
  adminLogin,
  watchmanLogin,
  getMe,
  logout,
} from '../controllers/auth.controller.ts';
import {
  rateLimitResidentSignin,
  rateLimitAdminLogin,
  rateLimitWatchmanLogin,
  rateLimitSessionProbe,
  rateLimitLogout,
} from '../middleware/rateLimiters.ts';

export const authRouter = Router();

authRouter.post('/resident-signin', rateLimitResidentSignin, residentSignin);
authRouter.post('/admin-login', rateLimitAdminLogin, adminLogin);
authRouter.post('/watchman-login', rateLimitWatchmanLogin, watchmanLogin);
authRouter.post('/logout', rateLimitLogout, logout);
authRouter.get('/me', rateLimitSessionProbe, getMe);
