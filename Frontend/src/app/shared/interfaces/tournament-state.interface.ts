import { Tournament } from "./tournament.interface";

export interface TournamentState {
  tournaments: Tournament[];
  isLoading: boolean;
  error: string | null;
  lastCreatedTournamentId: string | null;
}