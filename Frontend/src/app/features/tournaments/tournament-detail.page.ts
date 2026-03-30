import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { TournamentsService } from '../../core/services/tournaments.service';
import { Tournament } from '../../shared/interfaces/tournament';

@Component({
  selector: 'app-tournament-detail-page',
  standalone: true,
  imports: [DatePipe, RouterLink],
  templateUrl: './tournament-detail.page.html',
  styleUrl: './tournament-detail.page.css',
})
export class TournamentDetailPage implements OnInit {
  private readonly api = inject(TournamentsService);
  private readonly route = inject(ActivatedRoute);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly tournament = signal<Tournament | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.loading.set(false);
      this.error.set('Invalid tournament link.');
      return;
    }

    this.error.set(null);
    this.api
      .getById(id)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (t: Tournament) => this.tournament.set(t),
        error: (e: unknown) => {
          const msg = e instanceof Error ? e.message : 'Could not load this tournament.';
          this.error.set(msg);
        },
      });
  }
}
