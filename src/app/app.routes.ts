import { Routes } from '@angular/router';
import { Home } from './shared/presentation/views/home/home';
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

  { path: 'home', component: Home, title: `${baseTitle} - Inicio` },
  // Each team member registers their bounded context here with loadChildren, e.g.:
  // {
  //   path: 'inventory',
  //   loadChildren: () =>
  //     import('./inventory/presentation/inventory.routes').then((m) => m.inventoryRoutes),
  // },
  {
    path: 'dashboard',
    loadChildren: () =>
      import('./analytics-dashboard/presentation/dashboard.routes').then((m) => m.dashboardRoutes),
  },

  {
    path: 'inventory',
    loadChildren: () =>
      import('./product-inventory/presentation/inventory.routes').then((m) => m.inventoryRoutes),
  },
  {
    path: 'sales',
    loadChildren: () => import('./sales-order/presentation/sales.route').then((m) => m.salesRoutes),
  },
  {
    path: 'subscription',
    loadChildren: () =>
      import('./subscription/presentation/subscription.routes').then((m) => m.subscriptionRoutes),
  },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: '**', loadComponent: pageNotFound, title: `${baseTitle} - Página no encontrada` },
];
