import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-tournament-detail-shell-page',
  standalone: true,
  imports: [RouterOutlet],
  template: '<router-outlet />',
})
export class TournamentDetailShellPage {}
