import { Routes } from '@angular/router';

const baseTitle = 'StockIA';

export const salesRoutes: Routes = [
  {
    path: 'history',
    loadComponent: () =>
      import('./sales-history/sales-history.component').then((m) => m.SalesHistoryComponent),
    title: `${baseTitle} - Historial de ventas`,
  },
  { path: '', redirectTo: 'history', pathMatch: 'full' },
];
