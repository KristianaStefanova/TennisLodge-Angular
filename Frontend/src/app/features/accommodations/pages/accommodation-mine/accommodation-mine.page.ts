import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { finalize } from 'rxjs/operators';
import { AccommodationsApi } from '../../../../core/services/accommodations.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { Accommodation } from '../../../../shared/interfaces/accommodation.interface';
import { loadAccommodations } from '../../../../store/accommodations/accommodation.actions';
import { ConfirmActionDialogComponent } from '../../components/confirm-action-dialog/confirm-action-dialog.component';

@Component({
  selector: 'app-accommodation-mine-page',
  imports: [DatePipe, RouterLink, ConfirmActionDialogComponent],
  templateUrl: './accommodation-mine.page.html',
  styleUrl: './accommodation-mine.page.css',
})
export class AccommodationMinePage implements OnInit {
  private readonly api = inject(AccommodationsApi);
  private readonly notification = inject(NotificationService);
  private readonly store = inject(Store);

  readonly rows = signal<Accommodation[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly actionId = signal<string | null>(null);
  readonly pendingDelete = signal<Accommodation | null>(null);

  deleteDialogDescription(): string {
    const row = this.pendingDelete();
    if (!row) {
      return '';
    }
    return `Are you sure you want to remove this listing: "${row.address}"?`;
  }

  ngOnInit(): void {
    this.reload();
  }

  reload(): void {
    this.loading.set(true);
    this.error.set(null);
    this.api
      .getMine()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (list) => this.rows.set(list),
        error: (e: unknown) => {
          const msg = e instanceof Error ? e.message : 'Could not load your stays.';
          this.error.set(msg);
        },
      });
  }

  confirmDelete(a: Accommodation): void {
    if (this.actionId()) {
      return;
    }
    this.pendingDelete.set(a);
  }

  cancelDelete(): void {
    if (this.actionId()) {
      return;
    }
    this.pendingDelete.set(null);
  }

  deletePendingAccommodation(): void {
    const a = this.pendingDelete();
    if (!a) {
      return;
    }
    this.actionId.set(a._id);
    this.api
      .delete(a._id)
      .pipe(finalize(() => this.actionId.set(null)))
      .subscribe({
        next: () => {
          this.rows.update((list) => list.filter((x) => x._id !== a._id));
          this.pendingDelete.set(null);
          this.store.dispatch(loadAccommodations());
          this.notification.showSuccess('Accommodation removed.');
        },
        error: (e: unknown) => {
          this.pendingDelete.set(null);
          const msg = e instanceof Error ? e.message : 'Could not delete.';
          this.notification.showError(msg);
        },
      });
  }
}
