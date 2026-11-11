import {computed, inject, Service, signal} from '@angular/core';
import {firstValueFrom} from 'rxjs';
import {IamApi} from '../infrastructure/iam-api';
import {SessionStorage} from '../infrastructure/session-storage';
import {UserAssembler} from '../infrastructure/user-assembler';
import {AuthenticatedUserResource} from '../infrastructure/users-response';
import {User} from '../domain/model/user.entity';
import {UserRole} from '../domain/model/user-role';
import {SignInCommand} from '../domain/model/sign-in.command';
import {PasswordResetRequest} from '../domain/model/password-reset-request';

/**
 * State of Identity &amp; Access Management: the session (token and signed-in user) and the team of the
 * restaurant. Components call its methods and read its signals; they never use HttpClient.
 * @author DataBit
 */
@Service()
export class IamStore {
  private readonly iamApi = inject(IamApi);
  private readonly assembler = new UserAssembler();
  private readonly tokenSignal = signal<string | null>(null);
  private readonly currentUserSignal = signal<User | null>(null);
  private readonly usersSignal = signal<User[]>([]);
  private readonly loadingUsersSignal = signal<boolean>(false);
  private readonly sessionExpiredSignal = signal<boolean>(false);

  readonly token = this.tokenSignal.asReadonly();
  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly users = this.usersSignal.asReadonly();
  readonly loadingUsers = this.loadingUsersSignal.asReadonly();
  readonly sessionExpired = this.sessionExpiredSignal.asReadonly();
  readonly isSignedIn = computed(() => this.tokenSignal() !== null && this.currentUserSignal() !== null);
  readonly isAdmin = computed(() => this.currentUserSignal()?.isAdmin ?? false);
  readonly lockedUsersCount = computed(() => this.usersSignal().filter(user => user.locked).length);

  constructor() {
    const session = SessionStorage.load();
    if (session) {
      this.tokenSignal.set(session.token);
      this.currentUserSignal.set(this.assembler.toEntityFromResource(session.user));
    }
  }

  /** Signs in and keeps the session (the API answers 401 with the attempts left, or 423 when locked). */
  async signIn(command: SignInCommand): Promise<User> {
    const authenticated = await firstValueFrom(this.iamApi.signIn(command));
    return this.startSession(authenticated);
  }

  /** Starts a session with the user and token the API returned (sign-in or restaurant sign-up). */
  startSession(authenticated: AuthenticatedUserResource): User {
    const {token, ...resource} = authenticated;
    SessionStorage.save({token, user: resource});
    this.tokenSignal.set(token);
    this.sessionExpiredSignal.set(false);
    const user = this.assembler.toEntityFromResource(resource);
    this.currentUserSignal.set(user);
    return user;
  }

  signOut(): void {
    SessionStorage.save(null);
    this.tokenSignal.set(null);
    this.currentUserSignal.set(null);
    this.usersSignal.set([]);
  }

  /** Called by the interceptor when the API rejects the token (expired or invalid). */
  expireSession(): void {
    if (!this.isSignedIn()) return;
    this.signOut();
    this.sessionExpiredSignal.set(true);
  }

  requestPasswordReset(email: string): Promise<PasswordResetRequest> {
    return firstValueFrom(this.iamApi.requestPasswordReset(email.trim()));
  }

  resetPassword(email: string, code: string, newPassword: string): Promise<void> {
    return firstValueFrom(this.iamApi.resetPassword(email.trim(), code.trim(), newPassword));
  }

  /** Refreshes the signed-in user (name, email and restaurant data). */
  async refreshCurrentUser(): Promise<void> {
    const user = await firstValueFrom(this.iamApi.getCurrentUser());
    this.updateCurrentUser(user);
  }

  async updateProfile(fullName: string, email: string): Promise<void> {
    const current = this.requireCurrentUser();
    const user = await firstValueFrom(this.iamApi.updateProfile(current.id, fullName.trim(), email.trim()));
    this.updateCurrentUser(user);
  }

  changePassword(currentPassword: string, newPassword: string): Promise<void> {
    return firstValueFrom(this.iamApi.changePassword(this.requireCurrentUser().id, currentPassword, newPassword));
  }

  /** Keeps the restaurant name of the session in step after the restaurant data changes. */
  renameRestaurant(name: string): void {
    const current = this.currentUserSignal();
    if (!current) return;
    current.restaurantName = name;
    this.updateCurrentUser(current);
  }

  loadUsers(): void {
    this.loadingUsersSignal.set(true);
    this.iamApi.getUsers().subscribe({
      next: users => {
        this.usersSignal.set(users);
        this.loadingUsersSignal.set(false);
      },
      error: () => this.loadingUsersSignal.set(false)
    });
  }

  async inviteMember(fullName: string, email: string, role: UserRole): Promise<User> {
    const user = await firstValueFrom(this.iamApi.inviteMember(fullName.trim(), email.trim(), role));
    this.usersSignal.update(users => [user, ...users]);
    return user;
  }

  async changeRole(user: User, role: UserRole): Promise<User> {
    const updated = await firstValueFrom(this.iamApi.changeRole(user.id, role));
    this.replaceUser(updated);
    return updated;
  }

  async unlock(user: User): Promise<User> {
    const updated = await firstValueFrom(this.iamApi.unlock(user.id));
    this.replaceUser(updated);
    return updated;
  }

  async removeMember(user: User): Promise<void> {
    await firstValueFrom(this.iamApi.removeMember(user.id));
    this.usersSignal.update(users => users.filter(member => member.id !== user.id));
  }

  private replaceUser(updated: User): void {
    this.usersSignal.update(users => users.map(user => (user.id === updated.id ? updated : user)));
    if (updated.id === this.currentUserSignal()?.id) this.updateCurrentUser(updated);
  }

  private updateCurrentUser(user: User): void {
    const token = this.tokenSignal();
    if (token) SessionStorage.save({token, user: this.assembler.toResourceFromEntity(user)});
    this.currentUserSignal.set(new User({
      id: user.id, fullName: user.fullName, email: user.email, role: user.role, restaurantId: user.restaurantId,
      restaurantName: user.restaurantName, restaurantAddress: user.restaurantAddress, restaurantPhone: user.restaurantPhone
    }));
  }

  private requireCurrentUser(): User {
    const user = this.currentUserSignal();
    if (!user) throw new Error('No session');
    return user;
  }
}
