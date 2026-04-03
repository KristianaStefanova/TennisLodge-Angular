import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { TournamentsApi } from '../../../../core/services/tournaments.service';
import { Tournament } from '../../../../shared/interfaces/tournament';
import { TournamentItemComponent } from '../../components/tournament-item/tournament-item.component';

@Component({
  selector: 'app-tournament-list-page',
  imports: [RouterLink, TournamentItemComponent],
  templateUrl: './tournament-list.page.html',
  styleUrl: './tournament-list.page.css',
})
export class TournamentListPage implements OnInit {
  private readonly api = inject(TournamentsApi);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly tournaments = signal<Tournament[]>([]);

  ngOnInit(): void {
    this.error.set(null);
    this.api
      .getAll()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (items: Tournament[]) => this.tournaments.set(items),
        error: (e: unknown) => {
          const msg = e instanceof Error ? e.message : 'Could not load tournaments.';
          this.error.set(msg);
        },
      });
  }
}
