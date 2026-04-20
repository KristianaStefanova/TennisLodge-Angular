import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DaysUntilRefreshService } from '../../../../core/services/days-until-refresh.service';
import { Tournament } from '../../../../shared/interfaces/tournament.interface';
import { TournamentCountdownMeta, getTournamentCountdownMeta } from '../../../../shared/utils/tournament-countdown.util';

@Component({
  selector: 'app-tournament-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, RouterLink],
  templateUrl: './tournament-item.component.html',
  styleUrl: './tournament-item.component.css',
})
export class TournamentItemComponent {
  readonly tournament = input.required<Tournament>();
  readonly daysUntilRefresh = inject(DaysUntilRefreshService);

  getCountdownMeta(startDate: Date): TournamentCountdownMeta {
    return getTournamentCountdownMeta(startDate, this.daysUntilRefresh.tick());
  }
}
