/**
 * Shape returned by the REST API (Mongo / JSON). Dates arrive as ISO strings.
 * Older documents may omit newer fields; the mapper fills defaults.
 */
export interface TournamentApiDto {
  _id: string;
  tournamentName: string;
  tournamentOrganizer: string;
  tournamentCategory: string;
  tournamentStartDate: string;
  tournamentEndDate: string;
  tournamentCountry?: string;
  tournamentCity?: string;
  tournamentLocation: string;
  tournamentSurface: string;
  createdAt?: string | Date;
  tournamentContact: string;
  tournamentEmail: string;
  isDeleted: boolean;
  tournamentImageUrl?: string;
  ownerId?: string;
  entryDeadline?: string;
  withdrawalDeadline?: string;
  singlesQualifyingSignIn?: string;
  singlesMainDrawSignIn?: string;
  firstDaySinglesQualifying?: string;
  firstDaySinglesMainDraw?: string;
  officialBall?: string;
  tournamentDirector?: string;
  tournamentPrize?: string;
  singlesMainDrawSize?: string;
  singlesQualifyingDrawSize?: string;
  doublesMainDrawSize?: string;
}
