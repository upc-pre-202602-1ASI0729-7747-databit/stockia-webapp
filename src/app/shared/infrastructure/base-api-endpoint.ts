import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { BaseEntity } from '../domain/model/base-entity';
import { BaseResource, BaseResponse } from './base-response';
import { BaseAssembler } from './base-assembler';
import { ApiError } from './api-error';

/**
 * Provides generic CRUD operations for a single REST endpoint of the StockIA Platform API.
 *
 * @remarks
 * Errors are translated into {@link ApiError}, so the application layer can read the problem title
 * (error code) and the localized detail sent by the API.
 *
 * @typeParam TEntity - Domain entity handled by the endpoint.
 * @typeParam TResource - Resource representation exchanged with the API.
 * @typeParam TResponse - Response envelope returned for collection queries.
 * @typeParam TAssembler - Mapper that translates between entities and resources.
 */
export abstract class BaseApiEndpoint<
  TEntity extends BaseEntity,
  TResource extends BaseResource,
  TResponse extends BaseResponse,
  TAssembler extends BaseAssembler<TEntity, TResource, TResponse>,
> {
  protected constructor(
    protected http: HttpClient,
    protected endpointUrl: string,
    protected assembler: TAssembler,
  ) {}

  /**
   * Fetches all entities from the configured endpoint.
   * @returns Stream with the mapped entity collection.
   */
  getAll(): Observable<TEntity[]> {
    return this.http.get<TResponse | TResource[]>(this.endpointUrl).pipe(
      map((response) =>
        Array.isArray(response)
          ? response.map((resource) => this.assembler.toEntityFromResource(resource))
          : this.assembler.toEntitiesFromResponse(response as TResponse),
      ),
      catchError(this.handleError),
    );
  }

  /**
   * Fetches a single entity by identifier.
   * @param id - Entity identifier.
   */
  getById(id: number): Observable<TEntity> {
    return this.http.get<TResource>(`${this.endpointUrl}/${id}`).pipe(
      map((resource) => this.assembler.toEntityFromResource(resource)),
      catchError(this.handleError),
    );
  }

  /**
   * Creates a new entity in the remote endpoint.
   * @param entity - Entity to persist.
   */
  create(entity: TEntity): Observable<TEntity> {
    return this.http.post<TResource>(this.endpointUrl, this.assembler.toResourceFromEntity(entity)).pipe(
      map((created) => this.assembler.toEntityFromResource(created)),
      catchError(this.handleError),
    );
  }

  /**
   * Updates an existing entity.
   * @param entity - Entity state to persist.
   * @param id - Identifier of the target entity.
   */
  update(entity: TEntity, id: number): Observable<TEntity> {
    return this.http.put<TResource>(`${this.endpointUrl}/${id}`, this.assembler.toResourceFromEntity(entity)).pipe(
      map((updated) => this.assembler.toEntityFromResource(updated)),
      catchError(this.handleError),
    );
  }

  /**
   * Deletes an entity by identifier.
   * @param id - Identifier of the entity to remove.
   */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.endpointUrl}/${id}`).pipe(catchError(this.handleError));
  }

  /**
   * Maps an HTTP error into a failed observable with an {@link ApiError}.
   */
  protected handleError = (error: unknown): Observable<never> => throwError(() => ApiError.from(error));
}
