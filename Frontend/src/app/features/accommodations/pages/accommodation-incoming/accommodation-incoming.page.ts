import { DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { HostStayDecisionDialogComponent } from '../../components/host-stay-decision-dialog/host-stay-decision-dialog.component';
import { AccommodationRequestsApi } from '../../../../core/services/accommodation-requests.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { StayRequestCountsService } from '../../../../core/services/stay-request-counts.service';
import { StayRequestWithListing } from '../../../../shared/interfaces/accommodation-request.interface';

@Component({
  selector: 'app-accommodation-incoming-page',
  imports: [DatePipe, RouterLink, HostStayDecisionDialogComponent],
  templateUrl: './accommodation-incoming.page.html',
  styleUrl: './accommodation-incoming.page.css',
})
export class AccommodationIncomingPage implements OnInit {
  private readonly requestsApi = inject(AccommodationRequestsApi);
  private readonly notification = inject(NotificationService);
  private readonly stayCounts = inject(StayRequestCountsService);

  readonly rows = signal<StayRequestWithListing[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly requestBusy = signal(false);
  readonly filter = signal<'pending' | 'all'>('pending');

  readonly decisionOpen = signal(false);
  readonly decisionMode = signal<'accept' | 'reject'>('accept');
  readonly decisionRow = signal<StayRequestWithListing | null>(null);
  readonly decisionGuestLabel = signal('');

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
      .listIncomingForHost()
      .pipe(
        finalize(() => {
          this.loading.set(false);
          this.stayCounts.refresh();
        }),
      )
      .subscribe({
        next: (list) => this.rows.set(list),
        error: (e: unknown) => {
          const msg = e instanceof Error ? e.message : 'Could not load stay requests.';
          this.error.set(msg);
        },
      });
  }

  openDecision(row: StayRequestWithListing, mode: 'accept' | 'reject'): void {
    this.decisionRow.set(row);
    this.decisionGuestLabel.set(this.requesterLabel(row));
    this.decisionMode.set(mode);
    this.decisionOpen.set(true);
  }

  onDecisionConfirm(ev: { message: string }): void {
    const row = this.decisionRow();
    if (!row) {
      return;
    }
    const status = this.decisionMode() === 'accept' ? 'accepted' : 'rejected';
    this.setRequestStatus(row, status, ev.message);
  }

  onDecisionCancel(): void {
    if (this.requestBusy()) {
      return;
    }
    this.decisionOpen.set(false);
    this.decisionRow.set(null);
  }

  setRequestStatus(
    row: StayRequestWithListing,
    status: 'accepted' | 'rejected',
    hostMessage: string,
  ): void {
    this.requestBusy.set(true);
    this.requestsApi.updateStatus(row._id, status, { hostMessage }).subscribe({
      next: (updated) => {
        this.requestBusy.set(false);
        this.decisionOpen.set(false);
        this.decisionRow.set(null);
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
        this.notification.showSuccess(
          status === 'accepted' ? 'Request accepted.' : 'Request rejected.',
        );
      },
      error: (e: unknown) => {
        this.requestBusy.set(false);
        const msg = e instanceof Error ? e.message : 'Could not update request.';
        this.notification.showError(msg);
      },
    });
  }

  requesterLabel(req: StayRequestWithListing): string {
    const r = req.requesterId;
    if (typeof r === 'string') {
      return r;
    }
    const parts = [r.firstName, r.lastName].filter(Boolean).join(' ').trim();
    return parts || r.username;
  }

  setFilter(value: 'pending' | 'all'): void {
    this.filter.set(value);
  }
}
