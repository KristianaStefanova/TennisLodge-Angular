import { createReducer, on } from '@ngrx/store';
import { initialTournamentState } from './tournament.state';
import * as TournamentActions from './tournament.actions';

export const tournamentFeatureKey = 'tournaments';

export const tournamentReducer = createReducer(
  initialTournamentState,
  on(TournamentActions.loadTournaments, (state) => ({
    ...state,
    isLoading: true,
    error: null,
    lastCreatedTournamentId: null,
  })),
  on(TournamentActions.loadTournamentsSuccess, (state, { tournaments }) => ({
    ...state,
    tournaments,
    isLoading: false,
    error: null,
    lastCreatedTournamentId: null,
  })),
  on(TournamentActions.loadTournamentsFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error,
    lastCreatedTournamentId: null,
  })),
  on(TournamentActions.addTournament, (state) => ({
    ...state,
    isLoading: true,
    error: null,
    lastCreatedTournamentId: null,
  })),
  on(TournamentActions.addTournamentSuccess, (state, { tournament }) => ({
    ...state,
    tournaments: [...state.tournaments, tournament],
    isLoading: false,
    error: null,
    lastCreatedTournamentId: tournament._id,
  })),
  on(TournamentActions.addTournamentFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error,
    lastCreatedTournamentId: null,
  })),
  on(TournamentActions.deleteTournament, (state) => ({
    ...state,
    isLoading: true,
    error: null,
  })),
  on(TournamentActions.deleteTournamentSuccess, (state, { _id }) => ({
    ...state,
    tournaments: state.tournaments.filter((tournament) => tournament._id !== _id),
    isLoading: false,
    error: null,
    lastCreatedTournamentId: null,
  })),
  on(TournamentActions.deleteTournamentFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error,
  })),
  on(TournamentActions.updateTournamentStatus, (state) => ({
    ...state,
    isLoading: true,
    error: null,
  })),
  on(TournamentActions.updateTournamentStatusSuccess, (state, { _id }) => ({
    ...state,
    tournaments: state.tournaments.map((tournament) =>
      tournament._id === _id
        ? {
            ...tournament,
            isDeleted: !tournament.isDeleted,
          }
        : tournament,
    ),
    isLoading: false,
    error: null,
    lastCreatedTournamentId: null,
  })),
  on(TournamentActions.updateTournamentStatusFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error,
  })),
  on(TournamentActions.clearTournamentFeedback, (state) => ({
    ...state,
    error: null,
    lastCreatedTournamentId: null,
  })),
);
