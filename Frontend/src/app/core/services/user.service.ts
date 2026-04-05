import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { User } from '../../shared/interfaces/user';
import { UserApiDto, UserProfileUpdate } from '../../shared/interfaces/user.dto';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/users';

  getProfile(): Observable<User> {
    return this.http.get<UserApiDto>(`${this.baseUrl}/profile`, { withCredentials: true }).pipe(
      map((row) => this.toUser(row)),
      catchError((err) => this.handleError(err)),
    );
  }

  updateProfile(updates: UserProfileUpdate): Observable<User> {
    return this.http
      .put<UserApiDto>(`${this.baseUrl}/profile`, updates, { withCredentials: true })
      .pipe(
        map((row) => this.toUser(row)),
        catchError((err) => this.handleError(err)),
      );
  }

  uploadProfilePicture(file: File): Observable<User> {
    const body = new FormData();
    body.append('photo', file, file.name);
    return this.http
      .post<UserApiDto>(`${this.baseUrl}/profile/picture`, body, {
        withCredentials: true,
      })
      .pipe(
        map((row) => this.toUser(row)),
        catchError((err) => this.handleError(err)),
      );
  }

  toUser(row: UserApiDto): User {
    const telRaw = row.tel;
    return {
      _id: String(row._id),
      username: String(row.username ?? ''),
      email: String(row.email ?? ''),
      firstName: String(row.firstName ?? ''),
      lastName: String(row.lastName ?? ''),
      profilePictureUrl:
        row.profilePictureUrl != null && row.profilePictureUrl !== ''
          ? String(row.profilePictureUrl)
          : undefined,
      tel:
        telRaw != null && String(telRaw).trim() !== '' ? String(telRaw).trim() : undefined,
    };
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
