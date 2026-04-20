export type TournamentCountdownTone = 'live' | 'urgent' | 'soon' | 'normal';

export interface TournamentCountdownMeta {
  label: string;
  tone: TournamentCountdownTone;
  isStarted: boolean;
}

export function getTournamentCountdownMeta(
  start: Date | string | number | null | undefined,
  nowMs: number = Date.now(),
): TournamentCountdownMeta {
  if (start == null || start === '') {
    return { label: 'Date pending', tone: 'normal', isStarted: false };
  }

  const startDate = start instanceof Date ? new Date(start.getTime()) : new Date(start);
  if (Number.isNaN(startDate.getTime())) {
    return { label: 'Date pending', tone: 'normal', isStarted: false };
  }

  const now = new Date(nowMs);
  if (startDate.getTime() <= now.getTime()) {
    return { label: 'Started', tone: 'live', isStarted: true };
  }

  const days = calendarDaysDifferenceUtc(now, startDate);
  if (days === 0) {
    return { label: 'Starts today', tone: 'urgent', isStarted: false };
  }
  if (days === 1) {
    return { label: '1 day left', tone: 'urgent', isStarted: false };
  }
  if (days <= 7) {
    return { label: `${days} days left`, tone: 'soon', isStarted: false };
  }

  return { label: `${days} days left`, tone: 'normal', isStarted: false };
}

function calendarDaysDifferenceUtc(from: Date, to: Date): number {
  const a = Date.UTC(from.getFullYear(), from.getMonth(), from.getDate());
  const b = Date.UTC(to.getFullYear(), to.getMonth(), to.getDate());
  return Math.round((b - a) / 86400000);
}
