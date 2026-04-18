import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {
  isPublicTransportType,
  type PublicTransportType,
} from '../../shared/constants/accommodation-public-transport.constants';
import {
  Accommodation,
  CreateAccommodationData,
  UpdateAccommodationData,
} from '../../shared/interfaces/accommodation.interface';
import { AccommodationApiDto } from '../../shared/interfaces/accommodation.dto';

@Injectable({ providedIn: 'root' })
export class AccommodationsApi {
  private readonly baseUrl = '/api/accommodations';

  constructor(private readonly http: HttpClient) {}

  getAll(): Observable<Accommodation[]> {
    return this.http.get<AccommodationApiDto[]>(this.baseUrl, { withCredentials: true }).pipe(
      map((rows) => (Array.isArray(rows) ? rows : []).map((row) => this.toAccommodation(row))),
      catchError((err) => this.handleError(err)),
    );
  }

  getMine(): Observable<Accommodation[]> {
    return this.http.get<AccommodationApiDto[]>(`${this.baseUrl}/host/mine`, { withCredentials: true }).pipe(
      map((rows) => (Array.isArray(rows) ? rows : []).map((row) => this.toAccommodation(row))),
      catchError((err) => this.handleError(err)),
    );
  }

  getById(id: string): Observable<Accommodation> {
    return this.http
      .get<AccommodationApiDto>(`${this.baseUrl}/${encodeURIComponent(id)}`, { withCredentials: true })
      .pipe(map((row) => this.toAccommodation(row)), catchError((err) => this.handleError(err)));
  }

  create(payload: CreateAccommodationData): Observable<Accommodation> {
    const body = this.serializeWrite(payload);
    return this.http
      .post<AccommodationApiDto>(this.baseUrl, body, { withCredentials: true })
      .pipe(map((row) => this.toAccommodation(row)), catchError((err) => this.handleError(err)));
  }

  update(id: string, payload: UpdateAccommodationData): Observable<Accommodation> {
    const body = this.serializeWrite(payload);
    return this.http
      .put<AccommodationApiDto>(`${this.baseUrl}/${encodeURIComponent(id)}`, body, {
        withCredentials: true,
      })
      .pipe(map((row) => this.toAccommodation(row)), catchError((err) => this.handleError(err)));
  }

  delete(id: string): Observable<void> {
    return this.http
      .delete<void>(`${this.baseUrl}/${encodeURIComponent(id)}`, { withCredentials: true })
      .pipe(map(() => undefined), catchError((err) => this.handleError(err)));
  }

  private serializeWrite(payload: CreateAccommodationData): Record<string, unknown> {
    const body: Record<string, unknown> = {
      checkInAt: payload.checkInAt,
      checkOutAt: payload.checkOutAt,
      city: payload.city,
      postalCode: payload.postalCode,
      hasPublicTransportNearby: payload.hasPublicTransportNearby,
      publicTransportTypes: payload.publicTransportTypes,
      additionalDescription: payload.additionalDescription,
      houseRules: payload.houseRules,
      distanceToCourtsMeters: payload.distanceToCourtsMeters,
      address: payload.address,
      maxGuests: payload.maxGuests,
      isDeleted: payload.isDeleted,
      photoUrl: payload.photoUrl ?? '',
    };
    const tid = payload.tournamentId?.trim();
    if (tid) {
      body['tournamentId'] = tid;
    }
    return body;
  }

  private parsePublicTransportTypes(raw: unknown): PublicTransportType[] {
    if (!Array.isArray(raw)) {
      return [];
    }
    const out: PublicTransportType[] = [];
    for (const item of raw) {
      if (typeof item === 'string' && isPublicTransportType(item)) {
        out.push(item);
      }
    }
    return out;
  }

  private toAccommodation(row: AccommodationApiDto): Accommodation {
    const rowRecord = row as AccommodationApiDto & Record<string, unknown>;
    const tournamentRaw = rowRecord.tournamentId;
    let tournament: Accommodation['tournament'] = null;
    if (
      tournamentRaw &&
      typeof tournamentRaw === 'object' &&
      tournamentRaw !== null &&
      '_id' in tournamentRaw
    ) {
      const t = tournamentRaw as { _id: unknown; tournamentName?: unknown };
      tournament = {
        _id: String(t._id),
        tournamentName: typeof t.tournamentName === 'string' ? t.tournamentName : '',
      };
    }

    const base: Accommodation = {
      _id: String(row._id),
      checkInAt: this.parseDate(row.checkInAt),
      checkOutAt: this.parseDate(row.checkOutAt),
      city: typeof row.city === 'string' ? row.city : '',
      postalCode: typeof row.postalCode === 'string' ? row.postalCode : '',
      hasPublicTransportNearby: Boolean(row.hasPublicTransportNearby),
      publicTransportTypes: this.parsePublicTransportTypes(row.publicTransportTypes),
      additionalDescription: typeof row.additionalDescription === 'string' ? row.additionalDescription : '',
      houseRules: typeof row.houseRules === 'string' ? row.houseRules : '',
      distanceToCourtsMeters:
        typeof row.distanceToCourtsMeters === 'number' ? row.distanceToCourtsMeters : 0,
      address: typeof row.address === 'string' ? row.address : '',
      maxGuests: typeof row.maxGuests === 'number' ? row.maxGuests : 1,
      photoUrl: typeof row.photoUrl === 'string' ? row.photoUrl : '',
      isDeleted: Boolean(row.isDeleted),
      createdAt: row.createdAt != null ? this.parseDate(row.createdAt) : new Date(),
      updatedAt: row.updatedAt != null ? this.parseDate(row.updatedAt) : new Date(),
      tournament,
    };
    if (row.ownerId != null && row.ownerId !== '') {
      base.ownerId = String(row.ownerId);
    }
    return base;
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

export { AccommodationsApi as AccommodationsService };
