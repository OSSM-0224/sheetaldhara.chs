/**
 * Normalizes vehicle number plate according to specification:
 * - Uppercase
 * - Strip spaces, hyphens, special characters
 * - e.g. "MH-46 bk4821" / "mh46bk4821" -> "MH46BK4821"
 * - Last 4 chars -> last_four_digits
 */
export function normalizePlate(input: string): { normalizedPlate: string; lastFourDigits: string } {
  if (!input) {
    return { normalizedPlate: '', lastFourDigits: '' };
  }

  const normalizedPlate = input.toUpperCase().replace(/[^A-Z0-9]/g, '');
  const lastFourDigits = normalizedPlate.length >= 4 ? normalizedPlate.slice(-4) : normalizedPlate;

  return { normalizedPlate, lastFourDigits };
}

/**
 * Mask license plate for multi-match list display:
 * Shows first 2 chars and last 4 digits (e.g. MH••••4821 or ••••4821)
 */
export function maskPlate(plate: string): string {
  if (!plate || plate.length <= 4) return plate;
  if (plate.length <= 6) {
    return `•••${plate.slice(-4)}`;
  }
  const prefix = plate.slice(0, 2);
  const suffix = plate.slice(-4);
  const hiddenCount = Math.max(plate.length - 6, 2);
  return `${prefix}${'•'.repeat(hiddenCount)}${suffix}`;
}
