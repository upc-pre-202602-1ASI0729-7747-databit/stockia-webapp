import { Routes } from '@angular/router';


const baseTitle = 'StockIA';

export const inventoryRoutes: Routes = [
  {
    path: 'items',
    loadComponent: () =>
      import('./inventory-list/inventory-list.component').then((m) => m.InventoryListComponent),
    title: `${baseTitle} - Inventario`,
  },
  {
    path: 'recipes',
    loadComponent: () =>
      import('./recipe-list/recipe-list.component').then((m) => m.RecipeListComponent),
    title: `${baseTitle} - Recetas`,
  },
  { path: '', redirectTo: 'items', pathMatch: 'full' },
];
