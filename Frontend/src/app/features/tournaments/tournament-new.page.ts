import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Tournament } from '../../shared/interfaces/tournament';
import { TournamentsApi } from './tournaments.api';

@Component({
  selector: 'app-tournament-new-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './tournament-new.page.html',
  styleUrl: './tournament-new.page.css',
})
export class TournamentNewPage {
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);

  model: Omit<Tournament, '_id' | 'createdAt'> = {
    tournamentName: '',
    tournamentOrganizer: '',
    tournamentCategory: '',
    tournamentStartDate: new Date(),
    tournamentEndDate: new Date(),
    tournamentLocation: '',
    tournamentSurface: 'Hard',
    tournamentContact: '',
    tournamentEmail: '',
    isDeleted: false,
    tournamentImageUrl: '',
  };

  constructor(
    private readonly api: TournamentsApi,
    private readonly router: Router,
  ) {}

  setStartDate(value: string): void {
    const d = new Date(value);
    if (!Number.isNaN(d.getTime())) {
      this.model.tournamentStartDate = d;
    }
  }

  setEndDate(value: string): void {
    const d = new Date(value);
    if (!Number.isNaN(d.getTime())) {
      this.model.tournamentEndDate = d;
    }
  }

  submit(): void {
    this.error.set(null);
    this.saving.set(true);

    const now = new Date();
    const payload: Tournament = {
      _id: '',
      createdAt: now,
      tournamentName: this.model.tournamentName.trim(),
      tournamentOrganizer: this.model.tournamentOrganizer.trim(),
      tournamentCategory: this.model.tournamentCategory.trim(),
      tournamentStartDate: this.model.tournamentStartDate,
      tournamentEndDate: this.model.tournamentEndDate,
      tournamentLocation: this.model.tournamentLocation.trim(),
      tournamentSurface: this.model.tournamentSurface.trim(),
      tournamentContact: this.model.tournamentContact.trim(),
      tournamentEmail: this.model.tournamentEmail.trim(),
      isDeleted: false,
      tournamentImageUrl: this.model.tournamentImageUrl.trim(),
    };

    this.api.create(payload).subscribe({
      next: async () => {
        this.saving.set(false);
        await this.router.navigateByUrl('/tournaments');
      },
      error: (e) => {
        this.saving.set(false);
        const msg = typeof e?.error?.message === 'string' ? e.error.message : e?.message;
        this.error.set(msg || 'Could not create tournament. Make sure you are logged in.');
      },
    });
  }
}

