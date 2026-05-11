import { Routes } from '@angular/router';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { AsteroidListComponent } from './features/asteroids/asteroid-list.component';
import { AsteroidDetailComponent } from './features/asteroids/detail/asteroid-detail.component';
import { StatsComponent } from './features/stats/stats.component';

export const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'asteroids', component: AsteroidListComponent },
  { path: 'asteroids/:id', component: AsteroidDetailComponent },
  { path: 'stats', component: StatsComponent },
  { path: '**', redirectTo: '' }
];
