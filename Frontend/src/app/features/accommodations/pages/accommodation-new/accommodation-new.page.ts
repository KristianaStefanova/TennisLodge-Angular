import { afterNextRender, Component, ElementRef, inject, Injector, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NotificationService } from '../../../../core/services/notification.service';
import { TournamentsApi } from '../../../../core/services/tournaments.service';
import {
  PUBLIC_TRANSPORT_OPTIONS,
  PUBLIC_TRANSPORT_TYPE_IDS,
  type PublicTransportType,
} from '../../../../shared/constants/accommodation-public-transport.constants';
import { InputErrorDirective } from '../../../../shared/directives/input-error.directive';
import { validationKeys } from '../../../../shared/validators/validation-keys';
import * as AccommodationActions from '../../../../store/accommodations/accommodation.actions';
import { Tournament } from '../../../../shared/interfaces/tournament.interface';
import {
  ACCOMMODATION_FORM_FIELD_ORDER,
  buildCreateAccommodationPayload,
  createAccommodationNewForm,
} from './accommodation-new-form';

@Component({
  selector: 'app-accommodation-new-page',
  imports: [ReactiveFormsModule, RouterLink, InputErrorDirective],
  templateUrl: './accommodation-new.page.html',
  styleUrl: './accommodation-new.page.css',
})
export class AccommodationNewPage {
  private readonly store = inject(Store);
  private readonly actions$ = inject(Actions);
  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly tournamentsApi = inject(TournamentsApi);
  private readonly injector = inject(Injector);

  private readonly pageHeading = viewChild<ElementRef<HTMLElement>>('pageHeading');
  private readonly createErrorAlert = viewChild<ElementRef<HTMLElement>>('createErrorAlert');

  readonly submitting = signal(false);
  readonly error = signal<string | null>(null);
  readonly tournaments = signal<Tournament[]>([]);

  readonly form = createAccommodationNewForm();
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

    this.actions$
      .pipe(ofType(AccommodationActions.addAccommodationSuccess), takeUntilDestroyed())
      .subscribe(async () => {
        this.submitting.set(false);
        this.notificationService.showSuccess('Accommodation created successfully.');
        this.store.dispatch(AccommodationActions.clearAccommodationFeedback());
        await this.router.navigate(['/accommodations']);
      });

    this.actions$
      .pipe(ofType(AccommodationActions.addAccommodationFailure), takeUntilDestroyed())
      .subscribe(({ error: msg }) => {
        this.submitting.set(false);
        const errorMessage = msg || 'Could not create accommodation. Make sure you are logged in.';
        this.error.set(errorMessage);
        this.notificationService.showError(errorMessage);
        this.scrollCreateErrorIntoView();
      });
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
    this.store.dispatch(AccommodationActions.clearAccommodationFeedback());
    this.store.dispatch(AccommodationActions.addAccommodation({ payload }));
  }

  private scrollToFirstInvalidField(): void {
    afterNextRender(
      () => {
        const prefix = 'acc-input-';
        for (const key of ACCOMMODATION_FORM_FIELD_ORDER) {
          if (key === 'hasPublicTransportNearby') {
            continue;
          }
          if (key === 'publicTransportTypes') {
            if (this.form.touched && this.form.hasError(this.validationKeys.transportTypesRequired)) {
              const el = document.getElementById('acc-fieldset-public-transport-types');
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
          const el = document.getElementById('acc-input-distanceAmount');
          el?.focus({ preventScroll: true });
          el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          return;
        }
        if (this.form.touched && this.form.hasError(this.validationKeys.invalidDateRange)) {
          const el = document.getElementById('acc-input-checkOutAt');
          el?.focus({ preventScroll: true });
          el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      },
      { injector: this.injector },
    );
  }

  private scrollCreateErrorIntoView(): void {
    afterNextRender(
      () => {
        const el = this.createErrorAlert()?.nativeElement;
        const title = this.pageHeading()?.nativeElement;
        (title ?? el)?.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
        el?.focus({ preventScroll: true });
      },
      { injector: this.injector },
    );
  }
}
