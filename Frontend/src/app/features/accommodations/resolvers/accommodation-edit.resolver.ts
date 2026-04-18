import { inject } from '@angular/core';
import { RedirectCommand, ResolveFn, Router } from '@angular/router';
import { of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AccommodationsApi } from '../../../core/services/accommodations.service';
import { AuthService } from '../../../core/services/auth.service';
import { Accommodation } from '../../../shared/interfaces/accommodation.interface';

export const accommodationEditResolver: ResolveFn<Accommodation | RedirectCommand> = (route) => {
  const api = inject(AccommodationsApi);
  const auth = inject(AuthService);
  const router = inject(Router);
  const id = route.paramMap.get('id');
  if (!id) {
    return new RedirectCommand(router.parseUrl('/accommodations/mine'));
  }
  return api.getById(id).pipe(
    switchMap((acc) => {
      const uid = auth.user()?._id;
      if (!uid || acc.ownerId !== uid) {
        return of(new RedirectCommand(router.parseUrl('/accommodations/mine')));
      }
      return of(acc);
    }),
    catchError(() => of(new RedirectCommand(router.parseUrl('/accommodations/mine')))),
  );
};
