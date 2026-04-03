import { Routes } from '@angular/router';
import { Home } from './features/home/home';
import { TournamentDetailShellPage } from './features/tournaments/pages/tournament-detail/tournament-detail-shell.page';
import { TournamentDetailPage } from './features/tournaments/pages/tournament-detail/tournament-detail.page';
import { tournamentDetailResolver } from './features/tournaments/pages/tournament-detail/tournament-detail.resolver';
import { TournamentListPage } from './features/tournaments/pages/tournament-list/tournament-list.page';
import { TournamentNewPage } from './features/tournaments/pages/tournament-new/tournament-new.page';
import { PlaceholderPage } from './pages/placeholder.page';

export const routes: Routes = [
  { path: '', pathMatch: 'full', component: Home },
  { path: 'tournaments/new', component: TournamentNewPage },
  {
    path: 'tournaments/:id',
    component: TournamentDetailShellPage,
    resolve: { tournament: tournamentDetailResolver },
    children: [{ path: '', component: TournamentDetailPage }],
  },
  { path: 'tournaments', component: TournamentListPage },
  { path: 'accommodations', component: PlaceholderPage },
  { path: 'login', component: PlaceholderPage },
  { path: 'register', component: PlaceholderPage },
  { path: '**', redirectTo: '', pathMatch: 'full' },
];
