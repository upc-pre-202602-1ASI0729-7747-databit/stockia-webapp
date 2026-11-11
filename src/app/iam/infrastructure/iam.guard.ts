import {inject} from '@angular/core';
import {CanActivateFn, Router} from '@angular/router';
import {IamStore} from '../application/iam.store';
import {NotificationService} from '../../shared/application/notification.service';

/**
 * Protected views need a session; otherwise the user goes to /auth/sign-in and comes back after it.
 * @author DataBit
 */
export const authenticationGuard: CanActivateFn = (route, state) => {
  const store = inject(IamStore);
  if (store.isSignedIn()) return true;
  return inject(Router).createUrlTree(['/auth/sign-in'], {queryParams: {redirect: state.url}});
};

/**
 * Administrator-only views (Roles &amp; permissions, Recommendations, Upgrade plan): an Employee stays on
 * the dashboard and sees why.
 */
export const administratorGuard: CanActivateFn = () => {
  if (inject(IamStore).isAdmin()) return true;
  inject(NotificationService).error(null, 'access.denied-detail');
  return inject(Router).createUrlTree(['/app/dashboard']);
};

/**
 * Sign-in and sign-up are skipped when there is already a session.
 */
export const guestGuard: CanActivateFn = () => {
  if (!inject(IamStore).isSignedIn()) return true;
  return inject(Router).createUrlTree(['/app/dashboard']);
};
