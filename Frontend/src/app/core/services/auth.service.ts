import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { User } from '../../shared/interfaces/user.interface';
import {
  LoginCredentials,
  RegisterPayload,
  UserApiDto,
  UserProfileUpdate,
} from '../../shared/interfaces/user.dto';
import { UserService } from './user.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly userService = inject(UserService);

  private readonly _user = signal<User | null>(null);

  readonly user = this._user.asReadonly();

  readonly isAuthenticated = computed(() => this._user() !== null);

  loadCurrentUser(): Observable<User | null> {
    return this.userService.getProfile().pipe(
      tap((u) => this._user.set(u)),
      catchError(() => {
        this.clearSession();
        return of(null);
      }),
    );
  }

  login(credentials: LoginCredentials): Observable<User> {
    return this.http
      .post<unknown>('/api/login', credentials, { withCredentials: true })
      .pipe(
        map((body) => this.userService.toUser(body as UserApiDto)),
        tap((u) => this._user.set(u)),
        catchError((err) => this.handleError(err)),
      );
  }

  register(payload: RegisterPayload): Observable<User> {
    return this.http
      .post<unknown>('/api/register', payload, { withCredentials: true })
      .pipe(
        map((body) => this.userService.toUser(body as UserApiDto)),
        tap((u) => this._user.set(u)),
        catchError((err) => this.handleError(err)),
      );
  }

  logout(): Observable<void> {
    return this.http.post<void>('/api/logout', {}, { withCredentials: true }).pipe(
      tap(() => this.clearSession()),
      map(() => undefined),
      catchError((err) => {
        this.clearSession();
        return this.handleError(err);
      }),
    );
  }

  updateProfile(updates: UserProfileUpdate): Observable<User> {
    return this.userService.updateProfile(updates).pipe(
      tap((u) => this._user.set(u)),
      catchError((err) => this.handleError(err)),
    );
  }

  setSessionUser(user: User): void {
    this._user.set(user);
  }

  clearSession(): void {
    this._user.set(null);
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
