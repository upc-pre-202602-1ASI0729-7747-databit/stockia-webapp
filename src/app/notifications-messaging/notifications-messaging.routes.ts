import { Routes } from '@angular/router';

const alertsList = () =>
  import('./presentation/views/alerts-list/alerts-list').then((m) => m.AlertsList);

export const notificationsMessagingRoutes: Routes = [
  { path: 'alerts', loadComponent: alertsList, title: 'StockIA - Alerts' },
];
