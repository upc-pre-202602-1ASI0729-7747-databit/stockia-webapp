import {Routes} from '@angular/router';
import {authenticationGuard} from './iam/infrastructure/iam.guard';
import {iamAuthRoutes, iamAppRoutes} from './iam/iam.routes';
import {restaurantRegistrationRoutes} from './restaurant-registration/restaurant-registration.routes';
import {analyticsDashboardRoutes} from './analytics-dashboard/analytics-dashboard.routes';
import {stockManagementRoutes} from './stock-management/stock-management.routes';
import {recipesManagementRoutes} from './recipes-management/recipes-management.routes';
import {mlRecommendationsRoutes} from './ml-recommendations/ml-recommendations.routes';
import {notificationsMessagingRoutes} from './notifications-messaging/notifications-messaging.routes';
import {subscriptionPaymentsRoutes} from './subscription-payments/subscription-payments.routes';
import {sharedAppRoutes} from './shared/shared.routes';

const layout = () => import('./shared/presentation/components/layout/layout').then(m => m.Layout);
const terms = () => import('./shared/presentation/views/terms/terms').then(m => m.Terms);
const pageNotFound = () => import('./shared/presentation/views/page-not-found/page-not-found').then(m => m.PageNotFound);

/**
 * Root routes. Public views live under /auth (the paths the landing page buttons open: /auth/sign-in
 * and /auth/sign-up) and the application under /app, protected by the authentication guard. Each
 * bounded context contributes its own routes; every view is loaded lazily.
 */
export const routes: Routes = [
  {path: '', redirectTo: '/auth/sign-in', pathMatch: 'full'},
  {path: 'auth', children: [...iamAuthRoutes, ...restaurantRegistrationRoutes, {path: '', redirectTo: 'sign-in', pathMatch: 'full'}]},
  {path: 'terms', loadComponent: terms, title: 'StockIA - Terms of service'},
  {
    path: 'app', loadComponent: layout, canActivate: [authenticationGuard], canActivateChild: [authenticationGuard],
    children: [
      {path: '', redirectTo: 'dashboard', pathMatch: 'full'},
      ...analyticsDashboardRoutes,
      ...stockManagementRoutes,
      ...recipesManagementRoutes,
      ...mlRecommendationsRoutes,
      ...notificationsMessagingRoutes,
      ...iamAppRoutes,
      ...subscriptionPaymentsRoutes,
      ...sharedAppRoutes
    ]
  },
  {path: '**', loadComponent: pageNotFound, title: 'StockIA - Page not found'}
];
