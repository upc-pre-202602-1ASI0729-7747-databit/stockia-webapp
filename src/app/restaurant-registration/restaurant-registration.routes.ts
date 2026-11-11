import {Routes} from '@angular/router';
import {guestGuard} from '../iam/infrastructure/iam.guard';

const signUp = () => import('./presentation/views/sign-up/sign-up').then(m => m.SignUp);

/** Restaurant sign-up (/auth/sign-up, the "Start free" button of the landing page). */
export const restaurantRegistrationRoutes: Routes = [
  {path: 'sign-up', loadComponent: signUp, canActivate: [guestGuard], title: 'StockIA - Sign up'}
];
