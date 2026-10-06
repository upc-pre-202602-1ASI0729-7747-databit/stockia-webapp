import { Routes } from '@angular/router';
//import { Home } from './shared/presentation/views/home/home';
import { authGuard, adminGuard } from './iam/infrastructure/auth.guard';

/** Lazy loader for the fallback view. */
const pageNotFound = () =>
  import('./shared/presentation/views/page-not-found/page-not-found').then((m) => m.PageNotFound);

/** Base title shown in the browser tab. */
const baseTitle = 'StockIA';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'auth/sign-in' },
  {
    path: 'auth/sign-in',
    loadComponent: () =>
      import('./iam/presentation/sign-in/sign-in.component').then((m) => m.SignInComponent),
  },
  {
    path: 'auth/sign-up',
    loadComponent: () =>
      import('./iam/presentation/sing-up/sign-up.component').then((m) => m.SignUpComponent),
  },
  {
    path: 'app',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./shared/presentation/shell/shell.component').then((m) => m.ShellComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./analytics-dashboard/presentation/dashboard.routes').then(
            (m) => m.dashboardRoutes,
          ),
      },
      {
        path: 'inventory',
        loadChildren: () =>
          import('./product-inventory/presentation/inventory.routes').then(
            (m) => m.inventoryRoutes,
          ),
      },
      {
        path: 'recipes',
        loadComponent: () =>
          import('./product-inventory/presentation/recipe-list/recipe-list.component').then(
            (m) => m.RecipeListComponent,
          ),
      },
      {
        path: 'sales',
        loadChildren: () =>
          import('./sales-order/presentation/sales.route').then((m) => m.salesRoutes),
      },
      {
        path: 'forecast',
        loadChildren: () =>
          import('./demand-forecasting/presentation/demand-forecasting.routes').then(
            (m) => m.demandForecastingRoutes,
          ),
      },
      {
        path: 'alerts',
        loadComponent: () =>
          import('./alerts/presentation/alerts-list/alerts-list.component').then(
            (m) => m.AlertsListComponent,
          ),
      },
      {
        path: 'recommendations',
        loadComponent: () =>
          import('./alerts/presentation/recommendations-list/recommendations-list.component').then(
            (m) => m.RecommendationsListComponent,
          ),
      },
      {
        path: 'roles',
        canActivate: [adminGuard],
        loadComponent: () =>
          import('./iam/presentation/roles-list/roles-list.component').then(
            (m) => m.RolesListComponent,
          ),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./iam/presentation/profile/profile.component').then((m) => m.ProfileComponent),
      },
      {
        path: 'subscription',
        loadChildren: () =>
          import('./subscription/presentation/subscription.routes').then(
            (m) => m.subscriptionRoutes,
          ),
      },
    ],
  },
  { path: '**', redirectTo: 'auth/sign-in' },
  //{ path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: '**', loadComponent: pageNotFound, title: `${baseTitle} - Página no encontrada` },
];
