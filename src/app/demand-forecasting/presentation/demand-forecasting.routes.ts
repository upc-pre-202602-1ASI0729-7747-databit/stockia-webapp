import { Routes } from '@angular/router';

/** Lazy loader for the demand forecast view. */
const forecastDashboard = () =>
  import('./views/forecast-dashboard/forecast-dashboard').then((m) => m.ForecastDashboard);

/** Lazy loader for the recommendation list view. */
const recommendationList = () =>
  import('./views/recommendation-list/recommendation-list').then((m) => m.RecommendationList);

/** Base title shown in the browser tab. */
const baseTitle = 'StockIA';

/** Routes of the ML and Recommendations bounded context. */
export const demandForecastingRoutes: Routes = [
  {
    path: 'forecast',
    loadComponent: forecastDashboard,
    title: `${baseTitle} - Predicción de demanda`,
  },
  {
    path: 'recommendations',
    loadComponent: recommendationList,
    title: `${baseTitle} - Recomendaciones`,
  },
  { path: '', redirectTo: 'forecast', pathMatch: 'full' },
];
