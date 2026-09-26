import { Router, Response } from 'express';
import { requireAuth, requireResident, AuthenticatedRequest } from '../middleware/auth.ts';
import { Vehicle } from '../models/index.ts';

export const residentsRouter = Router();

// GET /api/my-vehicles (Resident only)
residentsRouter.get(
  '/my-vehicles',
  requireAuth,
  requireResident,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const resident = req.resident!;
      const residentId = resident.id || resident._id;
      const vehicles = await Vehicle.find({ resident_id: residentId });

      return res.json({
        vehicles: vehicles.map((v) => v.toJSON()),
        resident,
      });
    } catch (err: any) {
      console.error('Fetch my-vehicles error:', err);
      return res.status(500).json({ error: 'Failed to retrieve resident vehicles.' });
    }
  }
);
