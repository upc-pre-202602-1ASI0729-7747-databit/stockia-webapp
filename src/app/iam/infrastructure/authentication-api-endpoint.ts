import {HttpClient} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {catchError} from 'rxjs/operators';
import {environment} from '../../../environments/environment';
import {ApiError} from '../../shared/infrastructure/api-error';
import {AuthenticatedUserResource} from './users-response';
import {PasswordResetRequest} from '../domain/model/password-reset-request';

/**
 * Endpoint /authentication: sign-in (Login Controller) and password recovery (Password Reset Service).
 * @author DataBit
 */
export class AuthenticationApiEndpoint {
  private readonly endpointUrl = `${environment.platformProviderApiBaseUrl}${environment.platformProviderAuthenticationEndpointPath}`;

  constructor(private readonly http: HttpClient) {}

  signIn(email: string, password: string): Observable<AuthenticatedUserResource> {
    return this.http.post<AuthenticatedUserResource>(`${this.endpointUrl}/sign-in`, {email, password}).pipe(catchError(this.handleError));
  }

  requestPasswordReset(email: string): Observable<PasswordResetRequest> {
    return this.http.post<PasswordResetRequest>(`${this.endpointUrl}/password-reset-requests`, {email}).pipe(catchError(this.handleError));
  }

  resetPassword(email: string, code: string, newPassword: string): Observable<void> {
    return this.http.post<void>(`${this.endpointUrl}/password-resets`, {email, code, newPassword}).pipe(catchError(this.handleError));
  }

  private handleError = (error: unknown): Observable<never> => throwError(() => ApiError.from(error));
}
