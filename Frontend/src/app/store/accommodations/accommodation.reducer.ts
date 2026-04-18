import { createReducer, on } from '@ngrx/store';
import { initialAccommodationState } from './accommodation.state';
import * as AccommodationActions from './accommodation.actions';

export const accommodationFeatureKey = 'accommodations';

export const accommodationReducer = createReducer(
  initialAccommodationState,
  on(AccommodationActions.loadAccommodations, (state) => ({
    ...state,
    isLoading: true,
    error: null,
    lastCreatedAccommodationId: null,
  })),
  on(AccommodationActions.loadAccommodationsSuccess, (state, { accommodations }) => ({
    ...state,
    accommodations,
    isLoading: false,
    error: null,
    lastCreatedAccommodationId: null,
  })),
  on(AccommodationActions.loadAccommodationsFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error,
    lastCreatedAccommodationId: null,
  })),
  on(AccommodationActions.addAccommodation, (state) => ({
    ...state,
    isLoading: true,
    error: null,
    lastCreatedAccommodationId: null,
  })),
  on(AccommodationActions.addAccommodationSuccess, (state, { accommodation }) => ({
    ...state,
    accommodations: [...state.accommodations, accommodation],
    isLoading: false,
    error: null,
    lastCreatedAccommodationId: accommodation._id,
  })),
  on(AccommodationActions.addAccommodationFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error,
    lastCreatedAccommodationId: null,
  })),
  on(AccommodationActions.clearAccommodationFeedback, (state) => ({
    ...state,
    error: null,
    lastCreatedAccommodationId: null,
  })),
);
