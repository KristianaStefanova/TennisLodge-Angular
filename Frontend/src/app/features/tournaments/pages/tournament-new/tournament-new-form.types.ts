import { FormControl } from '@angular/forms';

export interface TournamentNewFormControls {
  tournamentName: FormControl<string>;
  tournamentOrganizer: FormControl<string>;
  tournamentCategory: FormControl<string>;
  tournamentSurface: FormControl<string>;
  tournamentDirector: FormControl<string>;
  officialBall: FormControl<string>;
  tournamentPrize: FormControl<string>;
  tournamentCountry: FormControl<string>;
  tournamentCity: FormControl<string>;
  tournamentLocation: FormControl<string>;
  tournamentStartDate: FormControl<string>;
  tournamentEndDate: FormControl<string>;
  entryDeadline: FormControl<string>;
  withdrawalDeadline: FormControl<string>;
  singlesQualifyingSignIn: FormControl<string>;
  singlesMainDrawSignIn: FormControl<string>;
  firstDaySinglesQualifying: FormControl<string>;
  firstDaySinglesMainDraw: FormControl<string>;
  singlesMainDrawSize: FormControl<string>;
  singlesQualifyingDrawSize: FormControl<string>;
  doublesMainDrawSize: FormControl<string>;
  tournamentContact: FormControl<string>;
  tournamentEmail: FormControl<string>;
  tournamentImageUrl: FormControl<string>;
}
