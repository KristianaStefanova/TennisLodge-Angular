import { afterNextRender, Component, ElementRef, inject, Injector, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { NotificationService } from '../../../../core/services/notification.service';
import { TournamentsApi } from '../../../../core/services/tournaments.service';
import { InputErrorDirective } from '../../../../shared/directives/input-error.directive';
import { CreateTournamentData } from '../../../../shared/interfaces/tournament';
import { TOURNAMENT_SURFACE_OPTIONS } from '../../../../shared/constants/tournament-surfaces';
import { validationKeys } from '../../../../shared/validators/validation-keys';
import { createTournamentNewForm } from './tournament-new-form';
import type { TournamentNewFormControls } from './tournament-new-form.types';

const TOURNAMENT_FIELD_FOCUS_ORDER: (keyof TournamentNewFormControls)[] = [
  'tournamentName',
  'tournamentOrganizer',
  'tournamentCategory',
  'tournamentSurface',
  'tournamentDirector',
  'officialBall',
  'tournamentPrize',
  'tournamentCountry',
  'tournamentCity',
  'tournamentLocation',
  'tournamentStartDate',
  'tournamentEndDate',
  'entryDeadline',
  'withdrawalDeadline',
  'singlesQualifyingSignIn',
  'singlesMainDrawSignIn',
  'firstDaySinglesQualifying',
  'firstDaySinglesMainDraw',
  'singlesMainDrawSize',
  'singlesQualifyingDrawSize',
  'doublesMainDrawSize',
  'tournamentContact',
  'tournamentEmail',
  'tournamentImageUrl',
];

@Component({
  selector: 'app-tournament-new-page',
  imports: [ReactiveFormsModule, RouterLink, InputErrorDirective],
  templateUrl: './tournament-new.page.html',
  styleUrl: './tournament-new.page.css',
})
export class TournamentNewPage {
  private readonly tournamentsApi = inject(TournamentsApi);
  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly injector = inject(Injector);

  private readonly pageHeading = viewChild<ElementRef<HTMLElement>>('pageHeading');
  private readonly createErrorAlert = viewChild<ElementRef<HTMLElement>>('createErrorAlert');

  readonly surfaceOptions = [...TOURNAMENT_SURFACE_OPTIONS];
  readonly submitting = signal(false);
  readonly error = signal<string | null>(null);

  readonly tournamentForm = createTournamentNewForm();

  readonly validationKeys: typeof validationKeys = validationKeys;

  constructor() {
    this.tournamentForm.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => this.error.set(null));
  }

  submit(): void {
    this.error.set(null);
    if (this.tournamentForm.invalid) {
      this.tournamentForm.markAllAsTouched();
      this.scrollToFirstInvalidField();
      return;
    }

    const raw = this.tournamentForm.getRawValue();
    const payload = this.buildCreatePayload(raw);

    this.submitting.set(true);

    this.tournamentsApi
      .create(payload)
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: async () => {
          this.notificationService.showSuccess('Tournament created successfully.');
          await this.router.navigateByUrl('/tournaments');
        },
        error: (e: unknown) => {
          const err = e as { error?: { message?: unknown }; message?: unknown };
          const msg =
            typeof err?.error?.message === 'string'
              ? err.error.message
              : typeof err?.message === 'string'
                ? err.message
                : null;
          const errorMessage = msg || 'Could not create tournament. Make sure you are logged in.';
          this.error.set(errorMessage);
          this.notificationService.showError(errorMessage);
          this.scrollCreateErrorIntoView();
        },
      });
  }

  private buildCreatePayload(
    raw: ReturnType<FormGroup<TournamentNewFormControls>['getRawValue']>,
  ): CreateTournamentData {
    const prize = raw.tournamentPrize?.trim();
    const sq = raw.singlesQualifyingDrawSize?.trim();
    const dq = raw.doublesMainDrawSize?.trim();

    const payload: CreateTournamentData = {
      tournamentName: raw.tournamentName.trim(),
      tournamentOrganizer: raw.tournamentOrganizer.trim(),
      tournamentCategory: raw.tournamentCategory.trim(),
      tournamentStartDate: new Date(raw.tournamentStartDate),
      tournamentEndDate: new Date(raw.tournamentEndDate),
      tournamentCountry: raw.tournamentCountry.trim(),
      tournamentCity: raw.tournamentCity.trim(),
      tournamentLocation: raw.tournamentLocation.trim(),
      tournamentSurface: raw.tournamentSurface.trim(),
      tournamentContact: raw.tournamentContact.trim(),
      tournamentEmail: raw.tournamentEmail.trim(),
      isDeleted: false,
      tournamentImageUrl: raw.tournamentImageUrl.trim(),
      entryDeadline: new Date(raw.entryDeadline),
      withdrawalDeadline: new Date(raw.withdrawalDeadline),
      singlesQualifyingSignIn: new Date(raw.singlesQualifyingSignIn),
      singlesMainDrawSignIn: new Date(raw.singlesMainDrawSignIn),
      firstDaySinglesQualifying: new Date(raw.firstDaySinglesQualifying),
      firstDaySinglesMainDraw: new Date(raw.firstDaySinglesMainDraw),
      officialBall: raw.officialBall.trim(),
      tournamentDirector: raw.tournamentDirector.trim(),
      singlesMainDrawSize: raw.singlesMainDrawSize.trim(),
    };

    if (prize) {
      payload.tournamentPrize = prize;
    }
    if (sq) {
      payload.singlesQualifyingDrawSize = sq;
    }
    if (dq) {
      payload.doublesMainDrawSize = dq;
    }

    return payload;
  }

  private scrollToFirstInvalidField(): void {
    afterNextRender(
      () => {
        for (const key of TOURNAMENT_FIELD_FOCUS_ORDER) {
          if (this.tournamentForm.controls[key].invalid) {
            const el = document.getElementById(`tournament-input-${String(key)}`);
            el?.focus({ preventScroll: true });
            el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
          }
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
