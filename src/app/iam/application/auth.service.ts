import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, map, of, tap } from 'rxjs';
import { IamApiService } from '../infrastructure/iam-api.service';
import { User } from '../domain/user.entity';
import { UserRole } from '../domain/role.enum';

const STORAGE_KEY = 'stockia.session';

// Capa de aplicación: coordina el caso de uso de autenticación y expone
// el estado reactivo de sesión a la capa de presentación (signals, al estilo
// de las stores Pinia de Qullqa, pero con las primitivas nativas de Angular).
@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = inject(IamApiService);
  private router = inject(Router);

  readonly currentUser = signal<User | null>(this.restoreSession());
  readonly isAuthenticated = () => this.currentUser() !== null;
  readonly isAdmin = () => this.currentUser()?.role === UserRole.ADMIN;

  private restoreSession(): User | null {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    try {
      return User.fromJson(JSON.parse(raw));
    } catch {
      return null;
    }
  }

  login(email: string, password: string) {
    return this.api.login(email, password).pipe(
      map((users) => {
        if (!users || users.length === 0) {
          throw new Error('Correo o contraseña incorrectos.');
        }
        return User.fromJson(users[0]);
      }),
      tap((user) => this.setSession(user)),
    );
  }

  register(payload: { fullName: string; email: string; restaurantName: string; password: string }) {
    return this.api
      .register({ ...payload, role: UserRole.ADMIN })
      .pipe(tap((user) => this.setSession(User.fromJson(user))));
  }

  logout() {
    localStorage.removeItem(STORAGE_KEY);
    this.currentUser.set(null);
    this.router.navigateByUrl('/auth/sign-in');
  }

  /** Edita el perfil del usuario autenticado (nombre, restaurante, correo y opcionalmente contraseña). */
  updateProfile(changes: { fullName: string; email: string; restaurantName: string; password?: string }) {
    const current = this.currentUser();
    if (!current) throw new Error('No hay sesión activa.');
    const payload: Partial<User> = { ...current, ...changes };
    if (!changes.password) delete payload.password;
    // No confiamos en el body de la respuesta del PUT (el fake API no siempre lo devuelve
    // completo): actualizamos la sesión con el payload que acabamos de confirmar que se guardó.
    return this.api.update(current.id, payload).pipe(
      map(() => new User(current.id, changes.fullName, changes.email, changes.restaurantName, current.role)),
      tap((user) => this.setSession(user)),
    );
  }

  private setSession(user: User) {
    const safeUser = new User(user.id, user.fullName, user.email, user.restaurantName, user.role);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(safeUser));
    this.currentUser.set(safeUser);
  }
}
