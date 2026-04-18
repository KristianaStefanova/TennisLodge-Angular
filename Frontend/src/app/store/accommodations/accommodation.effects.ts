import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap } from 'rxjs';
import { AccommodationsApi } from '../../core/services/accommodations.service';
import * as AccommodationActions from './accommodation.actions';

@Injectable()
export class AccommodationEffects {
  private readonly actions$ = inject(Actions);
  private readonly accommodationsApi = inject(AccommodationsApi);

  readonly loadAccommodations$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AccommodationActions.loadAccommodations),
      switchMap(() =>
        this.accommodationsApi.getAll().pipe(
          map((accommodations) => AccommodationActions.loadAccommodationsSuccess({ accommodations })),
          catchError((error: unknown) =>
            of(
              AccommodationActions.loadAccommodationsFailure({
                error: error instanceof Error ? error.message : 'Could not load accommodations.',
              }),
            ),
          ),
        ),
      ),
    ),
  );

  readonly addAccommodation$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AccommodationActions.addAccommodation),
      switchMap(({ payload }) =>
        this.accommodationsApi.create(payload).pipe(
          map((accommodation) => AccommodationActions.addAccommodationSuccess({ accommodation })),
          catchError((error: unknown) =>
            of(
              AccommodationActions.addAccommodationFailure({
                error: error instanceof Error ? error.message : 'Could not create accommodation.',
              }),
            ),
          ),
        ),
      ),
    ),
  );
}
