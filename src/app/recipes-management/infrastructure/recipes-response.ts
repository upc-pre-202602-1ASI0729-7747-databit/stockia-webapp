import {BaseResource, BaseResponse} from '../../shared/infrastructure/base-response';
import {RecipeIngredient} from '../domain/model/recipe.entity';

export interface RecipeResource extends BaseResource {
  id: number;
  dishName: string;
  active?: boolean;
  ingredients: RecipeIngredient[];
  price?: number;
}

/** What the API expects to create or edit a recipe: supplies by id with their quantity. */
export interface SaveRecipeResource extends BaseResource {
  id: number;
  dishName: string;
  ingredients: {inventoryItemId: number; quantityRequired: string}[];
}

export interface RecipesResponse extends BaseResponse {
  recipes: RecipeResource[];
}
