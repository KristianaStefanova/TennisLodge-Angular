export interface Tournament {
  _id: string;
  tournamentName: string;
  tournamentOrganizer: string;
  tournamentCategory: string;
  tournamentStartDate: Date;
  tournamentEndDate: Date;
  tournamentCountry: string;
  tournamentCity: string;
  tournamentLocation: string;
  tournamentSurface: string;
  createdAt: Date;
  tournamentContact: string;
  tournamentEmail: string;
  isDeleted: boolean;
  tournamentImageUrl: string;
  ownerId?: string;
  entryDeadline: Date;
  withdrawalDeadline: Date;
  singlesQualifyingSignIn: Date;
  singlesMainDrawSignIn: Date;
  firstDaySinglesQualifying: Date;
  firstDaySinglesMainDraw: Date;
  officialBall: string;
  tournamentDirector: string;
  tournamentPrize?: string;
  singlesMainDrawSize: string;
  singlesQualifyingDrawSize?: string;
  doublesMainDrawSize?: string;
}

export interface CreateTournamentData extends Omit<Tournament, '_id' | 'createdAt' | 'ownerId'> {}
