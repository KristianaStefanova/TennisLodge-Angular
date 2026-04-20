import { DatePipe } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { combineLatest } from 'rxjs';
import { filter, map, switchMap } from 'rxjs/operators';
import { NotificationService } from '../../../../core/services/notification.service';
import { DaysUntilRefreshService } from '../../../../core/services/days-until-refresh.service';
import { loadTournaments } from '../../../../store/tournaments/tournament.actions';
import { selectAllTournaments, selectTournamentById, selectTournamentsLoading } from '../../../../store/tournaments/tournament.selectors';
import { TournamentCountdownMeta, getTournamentCountdownMeta } from '../../../../shared/utils/tournament-countdown.util';

@Component({
  selector: 'app-tournament-detail-page',
  imports: [DatePipe, RouterLink],
  templateUrl: './tournament-detail.page.html',
  styleUrl: './tournament-detail.page.css',
})
export class TournamentDetailPage implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly store = inject(Store);
  private readonly notificationService = inject(NotificationService);
  private hasRedirectedForMissingTournament = false;
  readonly daysUntilRefresh = inject(DaysUntilRefreshService);

  getCountdownMeta(startDate: Date): TournamentCountdownMeta {
    return getTournamentCountdownMeta(startDate, this.daysUntilRefresh.tick());
  }

  readonly tournament = toSignal(
    this.route.paramMap.pipe(
      map((params) => params.get('id')),
      filter((id): id is string => Boolean(id)),
      switchMap((id) => this.store.select(selectTournamentById(id))),
    ),
    { initialValue: undefined },
  );

  ngOnInit(): void {
    this.store.dispatch(loadTournaments());

    combineLatest([
      this.route.paramMap.pipe(
        map((params) => params.get('id')),
        filter((id): id is string => Boolean(id)),
      ),
      this.store.select(selectAllTournaments),
      this.store.select(selectTournamentsLoading),
    ])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(async ([id, tournaments, loading]) => {
        if (loading || this.hasRedirectedForMissingTournament) {
          return;
        }
        const exists = tournaments.some((tournament) => tournament._id === id);
        if (!exists) {
          this.hasRedirectedForMissingTournament = true;
          this.notificationService.showError('Tournament not found or no longer available.');
          await this.router.navigate(['/tournaments']);
        }
      });
  }
}
