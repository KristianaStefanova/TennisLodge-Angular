export interface Tournament {
    _id: string;
    tournamentName: string;
    tournamentOrganizer: string;
    tournamentCategory: string;
    tournamentStartDate: Date;
    tournamentEndDate: Date;
    tournamentLocation: string;
    tournamentSurface: string;
    createdAt: Date;
    tournamentContact: string;
    tournamentEmail: string;
    isDeleted: boolean;
    tournamentImageUrl: string;
}