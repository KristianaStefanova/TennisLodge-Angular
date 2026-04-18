import { createAction, props } from '@ngrx/store';
import { Accommodation, CreateAccommodationData } from '../../shared/interfaces/accommodation.interface';

export const loadAccommodations = createAction('[Accommodation] Load Accommodations');

export const loadAccommodationsSuccess = createAction(
  '[Accommodation] Load Accommodations Success',
  props<{ accommodations: Accommodation[] }>(),
);

export const loadAccommodationsFailure = createAction(
  '[Accommodation] Load Accommodations Failure',
  props<{ error: string }>(),
);

export const addAccommodation = createAction(
  '[Accommodation] Add Accommodation',
  props<{ payload: CreateAccommodationData }>(),
);

export const addAccommodationSuccess = createAction(
  '[Accommodation] Add Accommodation Success',
  props<{ accommodation: Accommodation }>(),
);

export const addAccommodationFailure = createAction(
  '[Accommodation] Add Accommodation Failure',
  props<{ error: string }>(),
);

export const clearAccommodationFeedback = createAction('[Accommodation] Clear Accommodation Feedback');
