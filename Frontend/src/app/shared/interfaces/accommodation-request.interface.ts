export type AccommodationRequestStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled';

export interface AccommodationRequestUserRef {
  _id?: string;
  username: string;
  firstName?: string;
  lastName?: string;
}

export interface AccommodationRequest {
  _id: string;
  accommodationId: string;
  requesterId: string | AccommodationRequestUserRef;
  numberOfGuests: number;
  status: AccommodationRequestStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAccommodationRequestPayload {
  accommodationId: string;
  numberOfGuests: number;
}
