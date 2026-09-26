import { Router } from 'express';
import { searchVehicles } from '../controllers/search.controller.ts';
import { requireAuth } from '../middleware/auth.ts';
import { rateLimitSearch } from '../middleware/rateLimiters.ts';

export const searchRouter = Router();

// GET /api/search?q=...
searchRouter.get('/', requireAuth, rateLimitSearch, searchVehicles);
