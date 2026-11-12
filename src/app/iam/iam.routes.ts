import {Routes} from '@angular/router';
import {administratorGuard, guestGuard} from './infrastructure/iam.guard';

const signIn = () => import('./presentation/views/sign-in/sign-in').then(m => m.SignIn);
const forgotPassword = () => import('./presentation/views/forgot-password/forgot-password').then(m => m.ForgotPassword);
const resetPassword = () => import('./presentation/views/reset-password/reset-password').then(m => m.ResetPassword);
const teamRoles = () => import('./presentation/views/team-roles/team-roles').then(m => m.TeamRoles);
const accountSettings = () => import('./presentation/views/account-settings/account-settings').then(m => m.AccountSettings);

/** Public views of Identity &amp; Access Management (/auth/...). */
export const iamAuthRoutes: Routes = [
  {path: 'sign-in', loadComponent: signIn, canActivate: [guestGuard], title: 'StockIA - Sign in'},
  {path: 'forgot-password', loadComponent: forgotPassword, canActivate: [guestGuard], title: 'StockIA - Forgot password'},
  {path: 'reset-password', loadComponent: resetPassword, title: 'StockIA - Reset password'}
];

/** Views of Identity &amp; Access Management inside the application (/app/...). */
export const iamAppRoutes: Routes = [
  {path: 'roles', loadComponent: teamRoles, canActivate: [administratorGuard], title: 'StockIA - Roles & permissions'},
  {path: 'settings/account', loadComponent: accountSettings, title: 'StockIA - Account settings'},
  {path: 'profile', redirectTo: 'settings/account', pathMatch: 'full'}
];
