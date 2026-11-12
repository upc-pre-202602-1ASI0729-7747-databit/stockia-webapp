import {Routes} from '@angular/router';

const businessDashboard = () => import('./presentation/views/business-dashboard/business-dashboard').then(m => m.BusinessDashboard);

export const analyticsDashboardRoutes: Routes = [
  {path: 'dashboard', loadComponent: businessDashboard, title: 'StockIA - Dashboard'}
];
