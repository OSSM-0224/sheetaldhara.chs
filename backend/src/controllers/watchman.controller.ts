import { Response } from 'express';
import mongoose from 'mongoose';
import { OutsiderVehicle } from '../models/index.ts';
import { AuthenticatedRequest } from '../middleware/auth.ts';
import { normalizePlate } from '../utils/plateNormalizer.ts';

export async function addOutsiderVehicle(req: AuthenticatedRequest, res: Response) {
  try {
    const { plate, vehicle_type, owner_phone, owner_name, note } = req.body || {};

    if (!plate || !vehicle_type || !owner_phone) {
      return res.status(400).json({
        error: 'Vehicle plate, vehicle type, and owner contact number are required.',
      });
    }

    const upperType = String(vehicle_type).toUpperCase();
    if (!['BIKE', 'CAR', 'OTHER'].includes(upperType)) {
      return res.status(400).json({ error: 'Invalid vehicle type. Must be BIKE, CAR, or OTHER.' });
    }

    const cleanPhone = String(owner_phone).replace(/[^0-9]/g, '');
    if (cleanPhone.length !== 10) {
      return res.status(400).json({ error: 'Owner phone number must be 10 digits.' });
    }

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: 'Database not connected. Please configure MONGODB_URI in Settings.' });
    }

    const normalized = normalizePlate(String(plate));
    const watchmanId = req.watchman?.id || req.watchman?._id;

    const newVehicle = await OutsiderVehicle.create({
      plate: normalized,
      plate_raw: String(plate).trim(),
      vehicle_type: upperType.toLowerCase() as any,
      owner_phone: cleanPhone,
      owner_name: owner_name ? String(owner_name).trim() : undefined,
      note: note ? String(note).trim() : undefined,
      added_by_watchman_id: watchmanId,
      status: 'inside',
      exited_at: null,
    });

    const vObj: any = newVehicle.toJSON();
    vObj.added_by_watchman_name = req.watchman?.full_name || 'Gate Watchman';

    return res.status(201).json({
      vehicle: vObj,
      message: 'Outsider vehicle entry logged successfully.',
    });
  } catch (err: any) {
    console.error('Watchman add vehicle error:', err);
    return res.status(500).json({ error: 'Failed to register outsider vehicle.' });
  }
}

export async function getMyEntries(req: AuthenticatedRequest, res: Response) {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: 'Database not connected.' });
    }

    const watchmanId = req.watchman?.id || req.watchman?._id;
    const docs = await OutsiderVehicle.find({ added_by_watchman_id: watchmanId })
      .sort({ createdAt: -1 })
      .populate('added_by_watchman_id', 'full_name');

    const vehicles = docs.map((doc) => {
      const v: any = doc.toJSON();
      const wDoc = doc.added_by_watchman_id as any;
      v.added_by_watchman_name = wDoc?.full_name || req.watchman?.full_name || 'Gate Watchman';
      return v;
    });

    return res.json({ vehicles });
  } catch (err: any) {
    console.error('Watchman get entries error:', err);
    return res.status(500).json({ error: 'Failed to retrieve entry logs.' });
  }
}

export async function markExit(req: AuthenticatedRequest, res: Response) {
  try {
    const id = req.params.id;

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: 'Database not connected.' });
    }

    const watchmanId = req.watchman?.id || req.watchman?._id;

    // Scope to the entries this watchman created. getMyEntries already scopes by
    // added_by_watchman_id, so without this filter a guard could close out a
    // peer's gate records and falsify the entry/exit audit trail.
    const vehicle = await OutsiderVehicle.findOne({
      _id: id,
      added_by_watchman_id: watchmanId,
    });

    if (!vehicle) {
      return res.status(404).json({
        error: 'No matching entry found in your log. You can only update entries you logged.',
      });
    }

    if (vehicle.status === 'exited') {
      return res.status(400).json({ error: 'Vehicle is already marked as exited.' });
    }

    vehicle.status = 'exited';
    vehicle.exited_at = new Date();
    await vehicle.save();

    const vObj: any = vehicle.toJSON();
    vObj.added_by_watchman_name = req.watchman?.full_name || 'Gate Watchman';

    return res.json({
      vehicle: vObj,
      message: 'Vehicle marked as exited society premises.',
    });
  } catch (err: any) {
    console.error('Watchman mark exit error:', err);
    return res.status(500).json({ error: 'Failed to update vehicle exit status.' });
  }
}
