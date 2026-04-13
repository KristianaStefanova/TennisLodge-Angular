import { Routes } from '@angular/router';
import { tournamentDetailResolver } from './features/tournaments/pages/tournament-detail/tournament-detail.resolver';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./features/home/home').then((m) => m.Home),
  },
  {
    path: 'tournaments/new',
    loadComponent: () =>
      import('./features/tournaments/pages/tournament-new/tournament-new.page').then(
        (m) => m.TournamentNewPage,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'tournaments/:id',
    loadComponent: () =>
      import('./features/tournaments/pages/tournament-detail/tournament-detail-shell.page').then(
        (m) => m.TournamentDetailShellPage,
      ),
    resolve: { tournament: tournamentDetailResolver },
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/tournaments/pages/tournament-detail/tournament-detail.page').then(
            (m) => m.TournamentDetailPage,
          ),
      },
    ],
  },
  {
    path: 'tournaments',
    loadComponent: () =>
      import('./features/tournaments/pages/tournament-list/tournament-list.page').then(
        (m) => m.TournamentListPage,
      ),
  },
  {
    path: 'accommodations',
    loadComponent: () => import('./pages/placeholder.page').then((m) => m.PlaceholderPage),
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then((m) => m.Login),
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register').then((m) => m.Register),
  },
  {
    path: 'profile',
    loadComponent: () => import('./features/profile/profile').then((m) => m.Profile),
    canActivate: [authGuard],
  },
  {
    path: '**',
    loadComponent: () => import('./features/not-found/not-found').then((m) => m.NotFound),
  },
];
