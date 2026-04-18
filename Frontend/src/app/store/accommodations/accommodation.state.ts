import { AccommodationState } from '../../shared/interfaces/accommodation-state.interface';

export const initialAccommodationState: AccommodationState = {
  accommodations: [],
  isLoading: false,
  error: null,
  lastCreatedAccommodationId: null,
};
