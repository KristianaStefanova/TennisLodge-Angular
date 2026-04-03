import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { DEFAULT_TOURNAMENT_SURFACE, TOURNAMENT_SURFACE_OPTIONS } from '../../shared/constants/tournament-surfaces';
import { Tournament } from '../../shared/interfaces/tournament';
import { TournamentsApi } from '../../core/services/tournaments.service';

type TournamentDateKey =
  | 'tournamentStartDate'
  | 'tournamentEndDate'
  | 'entryDeadline'
  | 'withdrawalDeadline'
  | 'firstDaySinglesQualifying'
  | 'firstDaySinglesMainDraw';

type TournamentDateTimeKey = 'singlesQualifyingSignIn' | 'singlesMainDrawSignIn';

@Component({
  selector: 'app-tournament-new-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './tournament-new.page.html',
  styleUrl: './tournament-new.page.css',
})
export class TournamentNewPage {
  readonly surfaceOptions = [...TOURNAMENT_SURFACE_OPTIONS];
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  private readonly api = inject(TournamentsApi);
  private readonly router = inject(Router);

  model: Omit<Tournament, '_id' | 'createdAt' | 'ownerId'> = {
    tournamentName: '',
    tournamentOrganizer: '',
    tournamentCategory: '',
    tournamentStartDate: new Date(),
    tournamentEndDate: new Date(),
    tournamentCountry: '',
    tournamentCity: '',
    tournamentLocation: '',
    tournamentSurface: DEFAULT_TOURNAMENT_SURFACE,
    tournamentContact: '',
    tournamentEmail: '',
    isDeleted: false,
    tournamentImageUrl: '',
    entryDeadline: new Date(),
    withdrawalDeadline: new Date(),
    singlesQualifyingSignIn: new Date(),
    singlesMainDrawSignIn: new Date(),
    firstDaySinglesQualifying: new Date(),
    firstDaySinglesMainDraw: new Date(),
    officialBall: '',
    tournamentDirector: '',
    tournamentPrize: '',
    singlesMainDrawSize: '',
    singlesQualifyingDrawSize: '',
    doublesMainDrawSize: '',
  };

  formatDateInput(d: Date): string {
    if (!d || Number.isNaN(d.getTime())) {
      return '';
    }
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  /** For `input type="datetime-local"` (local date + time, minute precision). */
  formatDateTimeLocal(d: Date): string {
    if (!d || Number.isNaN(d.getTime())) {
      return '';
    }
    const pad = (n: number) => String(n).padStart(2, '0');
    const y = d.getFullYear();
    const mo = pad(d.getMonth() + 1);
    const day = pad(d.getDate());
    const h = pad(d.getHours());
    const min = pad(d.getMinutes());
    return `${y}-${mo}-${day}T${h}:${min}`;
  }

  setDateField(field: TournamentDateKey, value: string): void {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      this.model[field] = parsed;
    }
  }

  setDateTimeField(field: TournamentDateTimeKey, value: string): void {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      this.model[field] = parsed;
    }
  }

  submit(): void {
    this.error.set(null);
    this.saving.set(true);

    const now = new Date();
    const prize = this.model.tournamentPrize?.trim();
    const sq = this.model.singlesQualifyingDrawSize?.trim();
    const dq = this.model.doublesMainDrawSize?.trim();

    const payload: Tournament = {
      _id: '',
      createdAt: now,
      tournamentName: this.model.tournamentName.trim(),
      tournamentOrganizer: this.model.tournamentOrganizer.trim(),
      tournamentCategory: this.model.tournamentCategory.trim(),
      tournamentStartDate: this.model.tournamentStartDate,
      tournamentEndDate: this.model.tournamentEndDate,
      tournamentCountry: this.model.tournamentCountry.trim(),
      tournamentCity: this.model.tournamentCity.trim(),
      tournamentLocation: this.model.tournamentLocation.trim(),
      tournamentSurface: this.model.tournamentSurface.trim(),
      tournamentContact: this.model.tournamentContact.trim(),
      tournamentEmail: this.model.tournamentEmail.trim(),
      isDeleted: false,
      tournamentImageUrl: this.model.tournamentImageUrl.trim(),
      entryDeadline: this.model.entryDeadline,
      withdrawalDeadline: this.model.withdrawalDeadline,
      singlesQualifyingSignIn: this.model.singlesQualifyingSignIn,
      singlesMainDrawSignIn: this.model.singlesMainDrawSignIn,
      firstDaySinglesQualifying: this.model.firstDaySinglesQualifying,
      firstDaySinglesMainDraw: this.model.firstDaySinglesMainDraw,
      officialBall: this.model.officialBall.trim(),
      tournamentDirector: this.model.tournamentDirector.trim(),
      singlesMainDrawSize: this.model.singlesMainDrawSize.trim(),
    };

    if (prize) {
      payload.tournamentPrize = prize;
    }
    if (sq) {
      payload.singlesQualifyingDrawSize = sq;
    }
    if (dq) {
      payload.doublesMainDrawSize = dq;
    }

    this.api.create(payload).subscribe({
      next: async () => {
        this.saving.set(false);
        await this.router.navigateByUrl('/tournaments');
      },
      error: (e: unknown) => {
        this.saving.set(false);
        const err = e as { error?: { message?: unknown }; message?: unknown };
        const msg =
          typeof err?.error?.message === 'string'
            ? err.error.message
            : typeof err?.message === 'string'
              ? err.message
              : null;
        this.error.set(msg || 'Could not create tournament. Make sure you are logged in.');
      },
    });
  }
}
