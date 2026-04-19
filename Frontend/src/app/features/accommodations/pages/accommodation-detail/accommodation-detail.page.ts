import { DatePipe } from '@angular/common';
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { combineLatest } from 'rxjs';
import { filter, map, switchMap } from 'rxjs/operators';
import { HostStayDecisionDialogComponent } from '../../components/host-stay-decision-dialog/host-stay-decision-dialog.component';
import { AccommodationRequestsApi } from '../../../../core/services/accommodation-requests.service';
import { AuthService } from '../../../../core/services/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { StayRequestCountsService } from '../../../../core/services/stay-request-counts.service';
import { formatPublicTransportLine } from '../../../../shared/constants/accommodation-public-transport.constants';
import { Accommodation } from '../../../../shared/interfaces/accommodation.interface';
import { formatDistanceToCourts } from '../../../../shared/utils/accommodation-distance.util';
import { AccommodationRequest } from '../../../../shared/interfaces/accommodation-request.interface';
import { loadAccommodations } from '../../../../store/accommodations/accommodation.actions';
import {
  selectAccommodationById,
  selectAccommodationsLoading,
  selectAllAccommodations,
} from '../../../../store/accommodations/accommodation.selectors';

@Component({
  selector: 'app-accommodation-detail-page',
  imports: [DatePipe, RouterLink, ReactiveFormsModule, HostStayDecisionDialogComponent],
  templateUrl: './accommodation-detail.page.html',
  styleUrl: './accommodation-detail.page.css',
})
export class AccommodationDetailPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly store = inject(Store);
  private readonly auth = inject(AuthService);
  private readonly requestsApi = inject(AccommodationRequestsApi);
  private readonly notification = inject(NotificationService);
  private readonly stayCounts = inject(StayRequestCountsService);
  private readonly destroyRef = inject(DestroyRef);
  private hasRedirectedForMissing = false;

  readonly loading = toSignal(this.store.select(selectAccommodationsLoading), { initialValue: true });

  readonly accommodation = toSignal(
    this.route.paramMap.pipe(
      map((params) => params.get('id')),
      filter((id): id is string => Boolean(id)),
      switchMap((id) => this.store.select(selectAccommodationById(id))),
    ),
    { initialValue: undefined },
  );

  readonly isOwner = computed(() => {
    const a = this.accommodation();
    const u = this.auth.user();
    if (!a || !u) {
      return false;
    }
    return a.ownerId === u._id;
  });

  readonly hostRequests = signal<AccommodationRequest[]>([]);
  readonly guestRequest = signal<AccommodationRequest | null>(null);
  readonly requestBusy = signal(false);

  readonly decisionOpen = signal(false);
  readonly decisionMode = signal<'accept' | 'reject'>('accept');
  readonly decisionRow = signal<AccommodationRequest | null>(null);
  readonly decisionGuestLabel = signal('');

  readonly requestForm = new FormGroup({
    numberOfGuests: new FormControl(1, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(1)],
    }),
  });

  readonly distanceLabel = formatDistanceToCourts;
  readonly publicTransportLine = formatPublicTransportLine;

  ngOnInit(): void {
    this.store.dispatch(loadAccommodations());

    combineLatest([
      this.route.paramMap.pipe(
        map((params) => params.get('id')),
        filter((id): id is string => Boolean(id)),
      ),
      this.store.select(selectAllAccommodations),
      this.store.select(selectAccommodationsLoading),
    ])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(async ([id, accommodations, loading]) => {
        if (loading || this.hasRedirectedForMissing) {
          return;
        }
        const exists = accommodations.some((a) => a._id === id);
        if (!exists) {
          this.hasRedirectedForMissing = true;
          this.notification.showError('Accommodation not found or no longer available.');
          await this.router.navigate(['/accommodations']);
        }
      });

    combineLatest([
      this.route.paramMap.pipe(
        map((params) => params.get('id')),
        filter((id): id is string => Boolean(id)),
      ),
      this.store.select(selectAllAccommodations),
      this.store.select(selectAccommodationsLoading),
    ])
      .pipe(
        filter(([, , loading]) => !loading),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(([id, accommodations]) => {
        const a = accommodations.find((x) => x._id === id);
        if (a) {
          this.loadRequestsForAccommodation(a);
        }
      });
  }

  private loadRequestsForAccommodation(a: Accommodation): void {
    const uid = this.auth.user()?._id;
    if (!uid) {
      return;
    }
    if (a.ownerId === uid) {
      this.requestsApi.listForHost(a._id).subscribe({
        next: (rows) => this.hostRequests.set(rows),
        error: () => this.hostRequests.set([]),
      });
      this.guestRequest.set(null);
      return;
    }
    this.hostRequests.set([]);
    this.requestForm.controls.numberOfGuests.setValidators([
      Validators.required,
      Validators.min(1),
      Validators.max(a.maxGuests),
    ]);
    this.requestForm.controls.numberOfGuests.updateValueAndValidity();
    this.requestsApi.listMine().subscribe({
      next: (rows) => {
        const relevant = rows
          .filter((r) => r.accommodationId === a._id)
          .sort((x, y) => y.createdAt.getTime() - x.createdAt.getTime());
        this.guestRequest.set(relevant[0] ?? null);
      },
      error: () => this.guestRequest.set(null),
    });
  }

  submitRequest(accommodationId: string, maxGuests: number): void {
    const n = this.requestForm.controls.numberOfGuests.value;
    if (this.requestForm.invalid || n < 1 || n > maxGuests) {
      this.requestForm.markAllAsTouched();
      return;
    }
    this.requestBusy.set(true);
    this.requestsApi.create({ accommodationId, numberOfGuests: n }).subscribe({
      next: (created) => {
        this.requestBusy.set(false);
        this.guestRequest.set(created);
        this.stayCounts.refresh();
        this.notification.showSuccess('Request sent.');
      },
      error: (e: unknown) => {
        this.requestBusy.set(false);
        const msg = e instanceof Error ? e.message : 'Could not send request.';
        this.notification.showError(msg);
      },
    });
  }

  openHostDecision(row: AccommodationRequest, mode: 'accept' | 'reject'): void {
    this.decisionRow.set(row);
    this.decisionGuestLabel.set(this.requesterLabel(row));
    this.decisionMode.set(mode);
    this.decisionOpen.set(true);
  }

  onHostDecisionConfirm(ev: { message: string }): void {
    const row = this.decisionRow();
    if (!row) {
      return;
    }
    const status = this.decisionMode() === 'accept' ? 'accepted' : 'rejected';
    this.setRequestStatus(row, status, ev.message);
  }

  onHostDecisionCancel(): void {
    if (this.requestBusy()) {
      return;
    }
    this.decisionOpen.set(false);
    this.decisionRow.set(null);
  }

  setRequestStatus(
    row: AccommodationRequest,
    status: 'accepted' | 'rejected',
    hostMessage: string,
  ): void {
    this.requestBusy.set(true);
    this.requestsApi.updateStatus(row._id, status, { hostMessage }).subscribe({
      next: (updated) => {
        this.requestBusy.set(false);
        this.decisionOpen.set(false);
        this.decisionRow.set(null);
        this.hostRequests.update((rows) =>
          rows.map((r) =>
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

  cancelMyRequest(requestId: string): void {
    this.requestBusy.set(true);
    this.requestsApi.updateStatus(requestId, 'cancelled').subscribe({
      next: () => {
        this.requestBusy.set(false);
        this.guestRequest.set(null);
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

  requesterLabel(req: AccommodationRequest): string {
    const r = req.requesterId;
    if (typeof r === 'string') {
      return r;
    }
    const parts = [r.firstName, r.lastName].filter(Boolean).join(' ').trim();
    return parts || r.username;
  }
}
