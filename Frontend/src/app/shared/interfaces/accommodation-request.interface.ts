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
  /** Set when the host accepts or rejects; visible to the guest. */
  hostMessage: string;
  /** True until the guest opens “Requests I sent” after a host decision. */
  guestOutcomeUnread: boolean;
}

export interface CreateAccommodationRequestPayload {
  accommodationId: string;
  numberOfGuests: number;
}

/** Populated listing snapshot for inbox-style stay request rows. */
export interface AccommodationRequestListingSummary {
  _id: string;
  address: string;
  city: string;
  checkInAt: Date;
  checkOutAt: Date;
  maxGuests: number;
  /** Present when the listing was soft-deleted after the request existed. */
  isDeleted?: boolean;
}

/** Stay request row with listing context (host inbox or guest “sent” list). */
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

/** Same row shape as {@link StayRequestWithListing} (host inbox). */
export type HostIncomingStayRequest = StayRequestWithListing;

/** Requests you sent as a guest (GET /mine). */
export type GuestOutgoingStayRequest = StayRequestWithListing;

/** Lightweight pending totals for menus (GET /counts). */
export interface StayRequestCountsDto {
  pendingSent: number;
  pendingReceived: number;
  /** Host accepted/rejected; guest has not cleared inbox yet. */
  unreadGuestOutcomes: number;
}
