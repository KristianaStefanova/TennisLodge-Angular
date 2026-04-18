import { afterNextRender, Component, ElementRef, inject, Injector, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { finalize } from 'rxjs/operators';
import { AccommodationsApi } from '../../../../core/services/accommodations.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { TournamentsApi } from '../../../../core/services/tournaments.service';
import {
  PUBLIC_TRANSPORT_OPTIONS,
  PUBLIC_TRANSPORT_TYPE_IDS,
  type PublicTransportType,
} from '../../../../shared/constants/accommodation-public-transport.constants';
import { InputErrorDirective } from '../../../../shared/directives/input-error.directive';
import { validationKeys } from '../../../../shared/validators/validation-keys';
import { Accommodation } from '../../../../shared/interfaces/accommodation.interface';
import { Tournament } from '../../../../shared/interfaces/tournament.interface';
import { loadAccommodations } from '../../../../store/accommodations/accommodation.actions';
import {
  ACCOMMODATION_FORM_FIELD_ORDER,
  buildCreateAccommodationPayload,
  createAccommodationFormFromAccommodation,
} from '../accommodation-new/accommodation-new-form';

@Component({
  selector: 'app-accommodation-edit-page',
  imports: [ReactiveFormsModule, RouterLink, InputErrorDirective],
  templateUrl: './accommodation-edit.page.html',
  styleUrl: '../accommodation-new/accommodation-new.page.css',
})
export class AccommodationEditPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(AccommodationsApi);
  private readonly notificationService = inject(NotificationService);
  private readonly tournamentsApi = inject(TournamentsApi);
  private readonly store = inject(Store);
  private readonly injector = inject(Injector);

  private readonly pageHeading = viewChild<ElementRef<HTMLElement>>('pageHeading');
  private readonly saveErrorAlert = viewChild<ElementRef<HTMLElement>>('saveErrorAlert');

  private readonly accommodation = this.route.snapshot.data['accommodation'] as Accommodation;

  readonly tournaments = signal<Tournament[]>([]);
  readonly submitting = signal(false);
  readonly error = signal<string | null>(null);

  readonly form = createAccommodationFormFromAccommodation(this.accommodation);
  readonly transportOptions = PUBLIC_TRANSPORT_OPTIONS;
  readonly validationKeys = validationKeys;

  constructor() {
    this.tournamentsApi.getAll().subscribe({
      next: (rows) => this.tournaments.set(rows),
      error: () => this.tournaments.set([]),
    });

    this.form.controls.hasPublicTransportNearby.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((nearby) => {
        if (!nearby) {
          this.form.controls.publicTransportTypes.setValue([]);
        }
        this.form.controls.publicTransportTypes.updateValueAndValidity({ emitEvent: false });
        this.form.updateValueAndValidity();
      });

    this.form.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => this.error.set(null));
  }

  isTransportSelected(id: PublicTransportType): boolean {
    return (this.form.controls.publicTransportTypes.value ?? []).includes(id);
  }

  onTransportToggle(id: PublicTransportType, checked: boolean): void {
    const ctrl = this.form.controls.publicTransportTypes;
    const set = new Set(ctrl.value ?? []);
    if (checked) {
      set.add(id);
    } else {
      set.delete(id);
    }
    const ordered = [...set].sort(
      (a, b) => PUBLIC_TRANSPORT_TYPE_IDS.indexOf(a) - PUBLIC_TRANSPORT_TYPE_IDS.indexOf(b),
    );
    ctrl.setValue(ordered);
    ctrl.markAsTouched();
    this.form.updateValueAndValidity();
  }

  submit(): void {
    this.error.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.scrollToFirstInvalidField();
      return;
    }

    const payload = buildCreateAccommodationPayload(this.form.getRawValue());

    this.submitting.set(true);
    this.api
      .update(this.accommodation._id, payload)
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: async () => {
          this.notificationService.showSuccess('Accommodation updated.');
          this.store.dispatch(loadAccommodations());
          await this.router.navigate(['/accommodations/mine']);
        },
        error: (e: unknown) => {
          const msg = e instanceof Error ? e.message : 'Could not save changes.';
          this.error.set(msg);
          this.notificationService.showError(msg);
          this.scrollSaveErrorIntoView();
        },
      });
  }

  private scrollToFirstInvalidField(): void {
    afterNextRender(
      () => {
        const prefix = 'acc-edit-input-';
        for (const key of ACCOMMODATION_FORM_FIELD_ORDER) {
          if (key === 'hasPublicTransportNearby') {
            continue;
          }
          if (key === 'publicTransportTypes') {
            if (this.form.touched && this.form.hasError(this.validationKeys.transportTypesRequired)) {
              const el = document.getElementById('acc-edit-fieldset-public-transport-types');
              el?.focus({ preventScroll: true });
              el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
              return;
            }
            continue;
          }
          const ctrl = this.form.controls[key];
          if (ctrl?.invalid) {
            const el = document.getElementById(`${prefix}${String(key)}`);
            el?.focus({ preventScroll: true });
            el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
          }
        }
        if (this.form.touched && this.form.hasError(this.validationKeys.invalidDistance)) {
          const el = document.getElementById('acc-edit-input-distanceAmount');
          el?.focus({ preventScroll: true });
          el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          return;
        }
        if (this.form.touched && this.form.hasError(this.validationKeys.invalidDateRange)) {
          const el = document.getElementById('acc-edit-input-checkOutAt');
          el?.focus({ preventScroll: true });
          el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      },
      { injector: this.injector },
    );
  }

  private scrollSaveErrorIntoView(): void {
    afterNextRender(
      () => {
        const el = this.saveErrorAlert()?.nativeElement;
        const title = this.pageHeading()?.nativeElement;
        (title ?? el)?.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
        el?.focus({ preventScroll: true });
      },
      { injector: this.injector },
    );
  }
}
