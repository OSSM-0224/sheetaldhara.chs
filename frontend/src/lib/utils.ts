import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPlate(plate: string): string {
  if (!plate) return '';
  const clean = plate.toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (clean.length >= 8 && clean.length <= 11) {
    // Format typical Indian plate e.g. MH 02 AB 4821
    const state = clean.slice(0, 2);
    const rto = clean.slice(2, 4);
    const series = clean.slice(4, clean.length - 4);
    const number = clean.slice(-4);
    return `${state} ${rto} ${series} ${number}`.trim();
  }
  return clean;
}
