import { inject } from '@angular/core';
import { RedirectCommand, ResolveFn, Router } from '@angular/router';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { TournamentsApi } from '../../core/services/tournaments.service';
import { Tournament } from '../../shared/interfaces/tournament';

export const tournamentDetailResolver: ResolveFn<Tournament> = (route) => {
  const api = inject(TournamentsApi);
  const router = inject(Router);
  const id = route.paramMap.get('id');
  if (!id) {
    return new RedirectCommand(router.parseUrl('/tournaments'));
  }
  return api.getById(id).pipe(
    catchError(() => of(new RedirectCommand(router.parseUrl('/tournaments')))),
  );
};
