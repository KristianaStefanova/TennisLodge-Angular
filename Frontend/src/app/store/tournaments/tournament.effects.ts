import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap } from 'rxjs';
import { TournamentsApi } from '../../core/services/tournaments.service';
import * as TournamentActions from './tournament.actions';

@Injectable()
export class TournamentEffects {
  private readonly actions$ = inject(Actions);
  private readonly tournamentsApi = inject(TournamentsApi);

  readonly loadTournaments$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TournamentActions.loadTournaments),
      switchMap(() =>
        this.tournamentsApi.getAll().pipe(
          map((tournaments) => TournamentActions.loadTournamentsSuccess({ tournaments })),
          catchError((error: unknown) =>
            of(
              TournamentActions.loadTournamentsFailure({
                error: error instanceof Error ? error.message : 'Could not load tournaments.',
              }),
            ),
          ),
        ),
      ),
    ),
  );

  readonly addTournament$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TournamentActions.addTournament),
      switchMap(({ payload }) =>
        this.tournamentsApi.create(payload).pipe(
          map((tournament) => TournamentActions.addTournamentSuccess({ tournament })),
          catchError((error: unknown) =>
            of(
              TournamentActions.addTournamentFailure({
                error: error instanceof Error ? error.message : 'Could not create tournament.',
              }),
            ),
          ),
        ),
      ),
    ),
  );
}
