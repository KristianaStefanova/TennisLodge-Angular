import { DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs/operators';
import { Tournament } from '../../shared/interfaces/tournament';

@Component({
  selector: 'app-tournament-detail-page',
  standalone: true,
  imports: [DatePipe, RouterLink],
  templateUrl: './tournament-detail.page.html',
  styleUrl: './tournament-detail.page.css',
})
export class TournamentDetailPage {
  private readonly route = inject(ActivatedRoute);

  readonly tournament = toSignal(
    this.route.parent!.data.pipe(map((d) => d['tournament'] as Tournament)),
  );
}
