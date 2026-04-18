import type { PublicTransportType } from '../constants/accommodation-public-transport.constants';

export interface AccommodationTournamentRef {
  _id: string;
  tournamentName: string;
}

export interface Accommodation {
  _id: string;
  checkInAt: Date;
  checkOutAt: Date;
  city: string;
  postalCode: string;
  hasPublicTransportNearby: boolean;
  publicTransportTypes: PublicTransportType[];
  additionalDescription: string;
  houseRules: string;
  distanceToCourtsMeters: number;
  address: string;
  maxGuests: number;
  photoUrl: string;
  isDeleted: boolean;
  ownerId?: string;
  tournament?: AccommodationTournamentRef | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAccommodationData
  extends Omit<Accommodation, '_id' | 'createdAt' | 'updatedAt' | 'ownerId' | 'tournament'> {
  tournamentId?: string | null;
}

export type UpdateAccommodationData = CreateAccommodationData;
