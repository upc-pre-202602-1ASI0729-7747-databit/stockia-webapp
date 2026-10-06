import { Routes } from '@angular/router';

const baseTitle = 'StockIA';

export const dashboardRoutes: Routes = [
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./analytics-dashboard/analytics-dashboard.component').then(
        (m) => m.AnalyticsDashboardComponent),
    title: `${baseTitle} - Dashboard`,
  },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
];
