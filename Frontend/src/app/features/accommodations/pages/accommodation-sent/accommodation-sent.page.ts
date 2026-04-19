import { DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { AccommodationRequestsApi } from '../../../../core/services/accommodation-requests.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { StayRequestCountsService } from '../../../../core/services/stay-request-counts.service';
import { GuestOutgoingStayRequest } from '../../../../shared/interfaces/accommodation-request.interface';

@Component({
  selector: 'app-accommodation-sent-page',
  imports: [DatePipe, RouterLink],
  templateUrl: './accommodation-sent.page.html',
  styleUrl: './accommodation-sent.page.css',
})
export class AccommodationSentPage implements OnInit {
  private readonly requestsApi = inject(AccommodationRequestsApi);
  private readonly notification = inject(NotificationService);
  private readonly stayCounts = inject(StayRequestCountsService);

  readonly rows = signal<GuestOutgoingStayRequest[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly requestBusy = signal(false);
  readonly filter = signal<'pending' | 'all'>('pending');

  readonly filteredRows = computed(() => {
    const list = this.rows();
    if (this.filter() === 'all') {
      return list;
    }
    return list.filter((r) => r.status === 'pending');
  });

  readonly pendingCount = computed(() => this.rows().filter((r) => r.status === 'pending').length);

  ngOnInit(): void {
    this.reload();
  }

  reload(): void {
    this.loading.set(true);
    this.error.set(null);
    this.requestsApi
      .listSentByMe()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (list) => {
          this.rows.set(list);
          this.requestsApi.markGuestOutcomesRead().subscribe({
            next: () => {
              this.rows.update((rows) =>
                rows.map((r) => ({ ...r, guestOutcomeUnread: false })),
              );
              this.stayCounts.refresh();
            },
            error: () => this.stayCounts.refresh(),
          });
        },
        error: (e: unknown) => {
          const msg = e instanceof Error ? e.message : 'Could not load your requests.';
          this.error.set(msg);
        },
      });
  }

  cancelRequest(row: GuestOutgoingStayRequest): void {
    this.requestBusy.set(true);
    this.requestsApi.updateStatus(row._id, 'cancelled').subscribe({
      next: (updated) => {
        this.requestBusy.set(false);
        this.rows.update((list) =>
          list.map((r) =>
            r._id === updated._id
              ? {
                  ...r,
                  status: updated.status,
                  updatedAt: updated.updatedAt,
                  hostMessage: updated.hostMessage,
                  guestOutcomeUnread: updated.guestOutcomeUnread,
                }
              : r,
          ),
        );
        this.stayCounts.refresh();
        this.notification.showSuccess('Request cancelled.');
      },
      error: (e: unknown) => {
        this.requestBusy.set(false);
        const msg = e instanceof Error ? e.message : 'Could not cancel request.';
        this.notification.showError(msg);
      },
    });
  }

  listingLink(row: GuestOutgoingStayRequest): string[] | null {
    const id = row.accommodationId?.trim();
    if (!id || row.accommodation.isDeleted) {
      return null;
    }
    return ['/accommodations', id];
  }

  setFilter(value: 'pending' | 'all'): void {
    this.filter.set(value);
  }
}
