import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {BaseApiEndpoint} from '../../shared/infrastructure/base-api-endpoint';
import {environment} from '../../../environments/environment';
import {Recipe} from '../domain/model/recipe.entity';
import {RecipeAssembler} from './recipe-assembler';
import {RecipeResource, RecipesResponse} from './recipes-response';

/**
 * Endpoint /recipes (CRUD of dishes and their ingredients).
 * @author DataBit
 */
export class RecipesApiEndpoint extends BaseApiEndpoint<Recipe, RecipeResource, RecipesResponse, RecipeAssembler> {
  constructor(http: HttpClient) {
    super(http, `${environment.platformProviderApiBaseUrl}${environment.platformProviderRecipesEndpointPath}`, new RecipeAssembler());
  }

  override create(entity: Recipe): Observable<Recipe> {
    return this.http.post<RecipeResource>(this.endpointUrl, this.assembler.toSaveResourceFromEntity(entity)).pipe(
      map(resource => this.assembler.toEntityFromResource(resource)), catchError(this.handleError));
  }

  override update(entity: Recipe, id: number): Observable<Recipe> {
    return this.http.put<RecipeResource>(`${this.endpointUrl}/${id}`, this.assembler.toSaveResourceFromEntity(entity)).pipe(
      map(resource => this.assembler.toEntityFromResource(resource)), catchError(this.handleError));
  }
}
