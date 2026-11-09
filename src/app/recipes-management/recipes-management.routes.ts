import {Routes} from '@angular/router';

const recipeList = () => import('./presentation/views/recipe-list/recipe-list').then(m => m.RecipeList);
const salesHistory = () => import('./presentation/views/sales-history/sales-history').then(m => m.SalesHistory);

export const recipesManagementRoutes: Routes = [
  {path: 'recipes', loadComponent: recipeList, title: 'StockIA - Recipes'},
  {path: 'sales', loadComponent: salesHistory, title: 'StockIA - Sales history'}
];
