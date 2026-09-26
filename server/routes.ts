import { Router, type Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from './db.ts';
import {
  AuthenticatedRequest,
  generateToken,
  authenticateUser,
  requireAuth,
  requireAdmin,
  requireWatchman,
  rateLimitResidentSignin,
  rateLimitWatchmanLogin,
  rateLimitOutsiderEntry,
  rateLimitSearch,
} from './auth.ts';

export const apiRouter = Router();

// Ensure session/token is parsed on every incoming request
apiRouter.use(authenticateUser);

// ==========================================
// 1. AUTH ROUTES
// ==========================================

// POST /api/auth/resident-signin (Room Number + Phone Number, no password)
apiRouter.post(
  '/auth/resident-signin',
  rateLimitResidentSignin,
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const { room_number, phone } = req.body || {};

      if (!room_number || !phone) {
        return res.status(400).json({
          error: 'Please enter both your Room / Flat Number and registered Phone Number.',
        });
      }

      const resident = db.findResidentByRoomAndPhone(String(room_number), String(phone));

      if (!resident) {
        return res.status(401).json({
          error: "We couldn't find this room/phone combination. Please contact your society admin.",
        });
      }

      const token = generateToken({
        role: 'RESIDENT',
        residentId: resident.id,
      });

      // 30 days HTTP-only secure cookie
      res.cookie('society_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60 * 1000,
        path: '/',
      });

      return res.json({
        role: 'RESIDENT',
        resident,
        token,
        message: `Welcome back, ${resident.full_name}!`,
      });
    } catch (err: any) {
      console.error('Resident signin error:', err);
      return res.status(500).json({ error: 'Internal server error during sign-in.' });
    }
  }
);

// POST /api/auth/admin-login (Phone + Password for single admin account)
apiRouter.post('/auth/admin-login', (req: AuthenticatedRequest, res: Response) => {
  try {
    const { phone, password } = req.body || {};

    if (!phone || !password) {
      return res.status(400).json({ error: 'Admin phone and password are required.' });
    }

    const admin = db.findAdminByPhone(String(phone));
    if (!admin) {
      return res.status(401).json({ error: 'Invalid administrator phone or password.' });
    }

    const match = bcrypt.compareSync(String(password), admin.password_hash);
    if (!match) {
      return res.status(401).json({ error: 'Invalid administrator phone or password.' });
    }

    const token = generateToken({
      role: 'ADMIN',
      userId: admin.id,
    });

    // 30 days HTTP-only cookie
    res.cookie('society_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
      path: '/',
    });

    return res.json({
      role: 'ADMIN',
      user: {
        id: admin.id,
        phone: admin.phone,
        role: 'ADMIN',
        full_name: admin.full_name || 'Ramesh Sharma',
      },
      token,
      message: 'Logged in as Society Administrator.',
    });
  } catch (err: any) {
    console.error('Admin login error:', err);
    return res.status(500).json({ error: 'Internal server error during admin login.' });
  }
});

// POST /api/auth/watchman-login (Phone + Password for Gate Watchman)
apiRouter.post(
  '/auth/watchman-login',
  rateLimitWatchmanLogin,
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const { phone, password } = req.body || {};

      if (!phone || !password) {
        return res.status(400).json({ error: 'Watchman phone number and password are required.' });
      }

      const watchman = db.findWatchmanByPhone(String(phone));
      if (!watchman) {
        return res.status(401).json({ error: 'Invalid watchman phone or password.' });
      }

      if (watchman.status === 'inactive') {
        return res.status(403).json({ error: 'This watchman account has been deactivated by the admin.' });
      }

      const match = bcrypt.compareSync(String(password), watchman.password_hash);
      if (!match) {
        return res.status(401).json({ error: 'Invalid watchman phone or password.' });
      }

      const token = generateToken({
        role: 'WATCHMAN',
        userId: watchman.id,
      });

      // 30 days HTTP-only cookie
      res.cookie('society_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60 * 1000,
        path: '/',
      });

      return res.json({
        role: 'WATCHMAN',
        watchman: {
          id: watchman.id,
          phone: watchman.phone,
          full_name: watchman.full_name || 'Gate Watchman',
          role: 'WATCHMAN',
        },
        token,
        message: `Welcome, ${watchman.full_name || 'Gate Watchman'}!`,
      });
    } catch (err: any) {
      console.error('Watchman login error:', err);
      return res.status(500).json({ error: 'Internal server error during watchman login.' });
    }
  }
);

// POST /api/auth/logout
apiRouter.post('/auth/logout', (req: AuthenticatedRequest, res: Response) => {
  res.clearCookie('society_token', { path: '/' });
  return res.json({ success: true, message: 'Logged out successfully.' });
});

// GET /api/auth/me
apiRouter.get('/auth/me', (req: AuthenticatedRequest, res: Response) => {
  if (req.role === 'ADMIN' && req.user) {
    return res.json({
      role: 'ADMIN',
      user: {
        id: req.user.id,
        phone: req.user.phone,
        role: 'ADMIN',
        full_name: req.user.full_name || 'Ramesh Sharma',
      },
    });
  }

  if (req.role === 'WATCHMAN' && req.watchman) {
    return res.json({
      role: 'WATCHMAN',
      watchman: {
        id: req.watchman.id,
        phone: req.watchman.phone,
        full_name: req.watchman.full_name,
        role: 'WATCHMAN',
      },
    });
  }

  if (req.role === 'RESIDENT' && req.resident) {
    return res.json({
      role: 'RESIDENT',
      resident: req.resident,
    });
  }

  return res.status(401).json({ error: 'Not authenticated.' });
});

// ==========================================
// 2. RESIDENT READ-ONLY VEHICLES
// ==========================================

// GET /api/my-vehicles (Strictly accessible to logged-in RESIDENT only)
apiRouter.get('/my-vehicles', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  if (req.role !== 'RESIDENT' || !req.resident) {
    return res.status(403).json({ error: 'Resident access required.' });
  }

  const vehicles = db.getVehiclesByResidentId(req.resident.id);
  return res.json({ vehicles, resident: req.resident });
});

// ==========================================
// 3. VEHICLE SEARCH (RESIDENTS, ADMIN & WATCHMAN)
// ==========================================

// GET /api/search?q=4821
apiRouter.get(
  '/search',
  requireAuth,
  rateLimitSearch,
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const query = String(req.query.q || '').trim();

      if (!query) {
        return res.json({
          matches: [],
          searchType: 'LAST_FOUR',
          normalizedQuery: '',
        });
      }

      const searcherId = req.resident
        ? req.resident.id
        : req.watchman
        ? req.watchman.id
        : 'ADMIN';

      const result = db.searchVehicles(query, searcherId);
      return res.json(result);
    } catch (err: any) {
      console.error('Search error:', err);
      return res.status(500).json({ error: 'Search failed.' });
    }
  }
);

// ==========================================
// 3B. WATCHMAN OUTSIDER VEHICLE LOGGING
// ==========================================

// POST /api/watchman/outsider-vehicles (Watchman registers visitor vehicle)
apiRouter.post(
  '/watchman/outsider-vehicles',
  requireAuth,
  requireWatchman,
  rateLimitOutsiderEntry,
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const { plate, vehicle_type, owner_phone, owner_name, note } = req.body || {};

      if (!plate || !vehicle_type || !owner_phone) {
        return res.status(400).json({
          error: 'Vehicle plate, vehicle type, and owner contact number are required.',
        });
      }

      const result = db.addOutsiderVehicle({
        plateInput: plate,
        vehicleType: vehicle_type,
        ownerPhone: owner_phone,
        ownerName: owner_name,
        note,
        watchmanId: req.watchman!.id,
      });

      if (result.error) {
        return res.status(400).json({ error: result.error });
      }

      return res.status(201).json({
        vehicle: result.vehicle,
        message: 'Outsider vehicle registered successfully.',
      });
    } catch (err: any) {
      console.error('Outsider vehicle entry error:', err);
      return res.status(500).json({ error: 'Failed to register outsider vehicle.' });
    }
  }
);

// GET /api/watchman/my-entries (Watchman views entries logged by them)
apiRouter.get(
  '/watchman/my-entries',
  requireAuth,
  requireWatchman,
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const vehicles = db.getOutsiderVehiclesByWatchman(req.watchman!.id);
      return res.json({ vehicles });
    } catch (err: any) {
      console.error('Get watchman entries error:', err);
      return res.status(500).json({ error: 'Failed to retrieve entries.' });
    }
  }
);

// PATCH /api/watchman/outsider-vehicles/:id/exit (Mark outsider vehicle as exited)
apiRouter.patch(
  '/watchman/outsider-vehicles/:id/exit',
  requireAuth,
  requireWatchman,
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const result = db.markOutsiderVehicleExited(req.params.id, req.watchman!.id, false);
      if (result.error) {
        return res.status(400).json({ error: result.error });
      }

      return res.json({
        vehicle: result.vehicle,
        message: 'Vehicle marked as exited society premises.',
      });
    } catch (err: any) {
      console.error('Mark exited error:', err);
      return res.status(500).json({ error: 'Failed to update vehicle exit status.' });
    }
  }
);

// ==========================================
// 4. ADMIN ENDPOINTS: WATCHMEN MANAGEMENT
// ==========================================

// GET /api/admin/watchmen
apiRouter.get(
  '/admin/watchmen',
  requireAuth,
  requireAdmin,
  (req: AuthenticatedRequest, res: Response) => {
    const watchmen = db.getWatchmen().map(({ password_hash, ...safe }) => safe);
    return res.json({ watchmen });
  }
);

// POST /api/admin/watchmen
apiRouter.post(
  '/admin/watchmen',
  requireAuth,
  requireAdmin,
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const { full_name, phone, password } = req.body || {};
      const result = db.createWatchman({
        fullName: full_name || '',
        phone: phone || '',
        password: password || '',
      });

      if (result.error) {
        return res.status(400).json({ error: result.error });
      }

      const { password_hash, ...safe } = result.watchman!;
      return res.status(201).json({
        watchman: safe,
        message: 'Watchman account created successfully.',
      });
    } catch (err: any) {
      console.error('Admin create watchman error:', err);
      return res.status(500).json({ error: 'Failed to create watchman account.' });
    }
  }
);

// PATCH /api/admin/watchmen/:id
apiRouter.patch(
  '/admin/watchmen/:id',
  requireAuth,
  requireAdmin,
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const { full_name, phone, password, status } = req.body || {};
      const result = db.updateWatchman(req.params.id, {
        fullName: full_name,
        phone,
        password,
        status,
      });

      if (result.error) {
        return res.status(400).json({ error: result.error });
      }

      const { password_hash, ...safe } = result.watchman!;
      return res.json({
        watchman: safe,
        message: 'Watchman account updated successfully.',
      });
    } catch (err: any) {
      console.error('Admin update watchman error:', err);
      return res.status(500).json({ error: 'Failed to update watchman account.' });
    }
  }
);

// DELETE /api/admin/watchmen/:id
apiRouter.delete(
  '/admin/watchmen/:id',
  requireAuth,
  requireAdmin,
  (req: AuthenticatedRequest, res: Response) => {
    const deleted = db.deleteWatchman(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Watchman not found.' });
    }
    return res.json({ success: true, message: 'Watchman account deleted.' });
  }
);

// ==========================================
// 4B. ADMIN ENDPOINTS: OUTSIDER VEHICLES OVERSIGHT
// ==========================================

// GET /api/admin/outsider-vehicles
apiRouter.get(
  '/admin/outsider-vehicles',
  requireAuth,
  requireAdmin,
  (req: AuthenticatedRequest, res: Response) => {
    const vehicles = db.getAllOutsiderVehicles();
    return res.json({ vehicles });
  }
);

// PATCH /api/admin/outsider-vehicles/:id/exit
apiRouter.patch(
  '/admin/outsider-vehicles/:id/exit',
  requireAuth,
  requireAdmin,
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const result = db.markOutsiderVehicleExited(req.params.id, req.user!.id, true);
      if (result.error) {
        return res.status(400).json({ error: result.error });
      }

      return res.json({
        vehicle: result.vehicle,
        message: 'Outsider vehicle marked as exited.',
      });
    } catch (err: any) {
      console.error('Admin mark exited error:', err);
      return res.status(500).json({ error: 'Failed to mark vehicle as exited.' });
    }
  }
);

// ==========================================
// 5. ADMIN ENDPOINTS: RESIDENTS CRUD
// ==========================================

// GET /api/admin/residents
apiRouter.get(
  '/admin/residents',
  requireAuth,
  requireAdmin,
  (req: AuthenticatedRequest, res: Response) => {
    const residents = db.getAllResidents().map((r) => ({
      ...r,
      vehicles: db.getVehiclesByResidentId(r.id),
    }));
    return res.json({ residents });
  }
);

// POST /api/admin/residents (Add resident)
apiRouter.post(
  '/admin/residents',
  requireAuth,
  requireAdmin,
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const { full_name, room_number, phone } = req.body || {};
      const result = db.createResident({
        fullName: full_name || '',
        roomNumber: room_number || '',
        phone: phone || '',
      });

      if (result.error) {
        return res.status(400).json({ error: result.error });
      }

      return res.status(201).json({
        resident: result.resident,
        message: `Resident ${result.resident!.full_name} added successfully.`,
      });
    } catch (err: any) {
      console.error('Create resident error:', err);
      return res.status(500).json({ error: 'Failed to create resident.' });
    }
  }
);

// PATCH /api/admin/residents/:id (Edit resident)
apiRouter.patch(
  '/admin/residents/:id',
  requireAuth,
  requireAdmin,
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const { full_name, room_number, phone } = req.body || {};
      const result = db.updateResident(req.params.id, {
        fullName: full_name,
        roomNumber: room_number,
        phone,
      });

      if (result.error) {
        return res.status(400).json({ error: result.error });
      }

      return res.json({
        resident: result.resident,
        message: `Resident ${result.resident!.full_name} updated successfully.`,
      });
    } catch (err: any) {
      console.error('Update resident error:', err);
      return res.status(500).json({ error: 'Failed to update resident.' });
    }
  }
);

// DELETE /api/admin/residents/:id (Delete resident + associated vehicles)
apiRouter.delete(
  '/admin/residents/:id',
  requireAuth,
  requireAdmin,
  (req: AuthenticatedRequest, res: Response) => {
    const deleted = db.deleteResident(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Resident not found.' });
    }
    return res.json({
      success: true,
      message: 'Resident and all associated vehicles deleted successfully.',
    });
  }
);

// ==========================================
// 5. ADMIN ENDPOINTS: VEHICLES CRUD
// ==========================================

// GET /api/admin/vehicles
apiRouter.get(
  '/admin/vehicles',
  requireAuth,
  requireAdmin,
  (req: AuthenticatedRequest, res: Response) => {
    const vehicles = db.getAllVehiclesWithOwners();
    return res.json({ vehicles });
  }
);

// POST /api/admin/vehicles (Admin directly registers vehicle)
apiRouter.post(
  '/admin/vehicles',
  requireAuth,
  requireAdmin,
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const { resident_id, vehicle_type, brand, model, plate, parking_number } =
        req.body || {};

      if (!resident_id) {
        return res.status(400).json({ error: 'Please select an assigned resident.' });
      }

      if (!vehicle_type || !plate) {
        return res.status(400).json({ error: 'Vehicle type and number plate are required.' });
      }

      if (!['BIKE', 'CAR', 'OTHER'].includes(vehicle_type)) {
        return res.status(400).json({ error: 'Vehicle type must be BIKE, CAR, or OTHER.' });
      }

      const result = db.createVehicle({
        residentId: resident_id,
        vehicleType: vehicle_type,
        brand: brand || '',
        model: model || '',
        plateInput: plate,
        parkingNumber: vehicle_type === 'BIKE' ? undefined : parking_number,
      });

      if (result.error) {
        return res.status(400).json({ error: result.error });
      }

      return res.status(201).json({
        vehicle: result.vehicle,
        message: 'Vehicle added to society registry.',
      });
    } catch (err: any) {
      console.error('Admin add vehicle error:', err);
      return res.status(500).json({ error: 'Failed to register vehicle.' });
    }
  }
);

// PATCH /api/admin/vehicles/:id (Admin directly edits vehicle)
apiRouter.patch(
  '/admin/vehicles/:id',
  requireAuth,
  requireAdmin,
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const vehicleId = req.params.id;
      const { resident_id, vehicle_type, brand, model, plate, parking_number } =
        req.body || {};

      const result = db.adminUpdateVehicle(vehicleId, {
        residentId: resident_id,
        vehicleType: vehicle_type,
        brand,
        model,
        plateInput: plate,
        parkingNumber: vehicle_type === 'BIKE' ? '' : parking_number,
      });

      if (result.error) {
        return res.status(400).json({ error: result.error });
      }

      return res.json({
        vehicle: result.vehicle,
        message: 'Vehicle details updated successfully.',
      });
    } catch (err: any) {
      console.error('Admin update vehicle error:', err);
      return res.status(500).json({ error: 'Failed to update vehicle.' });
    }
  }
);

// DELETE /api/admin/vehicles/:id (Admin deletes vehicle)
apiRouter.delete(
  '/admin/vehicles/:id',
  requireAuth,
  requireAdmin,
  (req: AuthenticatedRequest, res: Response) => {
    const deleted = db.deleteVehicle(req.params.id, '', true);
    if (!deleted) {
      return res.status(404).json({ error: 'Vehicle not found.' });
    }
    return res.json({ success: true, message: 'Vehicle deleted from society registry.' });
  }
);

// ==========================================
// 6. ADMIN ENDPOINTS: SEARCH LOGS & SEED RESET
// ==========================================

// GET /api/admin/search-logs
apiRouter.get(
  '/admin/search-logs',
  requireAuth,
  requireAdmin,
  (req: AuthenticatedRequest, res: Response) => {
    const logs = db.getSearchLogs();
    return res.json({ logs });
  }
);

// POST /api/admin/reset-seed
apiRouter.post('/admin/reset-seed', (req: AuthenticatedRequest, res: Response) => {
  db.seedInitialData();
  return res.json({ success: true, message: 'Society database reset to initial seed data.' });
});
