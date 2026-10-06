import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService } from '../../shared/infrastructure/base-api.service';
import { User } from '../domain/user.entity';
import { UserRole } from '../domain/role.enum';

// Capa de infraestructura: única parte del contexto IAM que conoce HTTP.
// Extiende BaseApiService para heredar getAll/getById/create/update/delete
// contra /users — login() y register() quedan específicos de IAM porque no
// son operaciones CRUD genéricas (login es una consulta con credenciales,
// no una búsqueda por id). Al conectar el backend real, solo este archivo
// (y el endpoint) deberían cambiar.
@Injectable({ providedIn: 'root' })
export class IamApiService extends BaseApiService<User> {
  protected endpoint(): string {
    return '/users';
  }

  register(user: Partial<User>): Observable<User> {
    return this.create(user);
  }

  login(email: string, password: string): Observable<User[]> {
    return this.http.get<User[]>(
      `${this.resourceUrl}?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`,
    );
  }

  // El fake API no soporta PATCH (solo GET/POST/PUT/DELETE): se envía el usuario completo.
  updateRole(user: User, role: UserRole): Observable<User> {
    return this.update(user.id, { ...user, role });
  }
}
