import {inject, Service} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {BaseApi} from '../../shared/infrastructure/base-api';
import {Recipe} from '../domain/model/recipe.entity';
import {Sale, SaleChannel} from '../domain/model/sale.entity';
import {RecipesApiEndpoint} from './recipes-api-endpoint';
import {SalesApiEndpoint} from './sales-api-endpoint';

/**
 * Facade of the Recipes Management API (recipes and sales).
 * @author DataBit
 */
@Service()
export class RecipesManagementApi extends BaseApi {
  private readonly http = inject(HttpClient);
  private readonly recipesEndpoint = new RecipesApiEndpoint(this.http);
  private readonly salesEndpoint = new SalesApiEndpoint(this.http);

  getRecipes(): Observable<Recipe[]> {
    return this.recipesEndpoint.getAll();
  }

  createRecipe(recipe: Recipe): Observable<Recipe> {
    return this.recipesEndpoint.create(recipe);
  }

  updateRecipe(recipe: Recipe): Observable<Recipe> {
    return this.recipesEndpoint.update(recipe, recipe.id);
  }

  deleteRecipe(id: number): Observable<void> {
    return this.recipesEndpoint.delete(id);
  }

  getSales(): Observable<Sale[]> {
    return this.salesEndpoint.getAll();
  }

  registerSale(recipeId: number, quantity: number, channel: SaleChannel): Observable<Sale> {
    return this.salesEndpoint.register(recipeId, quantity, channel);
  }

  voidSale(id: number): Observable<Sale> {
    return this.salesEndpoint.voidSale(id);
  }
}
