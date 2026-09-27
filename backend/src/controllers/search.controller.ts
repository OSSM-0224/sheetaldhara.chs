import { Response } from 'express';
import mongoose from 'mongoose';
import { Vehicle, OutsiderVehicle, SearchLog } from '../models/index.ts';
import { AuthenticatedRequest } from '../middleware/auth.ts';
import { normalizePlate, isFourDigitQuery } from '../utils/plateNormalizer.ts';

export async function searchVehicles(req: AuthenticatedRequest, res: Response) {
  try {
    const rawQuery = String(req.query.q || '').trim();

    if (!rawQuery) {
      return res.json({
        matches: [],
        searchType: 'LAST_FOUR',
        normalizedQuery: '',
      });
    }

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        error: 'Database is not connected. Please configure MONGODB_URI in Settings to enable live search.',
      });
    }

    const isLastFour = isFourDigitQuery(rawQuery);
    const normalized = normalizePlate(rawQuery);

    const matches: any[] = [];

    if (isLastFour) {
      // Last-4-digits lookup: regex anchored to end of string against indexed plate field
      const [regVehicles, outVehicles] = await Promise.all([
        Vehicle.find({ plate: { $regex: rawQuery + '$' } }).populate('resident_id'),
        OutsiderVehicle.find({ plate: { $regex: rawQuery + '$' } }).populate('added_by_watchman_id'),
      ]);

      for (const v of regVehicles) {
        const owner = v.resident_id as any;
        matches.push({
          id: v._id.toString(),
          source: 'resident',
          vehicle_type: (v.vehicle_type || 'CAR').toUpperCase(),
          normalized_plate: v.plate,
          last_four_digits: v.plate.slice(-4),
          brand: v.brand,
          model: v.model,
          color: v.color || null,
          parking_number: v.parking_number || null,
          owner_name: owner?.full_name || 'Society Resident',
          owner_room: owner?.room_number || 'N/A',
          owner_phone: owner?.phone || '',
        });
      }

      for (const out of outVehicles) {
        const watchman = out.added_by_watchman_id as any;
        matches.push({
          id: out._id.toString(),
          source: 'outsider',
          vehicle_type: (out.vehicle_type || 'CAR').toUpperCase(),
          normalized_plate: out.plate,
          last_four_digits: out.plate.slice(-4),
          plate_raw: out.plate_raw,
          brand: null,
          model: null,
          color: null,
          parking_number: null,
          owner_name: out.owner_name || 'Visitor / Outsider',
          owner_room: undefined,
          owner_phone: out.owner_phone,
          note: out.note,
          status: out.status,
          added_at: out.createdAt ? out.createdAt.toISOString() : new Date().toISOString(),
          exited_at: out.exited_at ? out.exited_at.toISOString() : null,
          added_by_watchman_name: watchman?.full_name || 'Gate Watchman',
        });
      }
    } else if (normalized.length === 10) {
      // Full 10-char plate lookup: indexed direct lookups
      const [regVehicle, outVehicle] = await Promise.all([
        Vehicle.findOne({ plate: normalized }).populate('resident_id'),
        OutsiderVehicle.findOne({ plate: normalized, status: 'inside' }).populate('added_by_watchman_id'),
      ]);

      if (regVehicle) {
        const owner = regVehicle.resident_id as any;
        matches.push({
          id: regVehicle._id.toString(),
          source: 'resident',
          vehicle_type: (regVehicle.vehicle_type || 'CAR').toUpperCase(),
          normalized_plate: regVehicle.plate,
          last_four_digits: regVehicle.plate.slice(-4),
          brand: regVehicle.brand,
          model: regVehicle.model,
          color: regVehicle.color || null,
          parking_number: regVehicle.parking_number || null,
          owner_name: owner?.full_name || 'Society Resident',
          owner_room: owner?.room_number || 'N/A',
          owner_phone: owner?.phone || '',
        });
      }

      if (outVehicle) {
        const watchman = outVehicle.added_by_watchman_id as any;
        matches.push({
          id: outVehicle._id.toString(),
          source: 'outsider',
          vehicle_type: (outVehicle.vehicle_type || 'CAR').toUpperCase(),
          normalized_plate: outVehicle.plate,
          last_four_digits: outVehicle.plate.slice(-4),
          plate_raw: outVehicle.plate_raw,
          brand: null,
          model: null,
          color: null,
          parking_number: null,
          owner_name: outVehicle.owner_name || 'Visitor / Outsider',
          owner_room: undefined,
          owner_phone: outVehicle.owner_phone,
          note: outVehicle.note,
          status: outVehicle.status,
          added_at: outVehicle.createdAt ? outVehicle.createdAt.toISOString() : new Date().toISOString(),
          exited_at: outVehicle.exited_at ? outVehicle.exited_at.toISOString() : null,
          added_by_watchman_name: watchman?.full_name || 'Gate Watchman',
        });
      }
    } else {
      // General plate partial matching
      const [regVehicles, outVehicles] = await Promise.all([
        Vehicle.find({ plate: { $regex: normalized } }).populate('resident_id'),
        OutsiderVehicle.find({ plate: { $regex: normalized } }).populate('added_by_watchman_id'),
      ]);

      for (const v of regVehicles) {
        const owner = v.resident_id as any;
        matches.push({
          id: v._id.toString(),
          source: 'resident',
          vehicle_type: (v.vehicle_type || 'CAR').toUpperCase(),
          normalized_plate: v.plate,
          last_four_digits: v.plate.slice(-4),
          brand: v.brand,
          model: v.model,
          color: v.color || null,
          parking_number: v.parking_number || null,
          owner_name: owner?.full_name || 'Society Resident',
          owner_room: owner?.room_number || 'N/A',
          owner_phone: owner?.phone || '',
        });
      }

      for (const out of outVehicles) {
        const watchman = out.added_by_watchman_id as any;
        matches.push({
          id: out._id.toString(),
          source: 'outsider',
          vehicle_type: (out.vehicle_type || 'CAR').toUpperCase(),
          normalized_plate: out.plate,
          last_four_digits: out.plate.slice(-4),
          plate_raw: out.plate_raw,
          brand: null,
          model: null,
          color: null,
          parking_number: null,
          owner_name: out.owner_name || 'Visitor / Outsider',
          owner_room: undefined,
          owner_phone: out.owner_phone,
          note: out.note,
          status: out.status,
          added_at: out.createdAt ? out.createdAt.toISOString() : new Date().toISOString(),
          exited_at: out.exited_at ? out.exited_at.toISOString() : null,
          added_by_watchman_name: watchman?.full_name || 'Gate Watchman',
        });
      }
    }

    // Record Search Log (non-blocking)
    const searcherType = req.role === 'RESIDENT' ? 'resident' : req.role === 'ADMIN' ? 'admin' : 'watchman';
    const searcherId = req.resident?._id || req.user?._id || req.watchman?._id || 'system';
    const matchedPlates = matches.map((m) => m.normalized_plate).filter(Boolean);

    SearchLog.create({
      query_term: rawQuery,
      searched_by_type: searcherType,
      searched_by_id: searcherId,
      matched_plate: matchedPlates[0],
      match_source: matches.length > 0 ? (matches[0].source === 'resident' ? 'registered' : 'outsider') : 'none',
      match_count: matches.length,
      matched_plates: matchedPlates.slice(0, 25),
    }).catch((logErr) => {
      console.warn('[SearchLog] Warning: failed to write search log:', logErr?.message || logErr);
    });

    return res.json({
      matches,
      searchType: isLastFour ? 'LAST_FOUR' : 'FULL_PLATE',
      normalizedQuery: normalized,
    });
  } catch (err: any) {
    console.error('Search error:', err);
    return res.status(500).json({ error: 'Search failed. Please try again.' });
  }
}
