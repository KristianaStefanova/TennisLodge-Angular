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
    /** Present when returned from API (for edit/delete ownership checks later). */
    ownerId?: string;
}