import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {BaseApiEndpoint} from '../../shared/infrastructure/base-api-endpoint';
import {environment} from '../../../environments/environment';
import {User} from '../domain/model/user.entity';
import {UserRole} from '../domain/model/user-role';
import {UserAssembler} from './user-assembler';
import {UserResource, UsersResponse} from './users-response';

/**
 * Endpoint /users: team members (Administrator) and the profile of the signed-in user.
 * @author DataBit
 */
export class UsersApiEndpoint extends BaseApiEndpoint<User, UserResource, UsersResponse, UserAssembler> {
  constructor(http: HttpClient) {
    super(http, `${environment.platformProviderApiBaseUrl}${environment.platformProviderUsersEndpointPath}`, new UserAssembler());
  }

  getCurrent(): Observable<User> {
    return this.http.get<UserResource>(`${this.endpointUrl}/me`).pipe(map(resource => this.assembler.toEntityFromResource(resource)),
      catchError(this.handleError));
  }

  invite(fullName: string, email: string, role: UserRole): Observable<User> {
    return this.http.post<UserResource>(this.endpointUrl, {fullName, email, role}).pipe(
      map(resource => this.assembler.toEntityFromResource(resource)), catchError(this.handleError));
  }

  updateProfile(id: number, fullName: string, email: string): Observable<User> {
    return this.http.patch<UserResource>(`${this.endpointUrl}/${id}`, {fullName, email}).pipe(
      map(resource => this.assembler.toEntityFromResource(resource)), catchError(this.handleError));
  }

  changePassword(id: number, currentPassword: string, newPassword: string): Observable<void> {
    return this.http.post<void>(`${this.endpointUrl}/${id}/change-password`, {currentPassword, newPassword}).pipe(catchError(this.handleError));
  }

  changeRole(id: number, role: UserRole): Observable<User> {
    return this.http.patch<UserResource>(`${this.endpointUrl}/${id}/role`, {role}).pipe(
      map(resource => this.assembler.toEntityFromResource(resource)), catchError(this.handleError));
  }

  unlock(id: number): Observable<User> {
    return this.http.post<UserResource>(`${this.endpointUrl}/${id}/unlock`, {}).pipe(
      map(resource => this.assembler.toEntityFromResource(resource)), catchError(this.handleError));
  }
}
