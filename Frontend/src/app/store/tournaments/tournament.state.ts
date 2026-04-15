import { TournamentState } from '../../shared/interfaces/tournament-state.interface';

export const initialTournamentState: TournamentState = {
  tournaments: [],
  isLoading: false,
  error: null,
  lastCreatedTournamentId: null,
};