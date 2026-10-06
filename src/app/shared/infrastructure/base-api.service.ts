import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

// Capa de infraestructura compartida (equivalente conceptual a BaseApi +
// BaseEndpoint de Qullqa, fusionados en una sola clase: en Angular, HttpClient
// ya es un cliente HTTP configurado centralmente vía inyección de dependencias,
// así que no hace falta una capa adicional de "cliente Axios" por separado).
//
// Cualquier `*-api.service.ts` de un bounded context puede extender esta clase
// para heredar las operaciones CRUD estándar contra un recurso REST del fake
// API, en vez de repetir `http.get/post/put/delete` en cada servicio de
// infraestructura. Solo hace falta implementar `endpoint()` con la ruta
// relativa del recurso (p.ej. '/users').
//
// IMPORTANTE: el fake API (`angular-in-memory-web-api`) NO soporta PATCH —
// `update()` siempre usa PUT enviando el objeto completo, incluyendo `id`.
export abstract class BaseApiService<T> {
  protected http = inject(HttpClient);

  /** Ruta relativa del recurso sobre `environment.apiBaseUrl` (p.ej. '/users'). */
  protected abstract endpoint(): string;

  /** URL absoluta (relativa al origen) del recurso, lista para usar en llamadas HTTP. */
  protected get resourceUrl(): string {
    return `${environment.apiBaseUrl}${this.endpoint()}`;
  }

  getAll(): Observable<T[]> {
    return this.http.get<T[]>(this.resourceUrl);
  }

  getById(id: number | string): Observable<T> {
    return this.http.get<T>(`${this.resourceUrl}/${id}`);
  }

  create(item: Partial<T>): Observable<T> {
    return this.http.post<T>(this.resourceUrl, item);
  }

  // El fake API no soporta PATCH: se envía el objeto completo con `id` incluido.
  update(id: number | string, item: Partial<T> & { id?: number | string }): Observable<T> {
    return this.http.put<T>(`${this.resourceUrl}/${id}`, { ...item, id });
  }

  delete(id: number | string): Observable<unknown> {
    return this.http.delete(`${this.resourceUrl}/${id}`);
  }
}
