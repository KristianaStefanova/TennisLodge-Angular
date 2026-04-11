import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { CreateTournamentData, Tournament } from '../../shared/interfaces/tournament';
import { TournamentApiDto } from '../../shared/interfaces/tournament.dto';

@Injectable({ providedIn: 'root' })
export class TournamentsApi {
  private readonly baseUrl = '/api/tournaments';

  constructor(private readonly http: HttpClient) {}

  getAll(): Observable<Tournament[]> {
    return this.http.get<TournamentApiDto[]>(this.baseUrl, { withCredentials: true }).pipe(
      map((rows) => (Array.isArray(rows) ? rows : []).map((row) => this.toTournament(row))),
      tap(() => undefined),
      catchError((err) => this.handleError(err)),
    );
  }

  getById(id: string): Observable<Tournament> {
    return this.http
      .get<TournamentApiDto>(`${this.baseUrl}/${encodeURIComponent(id)}`, { withCredentials: true })
      .pipe(
      map((row) => this.toTournament(row)),
      catchError((err) => this.handleError(err)),
    );
  }

  create(payload: CreateTournamentData): Observable<Tournament> {
    return this.http
      .post<TournamentApiDto>(this.baseUrl, payload, { withCredentials: true })
      .pipe(
        map((row) => this.toTournament(row)),
        catchError((err) => this.handleError(err)),
      );
  }

  private toTournament(row: TournamentApiDto): Tournament {
    const base: Tournament = {
      _id: String(row._id),
      tournamentName: row.tournamentName,
      tournamentOrganizer: row.tournamentOrganizer,
      tournamentCategory: row.tournamentCategory,
      tournamentStartDate: this.parseDate(row.tournamentStartDate),
      tournamentEndDate: this.parseDate(row.tournamentEndDate),
      tournamentCountry: row.tournamentCountry ?? '',
      tournamentCity: row.tournamentCity ?? '',
      tournamentLocation: row.tournamentLocation,
      tournamentSurface: row.tournamentSurface,
      createdAt: row.createdAt != null ? this.parseDate(row.createdAt) : new Date(),
      tournamentContact: row.tournamentContact,
      tournamentEmail: row.tournamentEmail,
      isDeleted: Boolean(row.isDeleted),
      tournamentImageUrl: row.tournamentImageUrl ?? '',
      entryDeadline: this.parseDate(row.entryDeadline),
      withdrawalDeadline: this.parseDate(row.withdrawalDeadline),
      singlesQualifyingSignIn: this.parseDate(row.singlesQualifyingSignIn),
      singlesMainDrawSignIn: this.parseDate(row.singlesMainDrawSignIn),
      firstDaySinglesQualifying: this.parseDate(row.firstDaySinglesQualifying),
      firstDaySinglesMainDraw: this.parseDate(row.firstDaySinglesMainDraw),
      officialBall: row.officialBall ?? '',
      tournamentDirector: row.tournamentDirector ?? '',
      singlesMainDrawSize: row.singlesMainDrawSize ?? '',
    };
    if (row.ownerId != null && row.ownerId !== '') {
      base.ownerId = String(row.ownerId);
    }
    const prize = row.tournamentPrize?.trim();
    if (prize) {
      base.tournamentPrize = prize;
    }
    const sq = row.singlesQualifyingDrawSize?.trim();
    if (sq) {
      base.singlesQualifyingDrawSize = sq;
    }
    const dq = row.doublesMainDrawSize?.trim();
    if (dq) {
      base.doublesMainDrawSize = dq;
    }
    return base;
  }

  private parseDate(value: Date | string | undefined | null): Date {
    if (value == null || value === '') {
      return new Date();
    }
    const d = value instanceof Date ? value : new Date(value);
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

export { TournamentsApi as TournamentsService };
