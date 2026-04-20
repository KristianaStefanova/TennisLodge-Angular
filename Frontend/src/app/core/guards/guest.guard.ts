import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

/**
 * Allows login/register only for guests. Authenticated users are sent home.
 * After refresh, `loadCurrentUser()` resolves the session from the API before deciding.
 */
export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAuthenticated()) {
    return router.createUrlTree(['/']);
  }

  return auth.loadCurrentUser().pipe(
    map((user) => (user !== null ? router.createUrlTree(['/']) : true)),
  );
};
