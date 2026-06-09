import { INDIAN_STATES } from './constants.js';

export function getFriendlyErrorMessage(error: any): string {
  const msg = error?.message || '';
  if (msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED') || msg.includes('quota')) {
    return 'OpenRouter/Gemini API quota exceeded. Please wait a few minutes and try again.';
  }
  return msg || 'Failed to process image.';
}

export function extractStateFromAddress(address: string): string | null {
  const clean = address.toLowerCase();
  for (const state of INDIAN_STATES) {
    if (clean.includes(state.toLowerCase())) return state;
  }
  return null;
}

export function getEstimatedFuelEconomy(vehicle: string, fuelType: string): number {
  const v = vehicle.toLowerCase();
  if (v.includes('bike') || v.includes('motorcycle')) {
    return 50;
  }
  if (v.includes('auto') || v.includes('rickshaw')) {
    return 25;
  }
  if (v.includes('suv')) {
    return fuelType === 'diesel' ? 12 : 10;
  }
  if (v.includes('sedan')) {
    return fuelType === 'diesel' ? 16 : 14;
  }
  return fuelType === 'diesel' ? 20 : 18;
}
