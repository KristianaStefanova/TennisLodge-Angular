import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {
  AccommodationRequest,
  AccommodationRequestListingSummary,
  AccommodationRequestStatus,
  CreateAccommodationRequestPayload,
  GuestOutgoingStayRequest,
  StayRequestCountsDto,
  StayRequestWithListing,
} from '../../shared/interfaces/accommodation-request.interface';

interface AccommodationRequestApiDto {
  _id: unknown;
  accommodationId?: unknown;
  requesterId?: unknown;
  numberOfGuests?: unknown;
  status?: unknown;
  createdAt?: unknown;
  updatedAt?: unknown;
  hostMessage?: unknown;
  guestOutcomeUnread?: unknown;
}

@Injectable({ providedIn: 'root' })
export class AccommodationRequestsApi {
  private readonly baseUrl = '/api/accommodation-requests';

  constructor(private readonly http: HttpClient) {}

  getCounts(): Observable<StayRequestCountsDto> {
    return this.http
      .get<StayRequestCountsDto>(`${this.baseUrl}/counts`, { withCredentials: true })
      .pipe(
        map((body) => ({
          pendingSent: Math.max(0, Math.floor(Number(body?.pendingSent) || 0)),
          pendingReceived: Math.max(0, Math.floor(Number(body?.pendingReceived) || 0)),
          unreadGuestOutcomes: Math.max(0, Math.floor(Number(body?.unreadGuestOutcomes) || 0)),
        })),
        catchError((err) => this.handleError(err)),
      );
  }

  listMine(): Observable<AccommodationRequest[]> {
    return this.http
      .get<AccommodationRequestApiDto[]>(`${this.baseUrl}/mine`, { withCredentials: true })
      .pipe(
        map((rows) => (Array.isArray(rows) ? rows : []).map((r) => this.toRequest(r))),
        catchError((err) => this.handleError(err)),
      );
  }

  listIncomingForHost(): Observable<StayRequestWithListing[]> {
    return this.http
      .get<AccommodationRequestApiDto[]>(`${this.baseUrl}/incoming`, { withCredentials: true })
      .pipe(
        map((rows) => (Array.isArray(rows) ? rows : []).map((r) => this.toStayRequestWithListing(r))),
        catchError((err) => this.handleError(err)),
      );
  }

  listSentByMe(): Observable<GuestOutgoingStayRequest[]> {
    return this.http
      .get<AccommodationRequestApiDto[]>(`${this.baseUrl}/mine`, { withCredentials: true })
      .pipe(
        map((rows) => (Array.isArray(rows) ? rows : []).map((r) => this.toStayRequestWithListing(r))),
        catchError((err) => this.handleError(err)),
      );
  }

  listForHost(accommodationId: string): Observable<AccommodationRequest[]> {
    return this.http
      .get<AccommodationRequestApiDto[]>(
        `${this.baseUrl}/host/${encodeURIComponent(accommodationId)}`,
        { withCredentials: true },
      )
      .pipe(
        map((rows) => (Array.isArray(rows) ? rows : []).map((r) => this.toRequest(r))),
        catchError((err) => this.handleError(err)),
      );
  }

  create(payload: CreateAccommodationRequestPayload): Observable<AccommodationRequest> {
    return this.http
      .post<AccommodationRequestApiDto>(this.baseUrl, payload, { withCredentials: true })
      .pipe(map((r) => this.toRequest(r)), catchError((err) => this.handleError(err)));
  }

  markGuestOutcomesRead(): Observable<{ modifiedCount: number }> {
    return this.http
      .post<{ modifiedCount: number }>(
        `${this.baseUrl}/guest-outcomes/read`,
        {},
        { withCredentials: true },
      )
      .pipe(catchError((err) => this.handleError(err)));
  }

  updateStatus(
    id: string,
    status: AccommodationRequestStatus,
    options?: { hostMessage?: string },
  ): Observable<AccommodationRequest> {
    const body: Record<string, unknown> = { status };
    if (status === 'accepted' || status === 'rejected') {
      body['message'] = options?.hostMessage ?? '';
    }
    return this.http
      .patch<AccommodationRequestApiDto>(
        `${this.baseUrl}/${encodeURIComponent(id)}`,
        body,
        { withCredentials: true },
      )
      .pipe(map((r) => this.toRequest(r)), catchError((err) => this.handleError(err)));
  }

  private toStayRequestWithListing(row: AccommodationRequestApiDto): StayRequestWithListing {
    const base = this.toRequest(row);
    const accRaw = row.accommodationId;
    const accommodation = this.toListingSummary(accRaw, base.accommodationId);
    return {
      ...base,
      accommodation,
    };
  }

  private toListingSummary(
    accRaw: unknown,
    fallbackId: string,
  ): AccommodationRequestListingSummary {
    if (accRaw && typeof accRaw === 'object' && '_id' in accRaw) {
      const a = accRaw as {
        _id?: unknown;
        address?: unknown;
        city?: unknown;
        checkInAt?: unknown;
        checkOutAt?: unknown;
        maxGuests?: unknown;
        isDeleted?: unknown;
      };
      return {
        _id: a._id != null ? String(a._id) : fallbackId,
        address: typeof a.address === 'string' ? a.address : '',
        city: typeof a.city === 'string' ? a.city : '',
        checkInAt: this.parseDate(a.checkInAt),
        checkOutAt: this.parseDate(a.checkOutAt),
        maxGuests: typeof a.maxGuests === 'number' ? a.maxGuests : 1,
        ...(typeof a.isDeleted === 'boolean' ? { isDeleted: a.isDeleted } : {}),
      };
    }
    return {
      _id: fallbackId,
      address: '',
      city: '',
      checkInAt: new Date(),
      checkOutAt: new Date(),
      maxGuests: 1,
    };
  }

  private toRequest(row: AccommodationRequestApiDto): AccommodationRequest {
    const accRaw = row.accommodationId;
    let accommodationId = '';
    if (typeof accRaw === 'string') {
      accommodationId = accRaw;
    } else if (accRaw && typeof accRaw === 'object' && '_id' in accRaw) {
      accommodationId = String((accRaw as { _id: unknown })._id);
    }

    return {
      _id: String(row._id),
      accommodationId,
      requesterId: this.mapRequester(row.requesterId),
      numberOfGuests: typeof row.numberOfGuests === 'number' ? row.numberOfGuests : 1,
      status: (row.status as AccommodationRequestStatus) ?? 'pending',
      createdAt: this.parseDate(row.createdAt),
      updatedAt: this.parseDate(row.updatedAt),
      hostMessage: typeof row.hostMessage === 'string' ? row.hostMessage : '',
      guestOutcomeUnread: row.guestOutcomeUnread === true,
    };
  }

  private mapRequester(
    raw: unknown,
  ): string | import('../../shared/interfaces/accommodation-request.interface').AccommodationRequestUserRef {
    if (typeof raw === 'string') {
      return raw;
    }
    if (raw && typeof raw === 'object' && 'username' in raw) {
      const u = raw as {
        _id?: unknown;
        username?: unknown;
        firstName?: unknown;
        lastName?: unknown;
      };
      return {
        _id: u._id != null ? String(u._id) : undefined,
        username: typeof u.username === 'string' ? u.username : '',
        firstName: typeof u.firstName === 'string' ? u.firstName : undefined,
        lastName: typeof u.lastName === 'string' ? u.lastName : undefined,
      };
    }
    return '';
  }

  private parseDate(value: unknown): Date {
    if (value == null || value === '') {
      return new Date();
    }
    const d = value instanceof Date ? value : new Date(value as string);
    return Number.isNaN(d.getTime()) ? new Date() : d;
  }

  private handleError(err: unknown): Observable<never> {
    if (err instanceof HttpErrorResponse) {
      const msg =
        typeof err.error?.message === 'string'
          ? err.error.message
          : err.status === 0
            ? 'Network error. Is the API running?'
            : `Request failed (${err.status})`;
      return throwError(() => new Error(msg));
    }
    return throwError(() => new Error('Unexpected error'));
  }
}
