import { Routes } from '@angular/router';
import { Home } from './features/home/home';
import { TournamentDetailShellPage } from './features/tournaments/pages/tournament-detail/tournament-detail-shell.page';
import { TournamentDetailPage } from './features/tournaments/pages/tournament-detail/tournament-detail.page';
import { tournamentDetailResolver } from './features/tournaments/pages/tournament-detail/tournament-detail.resolver';
import { TournamentListPage } from './features/tournaments/pages/tournament-list/tournament-list.page';
import { TournamentNewPage } from './features/tournaments/pages/tournament-new/tournament-new.page';
import { Login } from './features/auth/login/login';
import { Register } from './features/auth/register/register';
import { Profile } from './features/profile/profile';
import { NotFound } from './features/not-found/not-found';
import { PlaceholderPage } from './pages/placeholder.page';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', component: Home },
  { path: 'tournaments/new', component: TournamentNewPage, canActivate: [authGuard] },
  {
    path: 'tournaments/:id',
    component: TournamentDetailShellPage,
    resolve: { tournament: tournamentDetailResolver },
    children: [{ path: '', component: TournamentDetailPage }],
  },
  { path: 'tournaments', component: TournamentListPage },
  { path: 'accommodations', component: PlaceholderPage },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'profile', component: Profile, canActivate: [authGuard] },
  { path: '**', component: NotFound },
];
