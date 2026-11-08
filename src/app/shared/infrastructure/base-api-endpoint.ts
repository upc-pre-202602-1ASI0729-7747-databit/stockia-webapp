import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';
import { BaseAssembler } from './base-assembler';
import { BaseEntity } from './base-entity';
import { BaseResource, BaseResponse } from './base-response';

/**
 * Generic CRUD client for a single REST endpoint.
 * Bounded contexts extend it once per resource and supply the assembler that
 * translates between API resources and domain entities.
 *
 * @typeParam TEntity - Domain entity handled by the endpoint.
 * @typeParam TResource - API representation of a single entity.
 * @typeParam TResponse - API envelope returned when listing entities.
 * @typeParam TAssembler - Assembler converting between the types above.
 */
export abstract class BaseApiEndpoint<
  TEntity extends BaseEntity,
  TResource extends BaseResource,
  TResponse extends BaseResponse,
  TAssembler extends BaseAssembler<TEntity, TResource, TResponse>,
> {
  /**
   * @param http - HTTP client used to perform the requests.
   * @param endpointUrl - Absolute URL of the endpoint collection.
   * @param assembler - Assembler converting between resources and entities.
   */
  protected constructor(
    protected http: HttpClient,
    protected endpointUrl: string,
    protected assembler: TAssembler,
  ) {}

  /**
   * Retrieves every entity exposed by the endpoint.
   * Supports both plain array payloads and enveloped responses.
   *
   * @returns An observable emitting the list of entities.
   */
  getAll(): Observable<TEntity[]> {
    return this.http.get<TResponse | TResource[]>(this.endpointUrl).pipe(
      map((response) =>
        Array.isArray(response)
          ? response.map((resource) => this.assembler.toEntityFromResource(resource))
          : this.assembler.toEntitiesFromResponse(response),
      ),
      catchError(this.handleError('Failed to fetch entities')),
    );
  }

  /**
   * Retrieves a single entity by its identifier.
   *
   * @param id - Identifier of the entity to retrieve.
   * @returns An observable emitting the matching entity.
   */
  getById(id: number): Observable<TEntity> {
    return this.http.get<TResource>(`${this.endpointUrl}/${id}`).pipe(
      map((resource) => this.assembler.toEntityFromResource(resource)),
      catchError(this.handleError('Failed to fetch entity')),
    );
  }

  /**
   * Creates a new entity through a POST request.
   *
   * @param entity - Entity to create.
   * @returns An observable emitting the created entity.
   */
  create(entity: TEntity): Observable<TEntity> {
    const resource = this.assembler.toResourceFromEntity(entity);
    return this.http.post<TResource>(this.endpointUrl, resource).pipe(
      map((created) => this.assembler.toEntityFromResource(created)),
      catchError(this.handleError('Failed to create entity')),
    );
  }

  /**
   * Replaces an existing entity through a PUT request.
   *
   * @param entity - Entity carrying the new state.
   * @param id - Identifier of the entity to update.
   * @returns An observable emitting the updated entity.
   */
  update(entity: TEntity, id: number): Observable<TEntity> {
    const resource = this.assembler.toResourceFromEntity(entity);
    return this.http.put<TResource>(`${this.endpointUrl}/${id}`, resource).pipe(
      map((updated) => this.assembler.toEntityFromResource(updated)),
      catchError(this.handleError('Failed to update entity')),
    );
  }

  /**
   * Deletes an entity by its identifier.
   *
   * @param id - Identifier of the entity to delete.
   * @returns An observable that completes once the entity is deleted.
   */
  delete(id: number): Observable<void> {
    return this.http
      .delete<void>(`${this.endpointUrl}/${id}`)
      .pipe(catchError(this.handleError('Failed to delete entity')));
  }

  /**
   * Builds an error handler that normalizes HTTP failures into `Error` instances.
   *
   * @param operation - Description of the operation that failed.
   * @returns A function mapping an HTTP error to a failing observable.
   */
  protected handleError(operation: string) {
    return (error: HttpErrorResponse): Observable<never> => {
      let errorMessage = operation;
      if (error.status === 404) {
        errorMessage = `${operation}: Resource not found`;
      } else if (error.error instanceof ErrorEvent) {
        errorMessage = `${operation}: ${error.error.message}`;
      } else {
        errorMessage = `${operation}: ${error.statusText || 'Unexpected error'}`;
      }
      return throwError(() => new Error(errorMessage));
    };
  }
}
