/**
 * Shape returned by the REST API (Mongo / JSON). Dates arrive as ISO strings.
 */
export interface TournamentApiDto {
  _id: string;
  tournamentName: string;
  tournamentOrganizer: string;
  tournamentCategory: string;
  tournamentStartDate: string;
  tournamentEndDate: string;
  tournamentLocation: string;
  tournamentSurface: string;
  createdAt?: string | Date;
  tournamentContact: string;
  tournamentEmail: string;
  isDeleted: boolean;
  tournamentImageUrl?: string;
  ownerId?: string;
}
