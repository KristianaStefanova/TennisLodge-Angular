import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { finalize } from 'rxjs/operators';
import { AccommodationsApi } from '../../../../core/services/accommodations.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { Accommodation } from '../../../../shared/interfaces/accommodation.interface';
import { loadAccommodations } from '../../../../store/accommodations/accommodation.actions';

@Component({
  selector: 'app-accommodation-mine-page',
  imports: [DatePipe, RouterLink],
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
    const ok = globalThis.confirm(
      `Remove this listing?\n\n${a.address}\n\nIt will no longer appear in the catalog. Requests are not deleted automatically.`,
    );
    if (!ok) {
      return;
    }
    this.actionId.set(a._id);
    this.api
      .delete(a._id)
      .pipe(finalize(() => this.actionId.set(null)))
      .subscribe({
        next: () => {
          this.rows.update((list) => list.filter((x) => x._id !== a._id));
          this.store.dispatch(loadAccommodations());
          this.notification.showSuccess('Accommodation removed.');
        },
        error: (e: unknown) => {
          const msg = e instanceof Error ? e.message : 'Could not delete.';
          this.notification.showError(msg);
        },
      });
  }
}
