import {Routes} from '@angular/router';
import {administratorGuard} from '../iam/infrastructure/iam.guard';

const forecastDashboard = () => import('./presentation/views/forecast-dashboard/forecast-dashboard').then(m => m.ForecastDashboard);
const recommendationsList = () => import('./presentation/views/recommendations-list/recommendations-list').then(m => m.RecommendationsList);

export const mlRecommendationsRoutes: Routes = [
  {path: 'forecast', loadComponent: forecastDashboard, title: 'StockIA - Demand forecast'},
  {path: 'recommendations', loadComponent: recommendationsList, canActivate: [administratorGuard], title: 'StockIA - Recommendations'}
];
