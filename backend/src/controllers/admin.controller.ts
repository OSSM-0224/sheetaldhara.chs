import { Response } from 'express';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import {
  Resident,
  Vehicle,
  OutsiderVehicle,
  Watchman,
  Admin,
  SearchLog,
} from '../models/index.ts';
import { seedDatabase } from '../db/seed.ts';
import { AuthenticatedRequest } from '../middleware/auth.ts';
import { normalizePlate, extractLastFourDigits } from '../utils/plateNormalizer.ts';
import { isValidPhoneNumber, isValidRoomNumber } from '../utils/validators.ts';

// ============================================================================
// Residents CRUD
// ============================================================================

export async function getResidents(req: AuthenticatedRequest, res: Response) {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: 'Database not connected.' });
    }

    const residentsDocs = await Resident.find().sort({ room_number: 1 });
    const residentIds = residentsDocs.map((r) => r._id);

    // Fetch all vehicles for these residents in one indexed query
    const allVehicles = await Vehicle.find({ resident_id: { $in: residentIds } });

    const vehiclesByResident = new Map<string, any[]>();
    for (const v of allVehicles) {
      const rid = v.resident_id.toString();
      if (!vehiclesByResident.has(rid)) {
        vehiclesByResident.set(rid, []);
      }
      vehiclesByResident.get(rid)!.push(v.toJSON());
    }

    const residents = residentsDocs.map((r) => {
      const rObj: any = r.toJSON();
      rObj.vehicles = vehiclesByResident.get(r._id.toString()) || [];
      return rObj;
    });

    return res.json({ residents });
  } catch (err: any) {
    console.error('Admin getResidents error:', err);
    return res.status(500).json({ error: 'Failed to retrieve residents list.' });
  }
}

export async function createResident(req: AuthenticatedRequest, res: Response) {
  try {
    const { full_name, room_number, phone } = req.body || {};

    if (!full_name || !room_number || !phone) {
      return res.status(400).json({ error: 'Full name, flat/room number, and phone are required.' });
    }

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: 'Database not connected.' });
    }

    const cleanRoom = String(room_number).trim().toUpperCase();
    const cleanPhone = String(phone).replace(/[^0-9]/g, '');

    // A resident signs in passwordlessly on (room_number, phone), so a malformed
    // phone is not cosmetic — it locks that resident out of their own account.
    if (!isValidRoomNumber(cleanRoom)) {
      return res.status(400).json({ error: 'Flat / room number must be 2 to 10 characters.' });
    }

    if (!isValidPhoneNumber(cleanPhone)) {
      return res.status(400).json({ error: 'Phone must be a valid 10-digit number.' });
    }

    const existing = await Resident.findOne({
      $or: [{ room_number: cleanRoom }, { phone: cleanPhone }],
    });

    if (existing) {
      if (existing.room_number === cleanRoom) {
        return res.status(400).json({ error: `Room ${cleanRoom} is already registered.` });
      }
      return res.status(400).json({ error: `Phone ${cleanPhone} is already registered to another resident.` });
    }

    const newResident = await Resident.create({
      full_name: String(full_name).trim(),
      room_number: cleanRoom,
      phone: cleanPhone,
    });

    const rObj: any = newResident.toJSON();
    rObj.vehicles = [];

    return res.status(201).json({
      resident: rObj,
      message: `Resident ${newResident.full_name} added successfully.`,
    });
  } catch (err: any) {
    console.error('Admin create resident error:', err);
    return res.status(500).json({ error: 'Failed to create resident.' });
  }
}

export async function updateResident(req: AuthenticatedRequest, res: Response) {
  try {
    const { full_name, room_number, phone } = req.body || {};
    const residentId = req.params.id;

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: 'Database not connected.' });
    }

    const resident = await Resident.findById(residentId);
    if (!resident) {
      return res.status(404).json({ error: 'Resident not found.' });
    }

    if (room_number) {
      const cleanRoom = String(room_number).trim().toUpperCase();
      if (!isValidRoomNumber(cleanRoom)) {
        return res.status(400).json({ error: 'Flat / room number must be 2 to 10 characters.' });
      }
      if (cleanRoom !== resident.room_number) {
        const conflict = await Resident.findOne({ room_number: cleanRoom, _id: { $ne: residentId } });
        if (conflict) {
          return res.status(400).json({ error: `Room ${cleanRoom} is already in use by another resident.` });
        }
        resident.room_number = cleanRoom;
      }
    }

    if (phone) {
      const cleanPhone = String(phone).replace(/[^0-9]/g, '');
      if (!isValidPhoneNumber(cleanPhone)) {
        return res.status(400).json({ error: 'Phone must be a valid 10-digit number.' });
      }
      if (cleanPhone !== resident.phone) {
        const conflict = await Resident.findOne({ phone: cleanPhone, _id: { $ne: residentId } });
        if (conflict) {
          return res.status(400).json({ error: `Phone ${cleanPhone} is already registered to another resident.` });
        }
        resident.phone = cleanPhone;
      }
    }

    if (full_name) {
      resident.full_name = String(full_name).trim();
    }

    await resident.save();

    const vehicles = await Vehicle.find({ resident_id: residentId });
    const rObj: any = resident.toJSON();
    rObj.vehicles = vehicles.map((v) => v.toJSON());

    return res.json({
      resident: rObj,
      message: `Resident ${resident.full_name} updated successfully.`,
    });
  } catch (err: any) {
    console.error('Admin update resident error:', err);
    return res.status(500).json({ error: 'Failed to update resident.' });
  }
}

export async function deleteResident(req: AuthenticatedRequest, res: Response) {
  try {
    const residentId = req.params.id;

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: 'Database not connected.' });
    }

    const deleted = await Resident.findByIdAndDelete(residentId);
    if (!deleted) {
      return res.status(404).json({ error: 'Resident not found.' });
    }

    // Cascade delete linked vehicles
    await Vehicle.deleteMany({ resident_id: residentId });

    return res.json({
      success: true,
      message: 'Resident and all linked vehicles removed successfully.',
    });
  } catch (err: any) {
    console.error('Admin delete resident error:', err);
    return res.status(500).json({ error: 'Failed to delete resident.' });
  }
}

// ============================================================================
// Vehicles CRUD
// ============================================================================

export async function getVehicles(req: AuthenticatedRequest, res: Response) {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: 'Database not connected.' });
    }

    const docs = await Vehicle.find().sort({ createdAt: -1 }).populate('resident_id');

    const vehicles = docs.map((v) => {
      const vObj: any = v.toJSON();
      const owner = v.resident_id as any;
      vObj.owner_name = owner?.full_name || 'Society Resident';
      vObj.owner_room = owner?.room_number || 'N/A';
      vObj.owner_phone = owner?.phone || '';
      return vObj;
    });

    return res.json({ vehicles });
  } catch (err: any) {
    console.error('Admin getVehicles error:', err);
    return res.status(500).json({ error: 'Failed to retrieve vehicles.' });
  }
}

export async function createVehicle(req: AuthenticatedRequest, res: Response) {
  try {
    const { resident_id, vehicle_type, brand, model, color, plate, parking_number } =
      req.body || {};

    if (!resident_id) {
      return res.status(400).json({ error: 'Please select an assigned resident.' });
    }

    if (!vehicle_type || !plate) {
      return res.status(400).json({ error: 'Vehicle type and number plate are required.' });
    }

    const upperType = String(vehicle_type).toUpperCase();
    if (!['BIKE', 'CAR', 'OTHER'].includes(upperType)) {
      return res.status(400).json({ error: 'Vehicle type must be BIKE, CAR, or OTHER.' });
    }

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: 'Database not connected.' });
    }

    const resident = await Resident.findById(resident_id);
    if (!resident) {
      return res.status(404).json({ error: 'Selected resident does not exist.' });
    }

    const normalized = normalizePlate(String(plate));
    const existing = await Vehicle.findOne({ plate: normalized });
    if (existing) {
      return res.status(400).json({ error: `Vehicle with plate ${normalized} is already registered.` });
    }

    const newVehicle = await Vehicle.create({
      resident_id: resident._id,
      vehicle_type: upperType.toLowerCase() as any,
      brand: brand ? String(brand).trim() : '',
      model: model ? String(model).trim() : '',
      color: color ? String(color).trim() : '',
      plate: normalized,
      plate_raw: String(plate).trim(),
      parking_number: upperType === 'BIKE' ? undefined : (parking_number ? String(parking_number).trim() : undefined),
    });

    const vObj: any = newVehicle.toJSON();
    vObj.owner_name = resident.full_name;
    vObj.owner_room = resident.room_number;
    vObj.owner_phone = resident.phone;

    return res.status(201).json({
      vehicle: vObj,
      message: 'Vehicle added to society registry.',
    });
  } catch (err: any) {
    console.error('Admin add vehicle error:', err);
    return res.status(500).json({ error: 'Failed to register vehicle.' });
  }
}

export async function updateVehicle(req: AuthenticatedRequest, res: Response) {
  try {
    const vehicleId = req.params.id;
    const { resident_id, vehicle_type, brand, model, color, plate, parking_number } =
      req.body || {};

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: 'Database not connected.' });
    }

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found.' });
    }

    if (resident_id) {
      const resident = await Resident.findById(resident_id);
      if (!resident) {
        return res.status(404).json({ error: 'Resident not found.' });
      }
      vehicle.resident_id = resident._id as any;
    }

    if (vehicle_type) {
      const upperType = String(vehicle_type).toUpperCase();
      vehicle.vehicle_type = upperType.toLowerCase() as any;
      if (upperType === 'BIKE') {
        vehicle.parking_number = undefined;
      }
    }

    if (plate) {
      const normalized = normalizePlate(String(plate));
      if (normalized !== vehicle.plate) {
        const conflict = await Vehicle.findOne({ plate: normalized, _id: { $ne: vehicleId } });
        if (conflict) {
          return res.status(400).json({ error: `Plate ${normalized} is already registered to another vehicle.` });
        }
        vehicle.plate = normalized;
        vehicle.plate_raw = String(plate).trim();
      }
    }

    if (brand !== undefined) vehicle.brand = String(brand).trim();
    if (model !== undefined) (vehicle as any).model = String(model).trim();
    if (color !== undefined) vehicle.color = String(color).trim();
    if (parking_number !== undefined && vehicle.vehicle_type !== 'bike') {
      vehicle.parking_number = String(parking_number).trim() || undefined;
    }

    await vehicle.save();
    await vehicle.populate('resident_id');

    const vObj: any = vehicle.toJSON();
    const owner = vehicle.resident_id as any;
    vObj.owner_name = owner?.full_name || 'Society Resident';
    vObj.owner_room = owner?.room_number || 'N/A';
    vObj.owner_phone = owner?.phone || '';

    return res.json({
      vehicle: vObj,
      message: 'Vehicle details updated successfully.',
    });
  } catch (err: any) {
    console.error('Admin update vehicle error:', err);
    return res.status(500).json({ error: 'Failed to update vehicle.' });
  }
}

export async function deleteVehicle(req: AuthenticatedRequest, res: Response) {
  try {
    const vehicleId = req.params.id;

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: 'Database not connected.' });
    }

    const deleted = await Vehicle.findByIdAndDelete(vehicleId);
    if (!deleted) {
      return res.status(404).json({ error: 'Vehicle not found.' });
    }
    return res.json({ success: true, message: 'Vehicle deleted from society registry.' });
  } catch (err: any) {
    console.error('Admin delete vehicle error:', err);
    return res.status(500).json({ error: 'Failed to delete vehicle.' });
  }
}

// ============================================================================
// Watchmen CRUD
// ============================================================================

export async function getWatchmen(req: AuthenticatedRequest, res: Response) {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: 'Database not connected.' });
    }

    const docs = await Watchman.find().sort({ createdAt: -1 });
    const watchmen = docs.map((w) => w.toJSON());
    return res.json({ watchmen });
  } catch (err: any) {
    console.error('Admin getWatchmen error:', err);
    return res.status(500).json({ error: 'Failed to retrieve watchmen.' });
  }
}

export async function createWatchman(req: AuthenticatedRequest, res: Response) {
  try {
    const { full_name, phone, password } = req.body || {};

    if (!full_name || !phone || !password) {
      return res.status(400).json({ error: 'Full name, phone, and password are required.' });
    }

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: 'Database not connected.' });
    }

    const cleanPhone = String(phone).replace(/[^0-9]/g, '');
    if (!isValidPhoneNumber(cleanPhone)) {
      return res.status(400).json({ error: 'Phone must be a valid 10-digit number.' });
    }

    // Admin-created watchmen bypass the production guards in config/env.ts, so
    // enforce a minimum length here. A weak gate credential is the one credential
    // an attacker can brute-force remotely.
    if (String(password).length < 8) {
      return res.status(400).json({ error: 'Watchman password must be at least 8 characters.' });
    }

    const existing = await Watchman.findOne({ phone: cleanPhone });
    if (existing) {
      return res.status(400).json({ error: 'A watchman account with this phone already exists.' });
    }

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(String(password), salt);

    const newWatchman = await Watchman.create({
      full_name: String(full_name).trim(),
      phone: cleanPhone,
      password_hash: hash,
      is_active: true,
    });

    return res.status(201).json({
      watchman: newWatchman.toJSON(),
      message: 'Watchman account created successfully.',
    });
  } catch (err: any) {
    console.error('Admin create watchman error:', err);
    return res.status(500).json({ error: 'Failed to create watchman account.' });
  }
}

export async function updateWatchman(req: AuthenticatedRequest, res: Response) {
  try {
    const watchmanId = req.params.id;
    const { full_name, phone, password, status } = req.body || {};

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: 'Database not connected.' });
    }

    const watchman = await Watchman.findById(watchmanId);
    if (!watchman) {
      return res.status(404).json({ error: 'Watchman not found.' });
    }

    if (phone) {
      const cleanPhone = String(phone).replace(/[^0-9]/g, '');
      if (!isValidPhoneNumber(cleanPhone)) {
        return res.status(400).json({ error: 'Phone must be a valid 10-digit number.' });
      }
      if (cleanPhone !== watchman.phone) {
        const conflict = await Watchman.findOne({ phone: cleanPhone, _id: { $ne: watchmanId } });
        if (conflict) {
          return res.status(400).json({ error: 'Phone is already registered to another watchman.' });
        }
        watchman.phone = cleanPhone;
      }
    }

    if (full_name) watchman.full_name = String(full_name).trim();
    if (password) {
      if (String(password).length < 8) {
        return res.status(400).json({ error: 'Watchman password must be at least 8 characters.' });
      }
      const salt = bcrypt.genSaltSync(10);
      watchman.password_hash = bcrypt.hashSync(String(password), salt);
    }
    if (status === 'active') watchman.is_active = true;
    if (status === 'inactive') watchman.is_active = false;

    await watchman.save();

    return res.json({
      watchman: watchman.toJSON(),
      message: 'Watchman account updated successfully.',
    });
  } catch (err: any) {
    console.error('Admin update watchman error:', err);
    return res.status(500).json({ error: 'Failed to update watchman account.' });
  }
}

export async function deleteWatchman(req: AuthenticatedRequest, res: Response) {
  try {
    const watchmanId = req.params.id;

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: 'Database not connected.' });
    }

    const deleted = await Watchman.findByIdAndDelete(watchmanId);
    if (!deleted) {
      return res.status(404).json({ error: 'Watchman not found.' });
    }
    return res.json({ success: true, message: 'Watchman account deleted.' });
  } catch (err: any) {
    console.error('Admin delete watchman error:', err);
    return res.status(500).json({ error: 'Failed to delete watchman.' });
  }
}

// ============================================================================
// Outsider Vehicles Oversight
// ============================================================================

export async function getOutsiderVehicles(req: AuthenticatedRequest, res: Response) {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: 'Database not connected.' });
    }

    const docs = await OutsiderVehicle.find()
      .sort({ createdAt: -1 })
      .populate('added_by_watchman_id', 'full_name');

    const vehicles = docs.map((doc) => {
      const v: any = doc.toJSON();
      const wDoc = doc.added_by_watchman_id as any;
      v.added_by_watchman_name = wDoc?.full_name || 'Gate Watchman';
      return v;
    });

    return res.json({ vehicles });
  } catch (err: any) {
    console.error('Admin getOutsiderVehicles error:', err);
    return res.status(500).json({ error: 'Failed to retrieve outsider vehicles.' });
  }
}

export async function markOutsiderVehicleExit(req: AuthenticatedRequest, res: Response) {
  try {
    const id = req.params.id;

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: 'Database not connected.' });
    }

    const vehicle = await OutsiderVehicle.findById(id).populate('added_by_watchman_id', 'full_name');
    if (!vehicle) {
      return res.status(404).json({ error: 'Outsider vehicle record not found.' });
    }

    if (vehicle.status === 'exited') {
      return res.status(400).json({ error: 'Vehicle is already marked as exited.' });
    }

    vehicle.status = 'exited';
    vehicle.exited_at = new Date();
    await vehicle.save();

    const vObj: any = vehicle.toJSON();
    const wDoc = vehicle.added_by_watchman_id as any;
    vObj.added_by_watchman_name = wDoc?.full_name || 'Gate Watchman';

    return res.json({
      vehicle: vObj,
      message: 'Outsider vehicle marked as exited.',
    });
  } catch (err: any) {
    console.error('Admin mark exit error:', err);
    return res.status(500).json({ error: 'Failed to mark vehicle as exited.' });
  }
}

// ============================================================================
// Search Logs & Reset Seed
// ============================================================================

export async function getSearchLogs(req: AuthenticatedRequest, res: Response) {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: 'Database not connected.' });
    }

    const docs = await SearchLog.find().sort({ createdAt: -1 }).limit(200);

    // Resolve the actor's display identity per role. The log stores only
    // searched_by_type + searched_by_id, so a resident's name/room has to be
    // looked up here or the audit table can only ever show the raw id.
    const residentIds = docs
      .filter((l) => l.searched_by_type === 'resident')
      .map((l) => l.searched_by_id)
      .filter((id) => typeof id === 'object' && id !== null);

    const adminIds = docs
      .filter((l) => l.searched_by_type === 'admin')
      .map((l) => l.searched_by_id)
      .filter((id) => typeof id === 'object' && id !== null);

    const [residents, admins] = await Promise.all([
      residentIds.length
        ? Resident.find({ _id: { $in: residentIds } }).select('full_name room_number')
        : Promise.resolve([] as Array<{ _id: any; full_name: string; room_number: string }>),
      adminIds.length
        ? Admin.find({ _id: { $in: adminIds } }).select('full_name room_number')
        : Promise.resolve([] as Array<{ _id: any; full_name: string; room_number: string }>),
    ]);

    const residentById = new Map(residents.map((r) => [r._id.toString(), r]));
    const adminById = new Map(admins.map((a) => [a._id.toString(), a]));

    const logs = docs.map((l) => {
      const actorId = l.searched_by_id ? String(l.searched_by_id) : null;
      const resident = l.searched_by_type === 'resident' && actorId ? residentById.get(actorId) : undefined;
      const admin = l.searched_by_type === 'admin' && actorId ? adminById.get(actorId) : undefined;

      return {
        id: l._id.toString(),
        search_query: l.query_term,
        searched_by_type: l.searched_by_type,
        searched_by_id: actorId,
        searcher_name: resident?.full_name || admin?.full_name || null,
        searcher_room: resident?.room_number || admin?.room_number || null,
        matched_plate: l.matched_plate || null,
        match_source: l.match_source || 'none',
        match_count: l.match_count ?? 0,
        matched_plates: l.matched_plates || [],
        created_at: l.createdAt ? l.createdAt.toISOString() : new Date().toISOString(),
      };
    });

    return res.json({ logs });
  } catch (err: any) {
    console.error('Admin getSearchLogs error:', err);
    return res.status(500).json({ error: 'Failed to retrieve search logs.' });
  }
}

export async function resetSeed(req: AuthenticatedRequest, res: Response) {
  try {
    // This endpoint purges every society record. Require an explicit opt-in so a
    // mis-tap, a stale tab, or a cross-site request cannot trigger it silently.
    if (req.body?.confirm !== 'RESET') {
      return res.status(400).json({
        error:
          'Reset is destructive and requires confirmation. Send { "confirm": "RESET" } to proceed.',
      });
    }

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: 'Database not connected. Please configure MONGODB_URI.' });
    }

    // Warn about collateral damage: seed() recreates Watchman and Admin from env,
    // so any watchman accounts created through the UI are destroyed by a reset.
    const [watchmanCount, residentCount, vehicleCount] = await Promise.all([
      Watchman.countDocuments(),
      Resident.countDocuments(),
      Vehicle.countDocuments(),
    ]);

    await seedDatabase(true, true); // preserve the SearchLog audit trail

    return res.json({
      success: true,
      message: 'Society demo data reset. The search audit trail was preserved.',
      deleted: {
        residents: residentCount,
        vehicles: vehicleCount,
        watchmen: watchmanCount,
      },
      warning:
        watchmanCount > 1
          ? `${watchmanCount - 1} watchman account(s) created through the admin UI were removed and replaced by the seeded demo guard.`
          : undefined,
    });
  } catch (err: any) {
    console.error('Admin reset seed error:', err);
    return res.status(500).json({ error: 'Failed to reset demo dataset.' });
  }
}
