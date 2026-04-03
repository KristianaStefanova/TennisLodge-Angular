import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Tournament } from '../../../../shared/interfaces/tournament';

@Component({
  selector: 'app-tournament-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, RouterLink],
  templateUrl: './tournament-item.component.html',
  styleUrl: './tournament-item.component.css',
})
export class TournamentItemComponent {
  readonly tournament = input.required<Tournament>();
}
