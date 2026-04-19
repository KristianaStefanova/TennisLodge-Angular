import { computed, DestroyRef, effect, inject, Injectable, signal, untracked } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { EMPTY, Subject } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AccommodationRequestsApi } from './accommodation-requests.service';
import { AuthService } from './auth.service';
import { NotificationService } from './notification.service';
import { StayRequestCountsDto } from '../../shared/interfaces/accommodation-request.interface';

/**
 * Stay-request totals for navigation: pending as guest/host, plus guest “new response”
 * indicators. Backed by GET /api/accommodation-requests/counts.
 *
 * Refresh uses {@link switchMap} so overlapping calls cancel in-flight requests and only
 * the latest result updates the UI (avoids stale counts under rapid refresh).
 */
@Injectable({ providedIn: 'root' })
export class StayRequestCountsService {
  private readonly api = inject(AccommodationRequestsApi);
  private readonly auth = inject(AuthService);
  private readonly notification = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  private readonly refresh$ = new Subject<void>();

  private readonly _pendingSent = signal(0);
  private readonly _pendingReceived = signal(0);
  private readonly _unreadGuestOutcomes = signal(0);

  /** Snapshot to detect increases in unread host decisions (toast once per increase). */
  private lastUnreadGuestOutcomesSnapshot = 0;

  readonly pendingSent = this._pendingSent.asReadonly();
  readonly pendingReceived = this._pendingReceived.asReadonly();
  readonly unreadGuestOutcomes = this._unreadGuestOutcomes.asReadonly();

  /** Badge on “Requests I sent”: awaiting host + new responses you have not cleared. */
  readonly sentMenuAttention = computed(
    () => this._pendingSent() + this._unreadGuestOutcomes(),
  );

  /** Total items worth surfacing on the account menu trigger. */
  readonly totalPending = computed(
    () => this._pendingSent() + this._pendingReceived() + this._unreadGuestOutcomes(),
  );

  private readonly userId = computed(() => this.auth.user()?._id ?? null);

  constructor() {
    this.refresh$
      .pipe(
        switchMap(() =>
          this.api.getCounts().pipe(
            catchError(() => EMPTY),
          ),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((c) => this.applyCountsFromResponse(c));

    effect(() => {
      const id = this.userId();
      if (!id) {
        untracked(() => this.reset());
        return;
      }
      untracked(() => this.refresh());
    });
  }

  /** Refresh totals (menu open, mutations, or after guest inbox sync). */
  refresh(): void {
    if (!this.userId()) {
      this.reset();
      return;
    }
    this.refresh$.next();
  }

  private applyCountsFromResponse(c: StayRequestCountsDto): void {
    this._pendingSent.set(c.pendingSent);
    this._pendingReceived.set(c.pendingReceived);
    this._unreadGuestOutcomes.set(c.unreadGuestOutcomes);

    const increased = c.unreadGuestOutcomes > this.lastUnreadGuestOutcomesSnapshot;
    this.lastUnreadGuestOutcomesSnapshot = c.unreadGuestOutcomes;

    if (increased) {
      this.maybeNotifyGuestOutcomes(c.unreadGuestOutcomes);
    }
  }

  /**
   * Toast when new host responses arrive, but not while the user is already on
   * “Requests I sent” (they see the list; badge is enough).
   */
  private maybeNotifyGuestOutcomes(count: number): void {
    if (count <= 0) {
      return;
    }
    const url = this.router.url;
    if (url.includes('/accommodations/sent')) {
      return;
    }
    this.notification.showInfo(
      'You have new updates on stay requests you sent. Open Requests I sent for details.',
    );
  }

  formatBadge(count: number): string {
    if (count <= 0) {
      return '';
    }
    return count > 99 ? '99+' : String(count);
  }

  private reset(): void {
    this._pendingSent.set(0);
    this._pendingReceived.set(0);
    this._unreadGuestOutcomes.set(0);
    this.lastUnreadGuestOutcomesSnapshot = 0;
  }
}
