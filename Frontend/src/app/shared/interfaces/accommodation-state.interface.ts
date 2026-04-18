import { Accommodation } from './accommodation.interface';

export interface AccommodationState {
  accommodations: Accommodation[];
  isLoading: boolean;
  error: string | null;
  lastCreatedAccommodationId: string | null;
}
