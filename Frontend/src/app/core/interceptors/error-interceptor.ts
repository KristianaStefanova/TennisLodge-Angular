import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { NotificationService } from '../services/notification.service';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

const AUTH_ENDPOINTS = ['/api/login', '/api/register'];

function isAuthEndpoint(url: string): boolean {
  return AUTH_ENDPOINTS.some(endpoint => url.includes(endpoint));
}

/** GET /api/accommodations (list) may be called without a session (e.g. city suggestions on Home). */
function isAccommodationsListGet(req: { method: string; url: string }): boolean {
  const path = req.url.split('?')[0];
  return req.method === 'GET' && /\/api\/accommodations$/.test(path);
}

/** Session probe used on app startup/guest routes. 401 is expected when logged out. */
function isProfileProbeGet(req: { method: string; url: string }): boolean {
  const path = req.url.split('?')[0];
  return req.method === 'GET' && /\/api\/users\/profile$/.test(path);
}

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notificationService = inject(NotificationService);
  const authService = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && isAccommodationsListGet(req)) {
        return throwError(() => error);
      }
      if (error.status === 401 && isProfileProbeGet(req)) {
        return throwError(() => error);
      }

      let errorMessage = 'An unexpected error occurred. Please try again later.';

      if (error.error instanceof ErrorEvent) {
        errorMessage = `Error: ${error.error.message}`;
      } else {
        switch (error.status) {
          case 400:
            errorMessage = error.error?.message || 'Bad Request. Please check your input and try again.';
            break;
          case 401:
            if (isAuthEndpoint(req.url)) {
              errorMessage = error.error?.message || 'Invalid credentials. Please try again.';
            } else {
              if (authService.isAuthenticated()) {
                errorMessage = 'Session expired. Please log in again.';
                authService.clearSession();
                router.navigate(['/login']);
              } else {
                return throwError(() => error);
              }
            }
            break;
          case 403:
            errorMessage = 'You do not have permission to perform this action.';
            break;
          case 404:
            errorMessage = error.error?.message || 'Resource not found.';
            break;
          case 409:
            errorMessage = error.error?.message || 'This account already exists. Please check your input and try again.';
            break;
          case 500:
            errorMessage = error.error?.message || 'Internal Server Error. Please try again later.';
            break;
          default:
            errorMessage = error.error?.message || `Error: ${error.status}.`;
        }
      }

      notificationService.showError(errorMessage);
      return throwError(() => error);
    })
  )
};

