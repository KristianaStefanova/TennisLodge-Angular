import {
  AbstractControl,
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import type { PublicTransportType } from '../../../../shared/constants/accommodation-public-transport.constants';
import type { Accommodation, CreateAccommodationData } from '../../../../shared/interfaces/accommodation.interface';
import { validationKeys } from '../../../../shared/validators/validation-keys';
import {
  formDistanceToMeters,
  metersToFormDistance,
  type DistanceUnit,
} from '../../../../shared/utils/accommodation-distance.util';

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

function stayRangeValidator(): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const g = group as FormGroup;
    const a = g.get('checkInAt')?.value as string | undefined;
    const b = g.get('checkOutAt')?.value as string | undefined;
    if (!a?.trim() || !b?.trim()) {
      return null;
    }
    const start = new Date(a);
    const end = new Date(b);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return null;
    }
    return end <= start ? { [validationKeys.invalidDateRange]: true } : null;
  };
}

function publicTransportWhenNearbyValidator(): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const g = group as FormGroup<AccommodationNewFormControls>;
    if (!g.controls.hasPublicTransportNearby.value) {
      return null;
    }
    const types = g.controls.publicTransportTypes.value ?? [];
    return types.length > 0 ? null : { [validationKeys.transportTypesRequired]: true };
  };
}

function distanceFiniteValidator(): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const g = group as FormGroup<AccommodationNewFormControls>;
    const m = formDistanceToMeters(g.controls.distanceAmount.value, g.controls.distanceUnit.value);
    return Number.isFinite(m) && m >= 0 ? null : { [validationKeys.invalidDistance]: true };
  };
}

export interface AccommodationNewFormControls {
  checkInAt: FormControl<string>;
  checkOutAt: FormControl<string>;
  city: FormControl<string>;
  postalCode: FormControl<string>;
  address: FormControl<string>;
  maxGuests: FormControl<number>;
  distanceAmount: FormControl<number>;
  distanceUnit: FormControl<DistanceUnit>;
  hasPublicTransportNearby: FormControl<boolean>;
  publicTransportTypes: FormControl<PublicTransportType[]>;
  additionalDescription: FormControl<string>;
  houseRules: FormControl<string>;
  photoUrl: FormControl<string>;
  tournamentId: FormControl<string>;
}

export const ACCOMMODATION_FORM_FIELD_ORDER: (keyof AccommodationNewFormControls)[] = [
  'checkInAt',
  'checkOutAt',
  'address',
  'city',
  'postalCode',
  'maxGuests',
  'distanceAmount',
  'distanceUnit',
  'hasPublicTransportNearby',
  'publicTransportTypes',
  'additionalDescription',
  'houseRules',
  'tournamentId',
  'photoUrl',
];

const groupValidators = [
  stayRangeValidator(),
  publicTransportWhenNearbyValidator(),
  distanceFiniteValidator(),
];

export function createAccommodationNewForm(): FormGroup<AccommodationNewFormControls> {
  const now = new Date();
  const end = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const dateValidators = [Validators.required, parseableDateTimeValidator()];

  return new FormGroup<AccommodationNewFormControls>(
    {
      checkInAt: new FormControl(formatDateTimeForLocalInput(now), {
        nonNullable: true,
        validators: dateValidators,
      }),
      checkOutAt: new FormControl(formatDateTimeForLocalInput(end), {
        nonNullable: true,
        validators: dateValidators,
      }),
      city: new FormControl('', { nonNullable: true, validators: Validators.required }),
      postalCode: new FormControl('', { nonNullable: true, validators: Validators.required }),
      address: new FormControl('', { nonNullable: true, validators: Validators.required }),
      maxGuests: new FormControl(1, {
        nonNullable: true,
        validators: [Validators.required, Validators.min(1), Validators.max(500)],
      }),
      distanceAmount: new FormControl(0, {
        nonNullable: true,
        validators: [Validators.required, Validators.min(0)],
      }),
      distanceUnit: new FormControl<DistanceUnit>('m', { nonNullable: true, validators: Validators.required }),
      hasPublicTransportNearby: new FormControl(false, { nonNullable: true }),
      publicTransportTypes: new FormControl<PublicTransportType[]>([], { nonNullable: true }),
      additionalDescription: new FormControl('', { nonNullable: true }),
      houseRules: new FormControl('', { nonNullable: true }),
      photoUrl: new FormControl('', { nonNullable: true }),
      tournamentId: new FormControl('', { nonNullable: true }),
    },
    { validators: groupValidators },
  );
}

export function createAccommodationFormFromAccommodation(
  a: Accommodation,
): FormGroup<AccommodationNewFormControls> {
  const dateValidators = [Validators.required, parseableDateTimeValidator()];
  const tournamentId = a.tournament?._id ?? '';
  const dist = metersToFormDistance(a.distanceToCourtsMeters);

  return new FormGroup<AccommodationNewFormControls>(
    {
      checkInAt: new FormControl(formatDateTimeForLocalInput(a.checkInAt), {
        nonNullable: true,
        validators: dateValidators,
      }),
      checkOutAt: new FormControl(formatDateTimeForLocalInput(a.checkOutAt), {
        nonNullable: true,
        validators: dateValidators,
      }),
      city: new FormControl(a.city ?? '', { nonNullable: true, validators: Validators.required }),
      postalCode: new FormControl(a.postalCode ?? '', {
        nonNullable: true,
        validators: Validators.required,
      }),
      address: new FormControl(a.address, { nonNullable: true, validators: Validators.required }),
      maxGuests: new FormControl(a.maxGuests, {
        nonNullable: true,
        validators: [Validators.required, Validators.min(1), Validators.max(500)],
      }),
      distanceAmount: new FormControl(dist.amount, {
        nonNullable: true,
        validators: [Validators.required, Validators.min(0)],
      }),
      distanceUnit: new FormControl(dist.unit, {
        nonNullable: true,
        validators: Validators.required,
      }),
      hasPublicTransportNearby: new FormControl(Boolean(a.hasPublicTransportNearby), {
        nonNullable: true,
      }),
      publicTransportTypes: new FormControl([...(a.publicTransportTypes ?? [])], {
        nonNullable: true,
      }),
      additionalDescription: new FormControl(a.additionalDescription, { nonNullable: true }),
      houseRules: new FormControl(a.houseRules, { nonNullable: true }),
      photoUrl: new FormControl(a.photoUrl ?? '', { nonNullable: true }),
      tournamentId: new FormControl(tournamentId, { nonNullable: true }),
    },
    { validators: groupValidators },
  );
}

export type AccommodationFormValue = ReturnType<FormGroup<AccommodationNewFormControls>['getRawValue']>;

export function buildCreateAccommodationPayload(raw: AccommodationFormValue): CreateAccommodationData {
  const meters = formDistanceToMeters(raw.distanceAmount, raw.distanceUnit);
  const safeMeters = Number.isFinite(meters) ? meters : 0;
  const nearby = raw.hasPublicTransportNearby === true;
  return {
    checkInAt: new Date(raw.checkInAt),
    checkOutAt: new Date(raw.checkOutAt),
    city: raw.city.trim(),
    postalCode: raw.postalCode.trim(),
    hasPublicTransportNearby: nearby,
    publicTransportTypes: nearby ? [...raw.publicTransportTypes] : [],
    additionalDescription: raw.additionalDescription.trim(),
    houseRules: raw.houseRules.trim(),
    distanceToCourtsMeters: safeMeters,
    address: raw.address.trim(),
    maxGuests: raw.maxGuests,
    photoUrl: raw.photoUrl.trim(),
    isDeleted: false,
    tournamentId: raw.tournamentId.trim() || null,
  };
}
