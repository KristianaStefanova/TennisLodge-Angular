import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AccommodationState } from '../../shared/interfaces/accommodation-state.interface';
import { accommodationFeatureKey } from './accommodation.reducer';

export const selectAccommodationState = createFeatureSelector<AccommodationState>(accommodationFeatureKey);

export const selectAllAccommodations = createSelector(
  selectAccommodationState,
  (state) => state.accommodations,
);

export const selectAccommodationsLoading = createSelector(
  selectAccommodationState,
  (state) => state.isLoading,
);

export const selectAccommodationsError = createSelector(
  selectAccommodationState,
  (state) => state.error,
);

export const selectLastCreatedAccommodationId = createSelector(
  selectAccommodationState,
  (state) => state.lastCreatedAccommodationId,
);

export const selectAccommodationById = (id: string) =>
  createSelector(selectAllAccommodations, (accommodations) =>
    accommodations.find((a) => a._id === id),
  );
