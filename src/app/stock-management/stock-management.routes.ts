import {Routes} from '@angular/router';

const inventoryList = () => import('./presentation/views/inventory-list/inventory-list').then(m => m.InventoryList);

export const stockManagementRoutes: Routes = [
  {path: 'inventory', loadComponent: inventoryList, title: 'StockIA - Inventory'}
];
