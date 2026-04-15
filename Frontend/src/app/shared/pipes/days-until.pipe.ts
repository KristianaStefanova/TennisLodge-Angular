import { Pipe, PipeTransform } from '@angular/core';

export const DAYS_UNTIL_REFRESH_MS = 60 * 60 * 1000;

@Pipe({
  name: 'daysUntil',
  standalone: true,
})
export class DaysUntilPipe implements PipeTransform {
  transform(
    start: Date | string | number | null | undefined,
    refreshTick: number,
  ): string {
    if (start == null || start === '') {
      return '—';
    }

    const startDate = start instanceof Date ? new Date(start.getTime()) : new Date(start);
    if (Number.isNaN(startDate.getTime())) {
      return '—';
    }

    const now = new Date(refreshTick);

    if (startDate.getTime() <= now.getTime()) {
      return 'Started';
    }

    const days = calendarDaysDifferenceUtc(now, startDate);

    if (days === 0) {
      return 'Starts today';
    }
    if (days === 1) {
      return '1 day';
    }
    return `${days} days`;
  }
}

function calendarDaysDifferenceUtc(from: Date, to: Date): number {
  const a = Date.UTC(from.getFullYear(), from.getMonth(), from.getDate());
  const b = Date.UTC(to.getFullYear(), to.getMonth(), to.getDate());
  return Math.round((b - a) / 86400000);
}
