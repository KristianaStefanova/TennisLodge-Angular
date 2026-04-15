import { createAction, props } from '@ngrx/store';
import { CreateTournamentData, Tournament } from '../../shared/interfaces/tournament.interface';

export const loadTournaments = createAction('[Tournament] Load Tournaments');

export const loadTournamentsSuccess = createAction(
  '[Tournament] Load Tournaments Success',
  props<{ tournaments: Tournament[] }>(),
);

export const loadTournamentsFailure = createAction(
  '[Tournament] Load Tournaments Failure',
  props<{ error: string }>(),
);

export const addTournament = createAction(
  '[Tournament] Add Tournament',
  props<{ payload: CreateTournamentData }>(),
);

export const addTournamentSuccess = createAction(
  '[Tournament] Add Tournament Success',
  props<{ tournament: Tournament }>(),
);

export const addTournamentFailure = createAction(
  '[Tournament] Add Tournament Failure',
  props<{ error: string }>(),
);

export const deleteTournament = createAction(
  '[Tournament] Delete Tournament',
  props<{ _id: string }>(),
);

export const deleteTournamentSuccess = createAction(
  '[Tournament] Delete Tournament Success',
  props<{ _id: string }>(),
);

export const deleteTournamentFailure = createAction(
  '[Tournament] Delete Tournament Failure',
  props<{ error: string }>(),
);

export const updateTournamentStatus = createAction(
  '[Tournament] Update Tournament Status',
  props<{ _id: string }>(),
);

export const updateTournamentStatusSuccess = createAction(
  '[Tournament] Update Tournament Status Success',
  props<{ _id: string }>(),
);

export const updateTournamentStatusFailure = createAction(
  '[Tournament] Update Tournament Status Failure',
  props<{ error: string }>(),
);

export const clearTournamentFeedback = createAction('[Tournament] Clear Tournament Feedback');
