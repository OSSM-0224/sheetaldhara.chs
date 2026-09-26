/**
 * Plate number normalization and parsing helpers
 */

export function normalizePlate(input: string): string {
  if (!input) return '';
  return input.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

export function extractLastFourDigits(normalizedPlate: string): string {
  if (!normalizedPlate) return '';
  const digitsOnly = normalizedPlate.replace(/[^0-9]/g, '');
  if (digitsOnly.length >= 4) {
    return digitsOnly.slice(-4);
  }
  // Fallback if less than 4 digits
  return normalizedPlate.slice(-4);
}

export function isFourDigitQuery(query: string): boolean {
  const clean = query.trim();
  return /^\d{4}$/.test(clean);
}

export function maskPlate(normalizedPlate: string): string {
  if (!normalizedPlate || normalizedPlate.length < 6) return normalizedPlate;
  const first = normalizedPlate.slice(0, 4);
  const last = normalizedPlate.slice(-4);
  return `${first}****${last}`;
}
