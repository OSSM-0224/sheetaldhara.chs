export type UserRole = 'RESIDENT' | 'ADMIN' | 'WATCHMAN';
export type VehicleType = 'BIKE' | 'CAR' | 'OTHER';

export interface User {
  id: string;
  phone: string;
  role: 'ADMIN' | 'WATCHMAN';
  full_name?: string;
  status?: 'active' | 'inactive';
}

export interface Watchman {
  id: string;
  phone: string;
  full_name: string;
  role: 'WATCHMAN';
  status: 'active' | 'inactive';
  created_at: string;
}

export interface Resident {
  id: string;
  full_name: string;
  room_number: string;
  phone: string;
  created_at: string;
  role?: 'RESIDENT';
  vehicles?: Vehicle[];
}

export interface Vehicle {
  id: string;
  resident_id: string;
  vehicle_type: VehicleType;
  brand: string | null;
  model: string | null;
  color?: string | null;
  normalized_plate: string;
  last_four_digits: string;
  parking_number: string | null;
  created_at: string;
  owner_name?: string;
  owner_room?: string;
  owner_phone?: string;
  masked_plate?: string;
}

export interface OutsiderVehicle {
  id: string;
  plate: string;              // normalized
  plate_raw: string;          // original raw input
  last_four_digits: string;
  vehicle_type: VehicleType;
  owner_phone: string;
  owner_name?: string;
  note?: string;
  added_by_watchman_id: string;
  added_by_watchman_name?: string;
  added_at: string;
  exited_at?: string | null;
  status: 'inside' | 'exited';
}

export interface SearchResultItem {
  id: string;
  source: 'resident' | 'outsider';
  vehicle_type: VehicleType;
  normalized_plate: string;
  last_four_digits: string;
  brand?: string | null;
  model?: string | null;
  color?: string | null;
  parking_number?: string | null;
  owner_name?: string;
  owner_room?: string;
  owner_phone?: string;
  masked_plate?: string;
  plate_raw?: string;
  note?: string;
  status?: 'inside' | 'exited';
  added_at?: string;
  exited_at?: string | null;
  added_by_watchman_name?: string;
}

export interface SearchResponse {
  matches: SearchResultItem[];
  searchType: 'LAST_FOUR' | 'FULL_PLATE';
  normalizedQuery: string;
}

export interface SearchLogItem {
  id: string;
  searched_by_resident_id: string;
  search_query: string;
  matched_vehicle_id: string | null;
  created_at: string;
  searcher_name?: string;
  searcher_room?: string;
  matched_plate?: string | null;
}
