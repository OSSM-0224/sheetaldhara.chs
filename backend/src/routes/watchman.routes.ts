import { Router } from 'express';
import {
  addOutsiderVehicle,
  getMyEntries,
  markExit,
} from '../controllers/watchman.controller.ts';
import { requireAuth, requireWatchman } from '../middleware/auth.ts';
import { rateLimitOutsiderEntry } from '../middleware/rateLimiters.ts';

export const watchmanRouter = Router();

watchmanRouter.use(requireAuth);
watchmanRouter.use(requireWatchman);

watchmanRouter.post('/outsider-vehicles', rateLimitOutsiderEntry, addOutsiderVehicle);
watchmanRouter.get('/my-entries', getMyEntries);
watchmanRouter.patch('/outsider-vehicles/:id/exit', markExit);
