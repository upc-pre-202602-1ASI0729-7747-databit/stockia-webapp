import {HttpErrorResponse, HttpInterceptorFn} from '@angular/common/http';
import {inject} from '@angular/core';
import {Router} from '@angular/router';
import {tap} from 'rxjs/operators';
import {IamStore} from '../application/iam.store';
import {environment} from '../../../environments/environment';

/**
 * Adds the bearer token of the session to every API request. When the API answers 401 to a request
 * that carried a token (expired or invalid session), the session is closed and the user goes back to
 * the sign-in view.
 * @author DataBit
 */
export const iamInterceptor: HttpInterceptorFn = (request, next) => {
  if (!request.url.startsWith(environment.platformProviderApiBaseUrl)) return next(request);
  const store = inject(IamStore);
  const router = inject(Router);
  const token = store.token();
  const isAuthentication = request.url.includes('/authentication/');
  const handledRequest = token && !isAuthentication
    ? request.clone({headers: request.headers.set('Authorization', `Bearer ${token}`)})
    : request;
  return next(handledRequest).pipe(tap({
    error: (error: unknown) => {
      if (error instanceof HttpErrorResponse && error.status === 401 && token && !isAuthentication) {
        store.expireSession();
        router.navigate(['/auth/sign-in'], {queryParams: {redirect: router.url}}).then();
      }
    }
  }));
};
