import {Routes} from '@angular/router';
import {administratorGuard} from '../iam/infrastructure/iam.guard';

const plansPage = () => import('./presentation/views/plans-page/plans-page').then(m => m.PlansPage);

export const subscriptionPaymentsRoutes: Routes = [
  {path: 'settings/plans', loadComponent: plansPage, canActivate: [administratorGuard], title: 'StockIA - Upgrade plan'},
  {path: 'plans', redirectTo: 'settings/plans', pathMatch: 'full'}
];
