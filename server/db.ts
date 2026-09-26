import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { normalizePlate } from './utils.ts';

export type UserRole = 'ADMIN' | 'WATCHMAN';
export type VehicleType = 'BIKE' | 'CAR' | 'OTHER';

export interface User {
  id: string;
  phone: string;
  password_hash: string;
  role: 'ADMIN' | 'WATCHMAN';
  full_name?: string;
  status?: 'active' | 'inactive';
  created_at: string;
}

export interface Resident {
  id: string;
  full_name: string;
  room_number: string;
  phone: string;
  created_at: string;
}

export interface Vehicle {
  id: string;
  resident_id: string;
  vehicle_type: VehicleType;
  brand: string | null;
  model: string | null;
  normalized_plate: string;
  last_four_digits: string;
  parking_number: string | null;
  created_at: string;
}

export interface OutsiderVehicle {
  id: string;
  plate: string;              // normalized, same rules as registered vehicles
  plate_raw: string;          // as typed, for reference
  last_four_digits: string;
  vehicle_type: VehicleType;
  owner_phone: string;
  owner_name?: string;
  note?: string;              // e.g. "visiting flat B-304", "delivery"
  added_by_watchman_id: string;
  added_by_watchman_name?: string;
  added_at: string;           // ISO timestamp
  exited_at?: string | null;  // optional — set when vehicle leaves
  status: 'inside' | 'exited';
}

export interface SearchLog {
  id: string;
  searched_by_resident_id: string;
  search_query: string;
  matched_vehicle_id: string | null;
  created_at: string;
}

export interface DatabaseState {
  users: User[]; // holds ADMIN and WATCHMAN accounts
  residents: Resident[];
  vehicles: Vehicle[];
  outsider_vehicles: OutsiderVehicle[];
  search_logs: SearchLog[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'society_db.json');

class SocietyDatabase {
  private state: DatabaseState = {
    users: [],
    residents: [],
    vehicles: [],
    outsider_vehicles: [],
    search_logs: [],
  };

  constructor() {
    this.init();
  }

  private init() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.state = JSON.parse(raw);

        if (!this.state.outsider_vehicles) {
          this.state.outsider_vehicles = [];
        }

        // Ensure admin user exists and structure is up to date
        if (!this.state.users || this.state.users.length === 0 || !this.state.residents) {
          this.seedInitialData();
        } else {
          // Keep ADMIN and WATCHMAN users
          this.state.users = this.state.users.filter((u) => u.role === 'ADMIN' || u.role === 'WATCHMAN');
          if (!this.state.users.some((u) => u.role === 'ADMIN')) {
            this.ensureAdminUser();
          }
          if (!this.state.users.some((u) => u.role === 'WATCHMAN')) {
            this.ensureSeedWatchman();
          }
          // Remove status field from residents if legacy file loaded
          this.state.residents.forEach((r: any) => {
            delete r.status;
            delete r.user_id;
          });
        }
      } else {
        this.seedInitialData();
      }
    } catch (err) {
      console.error('Failed to initialize database, loading seed data:', err);
      this.seedInitialData();
    }
  }

  private ensureAdminUser() {
    const adminPhone = (process.env.ADMIN_PHONE || '9820011223').replace(/[^0-9]/g, '');
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const adminHash = bcrypt.hashSync(adminPassword, 10);
    const now = new Date().toISOString();

    const adminUser: User = {
      id: 'admin-1',
      phone: adminPhone,
      password_hash: adminHash,
      role: 'ADMIN',
      full_name: 'Ramesh Sharma',
      status: 'active',
      created_at: now,
    };

    this.state.users.push(adminUser);
    this.persist();
  }

  private ensureSeedWatchman() {
    const watchmanPhone = '9820099001';
    const watchmanPassword = 'watchman123';
    const watchmanHash = bcrypt.hashSync(watchmanPassword, 10);
    const now = new Date().toISOString();

    const watchmanUser: User = {
      id: 'watchman-1',
      phone: watchmanPhone,
      password_hash: watchmanHash,
      role: 'WATCHMAN',
      full_name: 'Sanjay Yadav',
      status: 'active',
      created_at: now,
    };

    this.state.users.push(watchmanUser);
    this.persist();
  }

  private persist() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(this.state, null, 2), 'utf-8');
    } catch (err) {
      console.error('Database write error:', err);
    }
  }

  public seedInitialData() {
    console.log('Seeding society database with residents, vehicles, admin, watchman, and outsider vehicles...');
    const now = new Date().toISOString();

    // Single Admin account from environment variables or secure defaults
    const adminPhone = (process.env.ADMIN_PHONE || '9820011223').replace(/[^0-9]/g, '');
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const adminHash = bcrypt.hashSync(adminPassword, 10);

    // Seed Watchman account (Sanjay Yadav / 9820099001 / watchman123)
    const watchmanPhone = '9820099001';
    const watchmanPassword = 'watchman123';
    const watchmanHash = bcrypt.hashSync(watchmanPassword, 10);

    const users: User[] = [
      {
        id: 'admin-1',
        phone: adminPhone,
        password_hash: adminHash,
        role: 'ADMIN',
        full_name: 'Ramesh Sharma',
        status: 'active',
        created_at: now,
      },
      {
        id: 'watchman-1',
        phone: watchmanPhone,
        password_hash: watchmanHash,
        role: 'WATCHMAN',
        full_name: 'Sanjay Yadav',
        status: 'active',
        created_at: now,
      },
    ];

    // Pre-approved society residents directory directly managed by admin (no status column)
    const residents: Resident[] = [
      {
        id: 'res-admin-1',
        full_name: 'Ramesh Sharma',
        room_number: 'A-101',
        phone: '9820011223',
        created_at: now,
      },
      {
        id: 'res-priya-2',
        full_name: 'Priya Nair',
        room_number: 'B-304',
        phone: '9820022334',
        created_at: now,
      },
      {
        id: 'res-amitabh-3',
        full_name: 'Amitabh Sen',
        room_number: 'C-702',
        phone: '9820033445',
        created_at: now,
      },
      {
        id: 'res-sneha-4',
        full_name: 'Sneha Kulkarni',
        room_number: 'A-502',
        phone: '9820044556',
        created_at: now,
      },
      {
        id: 'res-vikram-5',
        full_name: 'Vikram Malhotra',
        room_number: 'D-201',
        phone: '9820055667',
        created_at: now,
      },
      {
        id: 'res-kavita-6',
        full_name: 'Kavita Rao',
        room_number: 'B-103',
        phone: '9820066778',
        created_at: now,
      },
    ];

    // Pre-assigned vehicles (bikes have null parking_number; cars have designated slot)
    const vehicles: Vehicle[] = [
      {
        id: 'veh-1',
        resident_id: 'res-priya-2',
        vehicle_type: 'CAR',
        brand: 'Honda',
        model: 'City',
        normalized_plate: 'MH02AB4821',
        last_four_digits: '4821',
        parking_number: 'P-24',
        created_at: now,
      },
      {
        id: 'veh-2',
        resident_id: 'res-amitabh-3',
        vehicle_type: 'BIKE',
        brand: 'Royal Enfield',
        model: 'Classic 350',
        normalized_plate: 'MH12CD4821',
        last_four_digits: '4821',
        parking_number: null,
        created_at: now,
      },
      {
        id: 'veh-3',
        resident_id: 'res-sneha-4',
        vehicle_type: 'CAR',
        brand: 'Hyundai',
        model: 'Creta',
        normalized_plate: 'MH01EF9090',
        last_four_digits: '9090',
        parking_number: 'P-15',
        created_at: now,
      },
      {
        id: 'veh-4',
        resident_id: 'res-sneha-4',
        vehicle_type: 'BIKE',
        brand: 'Ather',
        model: '450X Gen 3',
        normalized_plate: 'MH47XY9090',
        last_four_digits: '9090',
        parking_number: null,
        created_at: now,
      },
      {
        id: 'veh-5',
        resident_id: 'res-sneha-4',
        vehicle_type: 'BIKE',
        brand: 'TVS',
        model: 'Jupiter',
        normalized_plate: 'MH01GH3312',
        last_four_digits: '3312',
        parking_number: null,
        created_at: now,
      },
      {
        id: 'veh-6',
        resident_id: 'res-vikram-5',
        vehicle_type: 'CAR',
        brand: 'Tata',
        model: 'Nexon EV',
        normalized_plate: 'MH04JK1100',
        last_four_digits: '1100',
        parking_number: 'P-09',
        created_at: now,
      },
      {
        id: 'veh-7',
        resident_id: 'res-vikram-5',
        vehicle_type: 'CAR',
        brand: 'Maruti Suzuki',
        model: 'Swift ZXi',
        normalized_plate: 'MH02MN7766',
        last_four_digits: '7766',
        parking_number: 'P-10',
        created_at: now,
      },
      {
        id: 'veh-8',
        resident_id: 'res-admin-1',
        vehicle_type: 'CAR',
        brand: 'Toyota',
        model: 'Innova Crysta',
        normalized_plate: 'MH03PQ5544',
        last_four_digits: '5544',
        parking_number: 'P-01',
        created_at: now,
      },
    ];

    // Seeded sample outsider vehicles logged by watchman
    const outsider_vehicles: OutsiderVehicle[] = [
      {
        id: 'out-1',
        plate: 'MH03XY1234',
        plate_raw: 'MH 03 XY 1234',
        last_four_digits: '1234',
        vehicle_type: 'BIKE',
        owner_phone: '9820088111',
        owner_name: 'Rajesh (Swiggy)',
        note: 'Delivery for Flat B-304',
        added_by_watchman_id: 'watchman-1',
        added_by_watchman_name: 'Sanjay Yadav',
        added_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        exited_at: null,
        status: 'inside',
      },
      {
        id: 'out-2',
        plate: 'MH04AB5678',
        plate_raw: 'MH-04 AB 5678',
        last_four_digits: '5678',
        vehicle_type: 'CAR',
        owner_phone: '9820077222',
        owner_name: 'Kunal Shah',
        note: 'Guest visiting Flat C-702',
        added_by_watchman_id: 'watchman-1',
        added_by_watchman_name: 'Sanjay Yadav',
        added_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        exited_at: null,
        status: 'inside',
      },
    ];

    this.state = {
      users,
      residents,
      vehicles,
      outsider_vehicles,
      search_logs: [
        {
          id: 'log-1',
          searched_by_resident_id: 'res-priya-2',
          search_query: '4821',
          matched_vehicle_id: 'veh-2',
          created_at: new Date(Date.now() - 3600000).toISOString(),
        },
      ],
    };

    this.persist();
  }

  // ==========================================
  // 1. ADMIN USER (Single admin account)
  // ==========================================

  public getAdminUser(): User | undefined {
    return this.state.users.find((u) => u.role === 'ADMIN') || this.state.users[0];
  }

  public findAdminByPhone(phone: string): User | undefined {
    const clean = phone.replace(/[^0-9]/g, '');
    const admin = this.getAdminUser();
    if (admin && admin.phone === clean) {
      return admin;
    }
    return undefined;
  }

  // ==========================================
  // 1B. WATCHMEN MANAGEMENT (Admin only)
  // ==========================================

  public getWatchmen(): User[] {
    return this.state.users.filter((u) => u.role === 'WATCHMAN');
  }

  public findWatchmanById(id: string): User | undefined {
    return this.state.users.find((u) => u.role === 'WATCHMAN' && u.id === id);
  }

  public findWatchmanByPhone(phone: string): User | undefined {
    const clean = phone.replace(/[^0-9]/g, '');
    return this.state.users.find((u) => u.role === 'WATCHMAN' && u.phone === clean);
  }

  public createWatchman(params: {
    fullName: string;
    phone: string;
    password: string;
  }): { watchman?: User; error?: string } {
    const cleanPhone = params.phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10) {
      return { error: 'Phone number must be at least 10 digits.' };
    }
    if (!params.fullName || params.fullName.trim().length < 2) {
      return { error: 'Full name is required.' };
    }
    if (!params.password || params.password.length < 4) {
      return { error: 'Password must be at least 4 characters.' };
    }

    if (this.state.users.some((u) => u.phone === cleanPhone)) {
      return { error: 'A user or watchman with this phone number already exists.' };
    }

    const hash = bcrypt.hashSync(params.password, 10);
    const watchman: User = {
      id: 'watchman-' + crypto.randomUUID(),
      phone: cleanPhone,
      password_hash: hash,
      role: 'WATCHMAN',
      full_name: params.fullName.trim(),
      status: 'active',
      created_at: new Date().toISOString(),
    };

    this.state.users.push(watchman);
    this.persist();
    return { watchman };
  }

  public updateWatchman(
    id: string,
    updates: {
      fullName?: string;
      phone?: string;
      password?: string;
      status?: 'active' | 'inactive';
    }
  ): { watchman?: User; error?: string } {
    const watchman = this.findWatchmanById(id);
    if (!watchman) return { error: 'Watchman not found.' };

    if (updates.phone) {
      const cleanPhone = updates.phone.replace(/[^0-9]/g, '');
      if (cleanPhone.length < 10) return { error: 'Phone number must be at least 10 digits.' };
      const existing = this.state.users.find((u) => u.phone === cleanPhone && u.id !== id);
      if (existing) return { error: 'Another user is already registered with this phone number.' };
      watchman.phone = cleanPhone;
    }

    if (updates.fullName !== undefined) {
      if (updates.fullName.trim().length < 2) return { error: 'Full name is required.' };
      watchman.full_name = updates.fullName.trim();
    }

    if (updates.password) {
      if (updates.password.length < 4) return { error: 'Password must be at least 4 characters.' };
      watchman.password_hash = bcrypt.hashSync(updates.password, 10);
    }

    if (updates.status) {
      watchman.status = updates.status;
    }

    this.persist();
    return { watchman };
  }

  public deleteWatchman(id: string): boolean {
    const idx = this.state.users.findIndex((u) => u.role === 'WATCHMAN' && u.id === id);
    if (idx === -1) return false;
    this.state.users.splice(idx, 1);
    this.persist();
    return true;
  }

  // ==========================================
  // 1C. OUTSIDER VEHICLES (Watchman & Admin)
  // ==========================================

  public addOutsiderVehicle(params: {
    plateInput: string;
    vehicleType: VehicleType;
    ownerPhone: string;
    ownerName?: string;
    note?: string;
    watchmanId: string;
  }): { vehicle?: OutsiderVehicle; error?: string } {
    const { normalizedPlate, lastFourDigits } = normalizePlate(params.plateInput);
    if (!normalizedPlate || normalizedPlate.length < 4) {
      return { error: 'Plate must have at least 4 alphanumeric characters.' };
    }

    const cleanPhone = params.ownerPhone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10) {
      return { error: "Owner's phone number must be at least 10 digits." };
    }

    const watchman = this.findWatchmanById(params.watchmanId);
    const watchmanName = watchman?.full_name || 'Gate Watchman';

    const outsiderVehicle: OutsiderVehicle = {
      id: 'out-' + crypto.randomUUID(),
      plate: normalizedPlate,
      plate_raw: params.plateInput.trim(),
      last_four_digits: lastFourDigits,
      vehicle_type: params.vehicleType,
      owner_phone: cleanPhone,
      owner_name: params.ownerName?.trim() || undefined,
      note: params.note?.trim() || undefined,
      added_by_watchman_id: params.watchmanId,
      added_by_watchman_name: watchmanName,
      added_at: new Date().toISOString(),
      exited_at: null,
      status: 'inside',
    };

    this.state.outsider_vehicles.unshift(outsiderVehicle);
    this.persist();
    return { vehicle: outsiderVehicle };
  }

  public getOutsiderVehiclesByWatchman(watchmanId: string): OutsiderVehicle[] {
    return this.state.outsider_vehicles.filter((ov) => ov.added_by_watchman_id === watchmanId);
  }

  public markOutsiderVehicleExited(
    id: string,
    watchmanId: string,
    isAdmin = false
  ): { vehicle?: OutsiderVehicle; error?: string } {
    const vehicle = this.state.outsider_vehicles.find((ov) => ov.id === id);
    if (!vehicle) {
      return { error: 'Outsider vehicle record not found.' };
    }

    // Strict boundary: Only the watchman who added it or an Admin can mark it exited
    if (!isAdmin && vehicle.added_by_watchman_id !== watchmanId) {
      return { error: 'Access denied: You can only mark your own logged vehicles as exited.' };
    }

    vehicle.status = 'exited';
    vehicle.exited_at = new Date().toISOString();
    this.persist();
    return { vehicle };
  }

  public getAllOutsiderVehicles(): OutsiderVehicle[] {
    return this.state.outsider_vehicles;
  }

  // ==========================================
  // 2. RESIDENTS MANAGEMENT & CREDENTIALS
  // ==========================================

  public findResidentById(id: string): Resident | undefined {
    return this.state.residents.find((r) => r.id === id);
  }

  /**
   * Residents sign in with Room Number + Phone Number only.
   * Matches both exact and normalized room numbers (e.g. "B-304" or "B304")
   * and phone numbers (digits comparison / last 10 digits).
   */
  public findResidentByRoomAndPhone(roomNumber: string, phone: string): Resident | undefined {
    const cleanRoom = roomNumber.trim().toUpperCase().replace(/\s+/g, '');
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const last10 = cleanPhone.slice(-10);

    if (!cleanRoom || cleanPhone.length < 8) return undefined;

    return this.state.residents.find((r) => {
      const rRoom = r.room_number.trim().toUpperCase().replace(/\s+/g, '');
      const rPhone = r.phone.replace(/[^0-9]/g, '');
      const rLast10 = rPhone.slice(-10);

      const roomMatches =
        rRoom === cleanRoom || rRoom.replace(/-/g, '') === cleanRoom.replace(/-/g, '');
      const phoneMatches =
        rPhone === cleanPhone || (last10.length === 10 && last10 === rLast10);

      return roomMatches && phoneMatches;
    });
  }

  /**
   * UNIQUE (room_number, phone) constraint check.
   */
  public isRoomAndPhoneTaken(roomNumber: string, phone: string, excludeResidentId?: string): boolean {
    const cleanRoom = roomNumber.trim().toUpperCase().replace(/\s+/g, '');
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const last10 = cleanPhone.slice(-10);

    return this.state.residents.some((r) => {
      if (excludeResidentId && r.id === excludeResidentId) return false;
      const rRoom = r.room_number.trim().toUpperCase().replace(/\s+/g, '');
      const rPhone = r.phone.replace(/[^0-9]/g, '');
      const rLast10 = rPhone.slice(-10);

      const roomMatches =
        rRoom === cleanRoom || rRoom.replace(/-/g, '') === cleanRoom.replace(/-/g, '');
      const phoneMatches =
        rPhone === cleanPhone || (last10.length === 10 && last10 === rLast10);

      return roomMatches && phoneMatches;
    });
  }

  public getAllResidents(): Resident[] {
    return [...this.state.residents];
  }

  public createResident(params: {
    fullName: string;
    roomNumber: string;
    phone: string;
  }): { resident?: Resident; error?: string } {
    const cleanName = params.fullName.trim();
    const cleanRoom = params.roomNumber.trim().toUpperCase();
    const cleanPhone = params.phone.replace(/[^0-9]/g, '');

    if (!cleanName || !cleanRoom || !cleanPhone) {
      return { error: 'Full Name, Room Number, and Phone Number are required.' };
    }

    if (cleanPhone.length < 8 || cleanPhone.length > 15) {
      return { error: 'Phone number must be between 8 and 15 digits.' };
    }

    if (this.isRoomAndPhoneTaken(cleanRoom, cleanPhone)) {
      return { error: 'A resident with this Room Number and Phone combination already exists.' };
    }

    const resident: Resident = {
      id: 'res-' + crypto.randomUUID(),
      full_name: cleanName,
      room_number: cleanRoom,
      phone: cleanPhone,
      created_at: new Date().toISOString(),
    };

    this.state.residents.push(resident);
    this.persist();
    return { resident };
  }

  public updateResident(
    id: string,
    params: {
      fullName?: string;
      roomNumber?: string;
      phone?: string;
    }
  ): { resident?: Resident; error?: string } {
    const resident = this.findResidentById(id);
    if (!resident) return { error: 'Resident not found.' };

    const newRoom =
      params.roomNumber !== undefined
        ? params.roomNumber.trim().toUpperCase()
        : resident.room_number;
    const newPhone =
      params.phone !== undefined ? params.phone.replace(/[^0-9]/g, '') : resident.phone;

    if (this.isRoomAndPhoneTaken(newRoom, newPhone, id)) {
      return { error: 'Another resident with this Room Number and Phone combination already exists.' };
    }

    if (params.fullName !== undefined && params.fullName.trim()) {
      resident.full_name = params.fullName.trim();
    }
    resident.room_number = newRoom;
    resident.phone = newPhone;

    this.persist();
    return { resident };
  }

  public deleteResident(id: string): boolean {
    const idx = this.state.residents.findIndex((r) => r.id === id);
    if (idx === -1) return false;

    this.state.residents.splice(idx, 1);
    // Delete all vehicles belonging to this resident
    this.state.vehicles = this.state.vehicles.filter((v) => v.resident_id !== id);
    this.persist();
    return true;
  }

  // ==========================================
  // 3. VEHICLES (Admin-Only Write)
  // ==========================================

  public getVehiclesByResidentId(residentId: string): Vehicle[] {
    return this.state.vehicles.filter((v) => v.resident_id === residentId);
  }

  public getAllVehiclesWithOwners() {
    return this.state.vehicles.map((v) => {
      const resident = this.state.residents.find((r) => r.id === v.resident_id);
      return {
        ...v,
        owner_name: resident?.full_name || 'Unknown',
        owner_room: resident?.room_number || 'N/A',
        owner_phone: resident?.phone || 'N/A',
      };
    });
  }

  public findVehicleById(id: string): Vehicle | undefined {
    return this.state.vehicles.find((v) => v.id === id);
  }

  public findVehicleByNormalizedPlate(plate: string): Vehicle | undefined {
    return this.state.vehicles.find((v) => v.normalized_plate === plate);
  }

  public createVehicle(params: {
    residentId: string;
    vehicleType: VehicleType;
    brand?: string;
    model?: string;
    plateInput: string;
    parkingNumber?: string;
  }): { vehicle?: Vehicle; error?: string } {
    const resident = this.findResidentById(params.residentId);
    if (!resident) {
      return { error: 'Selected resident does not exist.' };
    }

    const { normalizedPlate, lastFourDigits } = normalizePlate(params.plateInput);

    if (!normalizedPlate || normalizedPlate.length < 4) {
      return { error: 'Plate must have at least 4 alphanumeric characters.' };
    }

    if (this.findVehicleByNormalizedPlate(normalizedPlate)) {
      return { error: `Vehicle with plate ${normalizedPlate} is already registered in the society.` };
    }

    // Bikes do not have parking slots; they park anywhere
    const isBike = params.vehicleType === 'BIKE';
    const parkingNumber = isBike
      ? null
      : params.parkingNumber
      ? params.parkingNumber.trim().toUpperCase()
      : null;

    const vehicle: Vehicle = {
      id: 'veh-' + crypto.randomUUID(),
      resident_id: params.residentId,
      vehicle_type: params.vehicleType,
      brand: params.brand?.trim() || null,
      model: params.model?.trim() || null,
      normalized_plate: normalizedPlate,
      last_four_digits: lastFourDigits,
      parking_number: parkingNumber,
      created_at: new Date().toISOString(),
    };

    this.state.vehicles.push(vehicle);
    this.persist();
    return { vehicle };
  }

  public adminUpdateVehicle(
    vehicleId: string,
    updates: {
      residentId?: string;
      vehicleType?: VehicleType;
      brand?: string;
      model?: string;
      plateInput?: string;
      parkingNumber?: string;
    }
  ): { vehicle?: Vehicle; error?: string } {
    const vehicle = this.findVehicleById(vehicleId);
    if (!vehicle) return { error: 'Vehicle not found.' };

    if (updates.residentId) {
      const resident = this.findResidentById(updates.residentId);
      if (!resident) return { error: 'Selected resident does not exist.' };
      vehicle.resident_id = updates.residentId;
    }

    if (updates.plateInput) {
      const { normalizedPlate, lastFourDigits } = normalizePlate(updates.plateInput);
      if (!normalizedPlate || normalizedPlate.length < 4) {
        return { error: 'Plate must have at least 4 alphanumeric characters.' };
      }
      const existing = this.findVehicleByNormalizedPlate(normalizedPlate);
      if (existing && existing.id !== vehicleId) {
        return { error: `Vehicle with plate ${normalizedPlate} is already registered.` };
      }
      vehicle.normalized_plate = normalizedPlate;
      vehicle.last_four_digits = lastFourDigits;
    }

    if (updates.vehicleType) vehicle.vehicle_type = updates.vehicleType;
    if (updates.brand !== undefined) vehicle.brand = updates.brand.trim() || null;
    if (updates.model !== undefined) vehicle.model = updates.model.trim() || null;

    // Bikes do not have parking slots; they park anywhere
    if (vehicle.vehicle_type === 'BIKE') {
      vehicle.parking_number = null;
    } else if (updates.parkingNumber !== undefined) {
      vehicle.parking_number = updates.parkingNumber
        ? updates.parkingNumber.trim().toUpperCase()
        : null;
    }

    this.persist();
    return { vehicle };
  }

  public deleteVehicle(vehicleId: string, requesterResidentId: string, isAdmin = false): boolean {
    const idx = this.state.vehicles.findIndex((v) => v.id === vehicleId);
    if (idx === -1) return false;

    const vehicle = this.state.vehicles[idx];
    if (!isAdmin && vehicle.resident_id !== requesterResidentId) {
      return false;
    }

    this.state.vehicles.splice(idx, 1);
    this.persist();
    return true;
  }

  // ==========================================
  // 4. SEARCH & AUDIT LOGS
  // ==========================================

  public searchVehicles(
    query: string,
    searchedByResidentId: string
  ): {
    matches: {
      id: string;
      source: 'resident' | 'outsider';
      vehicle_type: VehicleType;
      normalized_plate: string;
      last_four_digits: string;
      brand: string | null;
      model: string | null;
      parking_number: string | null;
      owner_name: string;
      owner_room?: string;
      owner_phone: string;
      masked_plate: string;
      plate_raw?: string;
      note?: string;
      status?: 'inside' | 'exited';
      added_at?: string;
      exited_at?: string | null;
      added_by_watchman_name?: string;
    }[];
    searchType: 'LAST_FOUR' | 'FULL_PLATE';
    normalizedQuery: string;
  } {
    const rawClean = query.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    const isFourDigits = /^\d{4}$/.test(rawClean);

    let matchingVehicles: Vehicle[] = [];
    let matchingOutsiders: OutsiderVehicle[] = [];
    let searchType: 'LAST_FOUR' | 'FULL_PLATE' = 'FULL_PLATE';

    if (isFourDigits) {
      searchType = 'LAST_FOUR';
      matchingVehicles = this.state.vehicles.filter((v) => v.last_four_digits === rawClean);
      matchingOutsiders = (this.state.outsider_vehicles || []).filter((ov) => ov.last_four_digits === rawClean);
    } else {
      searchType = 'FULL_PLATE';
      matchingVehicles = this.state.vehicles.filter((v) => {
        return (
          v.normalized_plate === rawClean ||
          (rawClean.length >= 4 && v.normalized_plate.includes(rawClean))
        );
      });
      matchingOutsiders = (this.state.outsider_vehicles || []).filter((ov) => {
        return (
          ov.plate === rawClean ||
          (rawClean.length >= 4 && ov.plate.includes(rawClean))
        );
      });
    }

    // Record search log with searched_by_resident_id
    const totalMatches = matchingVehicles.length + matchingOutsiders.length;
    const matchedId =
      totalMatches === 1
        ? matchingVehicles.length === 1
          ? matchingVehicles[0].id
          : matchingOutsiders[0].id
        : null;

    const log: SearchLog = {
      id: 'log-' + crypto.randomUUID(),
      searched_by_resident_id: searchedByResidentId,
      search_query: query.trim(),
      matched_vehicle_id: matchedId,
      created_at: new Date().toISOString(),
    };
    this.state.search_logs.unshift(log);
    if (this.state.search_logs.length > 200) {
      this.state.search_logs.pop();
    }
    this.persist();

    // Attach resident vehicle owner details
    const residentMatches = matchingVehicles.map((v) => {
      const resident = this.state.residents.find((r) => r.id === v.resident_id);
      const prefix = v.normalized_plate.slice(0, 2);
      const suffix = v.last_four_digits;
      const masked_plate = `${prefix}••••${suffix}`;

      return {
        id: v.id,
        source: 'resident' as const,
        vehicle_type: v.vehicle_type,
        normalized_plate: v.normalized_plate,
        last_four_digits: v.last_four_digits,
        brand: v.brand,
        model: v.model,
        parking_number: v.parking_number,
        owner_name: resident?.full_name || 'Society Resident',
        owner_room: resident?.room_number || 'N/A',
        owner_phone: resident?.phone || 'N/A',
        masked_plate,
      };
    });

    // Attach outsider vehicle details
    const outsiderMatches = matchingOutsiders.map((ov) => {
      const prefix = ov.plate.slice(0, 2);
      const suffix = ov.last_four_digits;
      const masked_plate = `${prefix}••••${suffix}`;

      return {
        id: ov.id,
        source: 'outsider' as const,
        vehicle_type: ov.vehicle_type,
        normalized_plate: ov.plate,
        last_four_digits: ov.last_four_digits,
        brand: null,
        model: null,
        parking_number: null,
        owner_name: ov.owner_name || 'Visitor / Guest',
        owner_room: undefined,
        owner_phone: ov.owner_phone,
        masked_plate,
        plate_raw: ov.plate_raw,
        note: ov.note,
        status: ov.status,
        added_at: ov.added_at,
        exited_at: ov.exited_at,
        added_by_watchman_name: ov.added_by_watchman_name,
      };
    });

    return {
      matches: [...residentMatches, ...outsiderMatches],
      searchType,
      normalizedQuery: rawClean,
    };
  }

  public getSearchLogs() {
    return this.state.search_logs.map((log) => {
      const resident = this.state.residents.find((r) => r.id === log.searched_by_resident_id);
      const vehicle = log.matched_vehicle_id
        ? this.state.vehicles.find((v) => v.id === log.matched_vehicle_id)
        : null;

      const isAdmin = log.searched_by_resident_id === 'ADMIN' || log.searched_by_resident_id.startsWith('admin');

      return {
        ...log,
        searcher_name: resident
          ? resident.full_name
          : isAdmin
          ? 'Society Administrator'
          : 'Resident',
        searcher_room: resident ? resident.room_number : 'Office',
        matched_plate: vehicle ? vehicle.normalized_plate : null,
      };
    });
  }
}

export const db = new SocietyDatabase();
