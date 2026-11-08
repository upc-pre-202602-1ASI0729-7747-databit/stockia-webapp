import {Routes} from '@angular/router';

const settingsHub = () => import('./presentation/views/settings-hub/settings-hub').then(m => m.SettingsHub);
const helpCenter = () => import('./presentation/views/help-center/help-center').then(m => m.HelpCenter);

/** Settings menu and help, inside the application (/app/settings, /app/settings/help). */
export const sharedAppRoutes: Routes = [
  {path: 'settings', loadComponent: settingsHub, title: 'StockIA - Settings'},
  {path: 'settings/help', loadComponent: helpCenter, title: 'StockIA - Get help'}
];
