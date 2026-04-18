import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { accommodationEditResolver } from './features/accommodations/resolvers/accommodation-edit.resolver';

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
    path: 'accommodations/new',
    loadComponent: () =>
      import('./features/accommodations/pages/accommodation-new/accommodation-new.page').then(
        (m) => m.AccommodationNewPage,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'accommodations/mine',
    loadComponent: () =>
      import('./features/accommodations/pages/accommodation-mine/accommodation-mine.page').then(
        (m) => m.AccommodationMinePage,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'accommodations/:id/edit',
    loadComponent: () =>
      import('./features/accommodations/pages/accommodation-edit/accommodation-edit.page').then(
        (m) => m.AccommodationEditPage,
      ),
    canActivate: [authGuard],
    resolve: { accommodation: accommodationEditResolver },
  },
  {
    path: 'accommodations/:id',
    loadComponent: () =>
      import('./features/accommodations/pages/accommodation-detail/accommodation-detail.page').then(
        (m) => m.AccommodationDetailPage,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'accommodations',
    loadComponent: () =>
      import('./features/accommodations/pages/accommodation-list/accommodation-list.page').then(
        (m) => m.AccommodationListPage,
      ),
    canActivate: [authGuard],
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
