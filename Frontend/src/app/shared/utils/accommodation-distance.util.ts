export type DistanceUnit = 'm' | 'km';

export function metersToFormDistance(meters: number): { amount: number; unit: DistanceUnit } {
  if (!Number.isFinite(meters) || meters < 0) {
    return { amount: 0, unit: 'm' };
  }
  if (meters >= 1000) {
    return { amount: meters / 1000, unit: 'km' };
  }
  return { amount: Math.round(meters), unit: 'm' };
}

export function formDistanceToMeters(amount: number, unit: DistanceUnit): number {
  if (!Number.isFinite(amount) || amount < 0) {
    return NaN;
  }
  return unit === 'km' ? Math.round(amount * 1000) : Math.round(amount);
}

export function formatDistanceToCourts(meters: number): string {
  if (!Number.isFinite(meters) || meters < 0) {
    return '—';
  }
  if (meters >= 1000) {
    const km = meters / 1000;
    const rounded = km >= 10 ? Math.round(km) : Math.round(km * 10) / 10;
    const text = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1).replace(/\.0$/, '');
    return `${text} km to courts`;
  }
  return `${Math.round(meters)} m to courts`;
}
