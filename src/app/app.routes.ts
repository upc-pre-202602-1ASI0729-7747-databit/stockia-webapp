import { Routes } from '@angular/router';
import { Home } from './shared/presentation/views/home/home';

/** Lazy loader for the fallback view. */
const pageNotFound = () =>
  import('./shared/presentation/views/page-not-found/page-not-found').then((m) => m.PageNotFound);

/** Base title shown in the browser tab. */
const baseTitle = 'StockIA';

export const routes: Routes = [
  { path: 'home', component: Home, title: `${baseTitle} - Inicio` },
  // Each team member registers their bounded context here with loadChildren, e.g.:
  // {
  //   path: 'inventory',
  //   loadChildren: () =>
  //     import('./inventory/presentation/inventory.routes').then((m) => m.inventoryRoutes),
  // },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: '**', loadComponent: pageNotFound, title: `${baseTitle} - Página no encontrada` },
];
