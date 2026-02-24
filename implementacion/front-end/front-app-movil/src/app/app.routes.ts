import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  
  // Auth module (lazy loaded)
  {
    path: 'auth',
    loadChildren: () => import('./modules/auth/auth.module').then(m => m.AuthModule)
  },

  // Dashboard module (lazy loaded, protected)
  {
    path: 'dashboard',
    loadChildren: () => import('./modules/dashboard/dashboard.module').then(m => m.DashboardModule),
    canActivate: [AuthGuard]
  },

  // Alarm module (lazy loaded, protected)
  {
    path: 'alarm',
    loadChildren: () => import('./modules/alarm/alarm.module').then(m => m.AlarmModule),
    canActivate: [AuthGuard]
  },

  // Settings module (lazy loaded, protected)
  {
    path: 'settings',
    loadChildren: () => import('./modules/settings/settings.module').then(m => m.SettingsModule),
    canActivate: [AuthGuard]
  },

  // Fallback
  { path: '**', redirectTo: '/dashboard' }
];
