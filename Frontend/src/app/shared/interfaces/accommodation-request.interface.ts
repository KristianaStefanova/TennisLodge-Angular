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
  hostMessage: string;
  guestOutcomeUnread: boolean;
}

export interface CreateAccommodationRequestPayload {
  accommodationId: string;
  numberOfGuests: number;
}

export interface AccommodationRequestListingSummary {
  _id: string;
  address: string;
  city: string;
  checkInAt: Date;
  checkOutAt: Date;
  maxGuests: number;
  isDeleted?: boolean;
}

export interface StayRequestWithListing {
  _id: string;
  accommodationId: string;
  accommodation: AccommodationRequestListingSummary;
  requesterId: string | AccommodationRequestUserRef;
  numberOfGuests: number;
  status: AccommodationRequestStatus;
  createdAt: Date;
  updatedAt: Date;
  hostMessage: string;
  guestOutcomeUnread: boolean;
}

export type HostIncomingStayRequest = StayRequestWithListing;

export type GuestOutgoingStayRequest = StayRequestWithListing;

export interface StayRequestCountsDto {
  pendingSent: number;
  pendingReceived: number;
  unreadGuestOutcomes: number;
}
