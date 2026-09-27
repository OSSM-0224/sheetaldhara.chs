import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { Resident, Vehicle, OutsiderVehicle, Watchman, Admin, SearchLog } from '../models/index.ts';
import { ENV } from '../config/env.ts';
import { normalizePlate } from '../utils/plateNormalizer.ts';

/**
 * Seed the MongoDB Atlas database with the initial demonstration dataset.
 * @param force If true, clears existing collections before seeding.
 * @param preserveSearchLog When true, keeps the SearchLog audit trail intact.
 *   Resetting demo *society data* must not erase the record of who searched for
 *   which vehicle — that log is the compliance artifact, not demo content.
 */
export async function seedDatabase(force = false, preserveSearchLog = false): Promise<void> {
  if (mongoose.connection.readyState !== 1) {
    console.warn('[Seed] MongoDB is not connected; skipping seeding routine.');
    return;
  }

  const existingResidents = await Resident.countDocuments();
  if (!force && existingResidents > 0) {
    console.log('[Seed] Database already initialized with data. Skipping initial seeding.');
    return;
  }

  console.log(
    force
      ? '[Seed] Force reset requested. Purging existing collections...'
      : '[Seed] Collections empty. Seeding initial demo data...'
  );

  // Clear all collections for fresh seed
  await Promise.all([
    Resident.deleteMany({}),
    Vehicle.deleteMany({}),
    OutsiderVehicle.deleteMany({}),
    Watchman.deleteMany({}),
    Admin.deleteMany({}),
    ...(preserveSearchLog ? [] : [SearchLog.deleteMany({})]),
  ]);

  if (preserveSearchLog) {
    console.log('[Seed] SearchLog audit trail preserved across reset.');
  }

  const adminSalt = bcrypt.genSaltSync(10);
  const adminHash = bcrypt.hashSync(ENV.ADMIN_PASSWORD, adminSalt);

  const watchmanSalt = bcrypt.genSaltSync(10);
  const watchmanHash = bcrypt.hashSync(ENV.WATCHMAN_PASSWORD, watchmanSalt);

  // 1. Create Admin
  await Admin.create({
    full_name: ENV.ADMIN_NAME,
    phone: ENV.ADMIN_PHONE,
    password_hash: adminHash,
    room_number: 'A-101',
  });

  // 2. Create Watchman
  const watchman = await Watchman.create({
    full_name: ENV.WATCHMAN_NAME,
    phone: ENV.WATCHMAN_PHONE,
    password_hash: watchmanHash,
    is_active: true,
  });

  // 3. Create Residents
  const [res1, res2, res3, res4] = await Resident.create([
    {
      full_name: 'Priya Nair',
      room_number: 'B-304',
      phone: '9820022334',
    },
    {
      full_name: 'Amitabh Sen',
      room_number: 'C-702',
      phone: '9820033445',
    },
    {
      full_name: 'Sneha Kulkarni',
      room_number: 'A-502',
      phone: '9820044556',
    },
    {
      full_name: 'Vikram Malhotra',
      room_number: 'D-201',
      phone: '9820055667',
    },
    {
      full_name: 'Kavita Rao',
      room_number: 'B-103',
      phone: '9820066778',
    },
    {
      full_name: 'Om Mhatre',
      room_number: 'G-201',
      phone: '7506380156',
    },
  ]);

  // 4. Create Vehicles linked to Resident ObjectIds
  await Vehicle.create([
    {
      resident_id: res1._id,
      vehicle_type: 'car',
      brand: 'Honda',
      model: 'City',
      color: 'White',
      plate: normalizePlate('MH02AB4821'),
      plate_raw: 'MH 02 AB 4821',
      parking_number: 'P-24',
    },
    {
      resident_id: res2._id,
      vehicle_type: 'bike',
      brand: 'Royal Enfield',
      model: 'Classic 350',
      color: 'Black',
      plate: normalizePlate('MH12CD4821'),
      plate_raw: 'MH 12 CD 4821',
      parking_number: undefined,
    },
    {
      resident_id: res3._id,
      vehicle_type: 'car',
      brand: 'Hyundai',
      model: 'Creta',
      color: 'Silver',
      plate: normalizePlate('MH01EF9090'),
      plate_raw: 'MH 01 EF 9090',
      parking_number: 'P-12',
    },
    {
      resident_id: res3._id,
      vehicle_type: 'bike',
      brand: 'Ather',
      model: '450X',
      color: 'Grey',
      plate: normalizePlate('MH47XY9090'),
      plate_raw: 'MH 47 XY 9090',
      parking_number: undefined,
    },
    {
      resident_id: res3._id,
      vehicle_type: 'bike',
      brand: 'TVS',
      model: 'Jupiter',
      color: 'Blue',
      plate: normalizePlate('MH01GH3312'),
      plate_raw: 'MH 01 GH 3312',
      parking_number: undefined,
    },
    {
      resident_id: res4._id,
      vehicle_type: 'car',
      brand: 'Tata',
      model: 'Nexon EV',
      color: 'Teal Blue',
      plate: normalizePlate('MH04JK1100'),
      plate_raw: 'MH 04 JK 1100',
      parking_number: 'P-09',
    },
    {
      resident_id: res4._id,
      vehicle_type: 'car',
      brand: 'Maruti',
      model: 'Swift',
      color: 'Red',
      plate: normalizePlate('MH02MN7766'),
      plate_raw: 'MH 02 MN 7766',
      parking_number: 'P-10',
    },
  ]);

  // 5. Create Sample Outsider Vehicles
  await OutsiderVehicle.create([
    {
      plate: normalizePlate('MH14ZZ7788'),
      plate_raw: 'MH 14 ZZ 7788',
      vehicle_type: 'bike',
      owner_phone: '9911223344',
      owner_name: 'Rohan Sharma',
      note: 'visiting flat D-201',
      added_by_watchman_id: watchman._id,
      status: 'inside',
      exited_at: null,
    },
    {
      plate: normalizePlate('MH03QW5566'),
      plate_raw: 'MH 03 QW 5566',
      vehicle_type: 'car',
      owner_phone: '9822334455',
      owner_name: 'Fast Track Logistics',
      note: 'delivery vehicle',
      added_by_watchman_id: watchman._id,
      status: 'inside',
      exited_at: null,
    },
  ]);

  console.log('[Seed] Database successfully seeded with demo society data.');
}
