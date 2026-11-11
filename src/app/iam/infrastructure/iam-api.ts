import {inject, Service} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {BaseApi} from '../../shared/infrastructure/base-api';
import {User} from '../domain/model/user.entity';
import {UserRole} from '../domain/model/user-role';
import {SignInCommand} from '../domain/model/sign-in.command';
import {PasswordResetRequest} from '../domain/model/password-reset-request';
import {AuthenticationApiEndpoint} from './authentication-api-endpoint';
import {UsersApiEndpoint} from './users-api-endpoint';
import {AuthenticatedUserResource} from './users-response';

/**
 * Facade of the Identity &amp; Access Management API for the application layer.
 * @author DataBit
 */
@Service()
export class IamApi extends BaseApi {
  private readonly http = inject(HttpClient);
  private readonly authenticationEndpoint = new AuthenticationApiEndpoint(this.http);
  private readonly usersEndpoint = new UsersApiEndpoint(this.http);

  signIn(command: SignInCommand): Observable<AuthenticatedUserResource> {
    return this.authenticationEndpoint.signIn(command.email, command.password);
  }

  requestPasswordReset(email: string): Observable<PasswordResetRequest> {
    return this.authenticationEndpoint.requestPasswordReset(email);
  }

  resetPassword(email: string, code: string, newPassword: string): Observable<void> {
    return this.authenticationEndpoint.resetPassword(email, code, newPassword);
  }

  getUsers(): Observable<User[]> {
    return this.usersEndpoint.getAll();
  }

  getCurrentUser(): Observable<User> {
    return this.usersEndpoint.getCurrent();
  }

  inviteMember(fullName: string, email: string, role: UserRole): Observable<User> {
    return this.usersEndpoint.invite(fullName, email, role);
  }

  updateProfile(id: number, fullName: string, email: string): Observable<User> {
    return this.usersEndpoint.updateProfile(id, fullName, email);
  }

  changePassword(id: number, currentPassword: string, newPassword: string): Observable<void> {
    return this.usersEndpoint.changePassword(id, currentPassword, newPassword);
  }

  changeRole(id: number, role: UserRole): Observable<User> {
    return this.usersEndpoint.changeRole(id, role);
  }

  unlock(id: number): Observable<User> {
    return this.usersEndpoint.unlock(id);
  }

  removeMember(id: number): Observable<void> {
    return this.usersEndpoint.delete(id);
  }
}
