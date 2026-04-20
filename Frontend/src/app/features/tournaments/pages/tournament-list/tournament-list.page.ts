import { AsyncPipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { TournamentItemComponent } from '../../components/tournament-item/tournament-item.component';
import { loadTournaments } from '../../../../store/tournaments/tournament.actions';
import { Tournament } from '../../../../shared/interfaces/tournament.interface';
import {
  selectAllTournaments,
  selectTournamentsError,
  selectTournamentsLoading,
} from '../../../../store/tournaments/tournament.selectors';

@Component({
  selector: 'app-tournament-list-page',
  imports: [TournamentItemComponent, AsyncPipe],
  templateUrl: './tournament-list.page.html',
  styleUrl: './tournament-list.page.css',
})
export class TournamentListPage implements OnInit {
  private readonly store = inject(Store);

  readonly loading$: Observable<boolean> = this.store.select(selectTournamentsLoading);
  readonly error$: Observable<string | null> = this.store.select(selectTournamentsError);
  readonly tournaments$: Observable<Tournament[]> = this.store.select(selectAllTournaments);

  ngOnInit(): void {
    this.store.dispatch(loadTournaments());
  }
}
