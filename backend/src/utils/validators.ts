/**
 * Input validation helpers
 */

export function isValidPhoneNumber(phone: string): boolean {
  if (!phone) return false;
  const digits = phone.replace(/[^0-9]/g, '');
  return digits.length === 10;
}

export function isValidPlateNumber(plate: string): boolean {
  if (!plate) return false;
  const cleaned = plate.replace(/[^A-Za-z0-9]/g, '');
  return cleaned.length >= 4 && cleaned.length <= 14;
}

export function isValidRoomNumber(room: string): boolean {
  if (!room) return false;
  return room.trim().length >= 2 && room.trim().length <= 10;
}
