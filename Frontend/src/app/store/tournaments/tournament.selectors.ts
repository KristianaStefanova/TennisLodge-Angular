import { createFeatureSelector, createSelector } from '@ngrx/store';
import { TournamentState } from '../../shared/interfaces/tournament-state.interface';
import { tournamentFeatureKey } from './tournament.reducer';

export const selectTournamentState = createFeatureSelector<TournamentState>(tournamentFeatureKey);

export const selectAllTournaments = createSelector(
  selectTournamentState,
  (state) => state.tournaments,
);

export const selectTournamentsLoading = createSelector(
  selectTournamentState,
  (state) => state.isLoading,
);

export const selectTournamentsError = createSelector(
  selectTournamentState,
  (state) => state.error,
);

export const selectLastCreatedTournamentId = createSelector(
  selectTournamentState,
  (state) => state.lastCreatedTournamentId,
);

export const selectTournamentById = (id: string) =>
  createSelector(selectAllTournaments, (tournaments) => tournaments.find((tournament) => tournament._id === id));
