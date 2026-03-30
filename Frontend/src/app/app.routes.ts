import { Routes } from '@angular/router';
import { Home } from './features/home/home';
import { TournamentDetailPage } from './features/tournaments/tournament-detail.page';
import { TournamentListPage } from './features/tournaments/tournament-list.page';
import { TournamentNewPage } from './features/tournaments/tournament-new.page';
import { PlaceholderPage } from './pages/placeholder.page';

export const routes: Routes = [
  { path: '', pathMatch: 'full', component: Home },
  { path: 'tournaments/new', component: TournamentNewPage },
  { path: 'tournaments/:id', component: TournamentDetailPage },
  { path: 'tournaments', component: TournamentListPage },
  { path: 'accommodations', component: PlaceholderPage },
  { path: 'login', component: PlaceholderPage },
  { path: 'register', component: PlaceholderPage },
  { path: '**', redirectTo: '', pathMatch: 'full' },
];
