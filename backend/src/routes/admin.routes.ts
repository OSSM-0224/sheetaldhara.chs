import { Router } from 'express';
import {
  getResidents,
  createResident,
  updateResident,
  deleteResident,
  getVehicles,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  getWatchmen,
  createWatchman,
  updateWatchman,
  deleteWatchman,
  getOutsiderVehicles,
  markOutsiderVehicleExit,
  getSearchLogs,
  resetSeed,
} from '../controllers/admin.controller.ts';
import { requireAuth, requireAdmin } from '../middleware/auth.ts';
import { rateLimitAdminApi, rateLimitDestructive } from '../middleware/rateLimiters.ts';

export const adminRouter = Router();

adminRouter.use(requireAuth);
adminRouter.use(requireAdmin);
adminRouter.use(rateLimitAdminApi);

// Residents CRUD
adminRouter.get('/residents', getResidents);
adminRouter.post('/residents', createResident);
adminRouter.patch('/residents/:id', updateResident);
adminRouter.delete('/residents/:id', deleteResident);

// Vehicles CRUD
adminRouter.get('/vehicles', getVehicles);
adminRouter.post('/vehicles', createVehicle);
adminRouter.patch('/vehicles/:id', updateVehicle);
adminRouter.delete('/vehicles/:id', deleteVehicle);

// Watchmen CRUD
adminRouter.get('/watchmen', getWatchmen);
adminRouter.post('/watchmen', createWatchman);
adminRouter.patch('/watchmen/:id', updateWatchman);
adminRouter.delete('/watchmen/:id', deleteWatchman);

// Outsider Vehicles Oversight
adminRouter.get('/outsider-vehicles', getOutsiderVehicles);
adminRouter.patch('/outsider-vehicles/:id/exit', markOutsiderVehicleExit);

// Search Logs & Reset Seed
adminRouter.get('/search-logs', getSearchLogs);
adminRouter.post('/reset-seed', rateLimitDestructive, resetSeed);
