import { Injectable, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { timer } from 'rxjs';
import { map } from 'rxjs/operators';
import { DAYS_UNTIL_REFRESH_MS } from '../../shared/pipes/days-until.pipe';

/** Shared interval tick so the pure `daysUntil` pipe can refresh without prop drilling. */
@Injectable({
  providedIn: 'root',
})
export class DaysUntilRefreshService {
  readonly tick: Signal<number> = toSignal(
    timer(0, DAYS_UNTIL_REFRESH_MS).pipe(map(() => Date.now())),
    { initialValue: Date.now() },
  );
}
