import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { DEFAULT_TOURNAMENT_SURFACE } from '../../../../shared/constants/tournament-surfaces';
import { optionalEmailValidator } from '../../../../shared/validators/email.validator';
import { validationKeys } from '../../../../shared/validators/validation-keys';
import type { TournamentNewFormControls } from './tournament-new-form.types';

function formatDateForDateInput(d: Date): string {
  if (!d || Number.isNaN(d.getTime())) {
    return '';
  }
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function formatDateTimeForLocalInput(d: Date): string {
  if (!d || Number.isNaN(d.getTime())) {
    return '';
  }
  const pad = (n: number) => String(n).padStart(2, '0');
  const y = d.getFullYear();
  const mo = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const h = pad(d.getHours());
  const min = pad(d.getMinutes());
  return `${y}-${mo}-${day}T${h}:${min}`;
}

function parseableDateTimeValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const v = (control.value as string)?.trim();
    if (!v) {
      return null;
    }
    const parsed = new Date(v);
    return Number.isNaN(parsed.getTime()) ? { [validationKeys.invalidDate]: true } : null;
  };
}

export function createTournamentNewForm(): FormGroup<TournamentNewFormControls> {
  const now = new Date();
  const dateRequired = [Validators.required, parseableDateTimeValidator()];

  return new FormGroup<TournamentNewFormControls>({
    tournamentName: new FormControl('', { nonNullable: true, validators: Validators.required }),
    tournamentOrganizer: new FormControl('', { nonNullable: true }),
    tournamentCategory: new FormControl('', { nonNullable: true }),
    tournamentSurface: new FormControl(DEFAULT_TOURNAMENT_SURFACE, { nonNullable: true }),
    tournamentDirector: new FormControl('', { nonNullable: true }),
    officialBall: new FormControl('', { nonNullable: true }),
    tournamentPrize: new FormControl('', { nonNullable: true }),
    tournamentCountry: new FormControl('', { nonNullable: true }),
    tournamentCity: new FormControl('', { nonNullable: true }),
    tournamentLocation: new FormControl('', { nonNullable: true }),
    tournamentStartDate: new FormControl(formatDateForDateInput(now), { nonNullable: true, validators: dateRequired }),
    tournamentEndDate: new FormControl(formatDateForDateInput(now), { nonNullable: true, validators: dateRequired }),
    entryDeadline: new FormControl(formatDateForDateInput(now), { nonNullable: true, validators: dateRequired }),
    withdrawalDeadline: new FormControl(formatDateForDateInput(now), { nonNullable: true, validators: dateRequired }),
    singlesQualifyingSignIn: new FormControl(formatDateTimeForLocalInput(now), {
      nonNullable: true,
      validators: dateRequired,
    }),
    singlesMainDrawSignIn: new FormControl(formatDateTimeForLocalInput(now), {
      nonNullable: true,
      validators: dateRequired,
    }),
    firstDaySinglesQualifying: new FormControl(formatDateForDateInput(now), {
      nonNullable: true,
      validators: dateRequired,
    }),
    firstDaySinglesMainDraw: new FormControl(formatDateForDateInput(now), {
      nonNullable: true,
      validators: dateRequired,
    }),
    singlesMainDrawSize: new FormControl('', { nonNullable: true }),
    singlesQualifyingDrawSize: new FormControl('', { nonNullable: true }),
    doublesMainDrawSize: new FormControl('', { nonNullable: true }),
    tournamentContact: new FormControl('', { nonNullable: true }),
    tournamentEmail: new FormControl('', { nonNullable: true, validators: optionalEmailValidator() }),
    tournamentImageUrl: new FormControl('', { nonNullable: true }),
  });
}
