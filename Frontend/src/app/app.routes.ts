import { Routes } from '@angular/router';
import { Home } from './features/home/home';
import { PlaceholderPage } from './pages/placeholder.page';

export const routes: Routes = [
  { path: '', pathMatch: 'full', component: Home },
  { path: 'tournaments', component: PlaceholderPage },
  { path: 'accommodations', component: PlaceholderPage },
  { path: 'login', component: PlaceholderPage },
  { path: 'register', component: PlaceholderPage },
  { path: '**', redirectTo: '', pathMatch: 'full' },
];
