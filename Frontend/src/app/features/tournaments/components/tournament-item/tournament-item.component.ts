import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DaysUntilRefreshService } from '../../../../core/services/days-until-refresh.service';
import { Tournament } from '../../../../shared/interfaces/tournament.interface';
import { DaysUntilPipe } from '../../../../shared/pipes/days-until.pipe';

@Component({
  selector: 'app-tournament-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, DaysUntilPipe, RouterLink],
  templateUrl: './tournament-item.component.html',
  styleUrl: './tournament-item.component.css',
})
export class TournamentItemComponent {
  readonly tournament = input.required<Tournament>();
  readonly daysUntilRefresh = inject(DaysUntilRefreshService);
}
