import {BaseAssembler} from '../../shared/infrastructure/base-assembler';
import {DecimalQuantity} from '../../shared/domain/model/decimal-quantity';
import {Recipe} from '../domain/model/recipe.entity';
import {RecipeResource, RecipesResponse, SaveRecipeResource} from './recipes-response';

/**
 * Translates recipes between the API resources and the domain.
 * @author DataBit
 */
export class RecipeAssembler implements BaseAssembler<Recipe, RecipeResource, RecipesResponse> {
  toEntityFromResource(resource: RecipeResource): Recipe {
    return new Recipe({
      id: resource.id, dishName: resource.dishName, active: resource.active ?? true, price: Number(resource.price ?? 0),
      ingredients: resource.ingredients.map(line => ({...line, quantityRequired: String(line.quantityRequired)}))
    });
  }

  toResourceFromEntity(entity: Recipe): RecipeResource {
    return {id: entity.id, dishName: entity.dishName.trim(), ingredients: entity.ingredients};
  }

  /** Body of POST/PUT /recipes: the API takes the name and unit of each supply from the inventory. */
  toSaveResourceFromEntity(entity: Recipe): SaveRecipeResource {
    return {
      id: entity.id, dishName: entity.dishName.trim(),
      ingredients: entity.ingredients.map(line => ({inventoryItemId: line.inventoryItemId, quantityRequired: DecimalQuantity.toText(line.quantityRequired)}))
    };
  }

  toEntitiesFromResponse(response: RecipesResponse): Recipe[] {
    return response.recipes.map(resource => this.toEntityFromResource(resource));
  }
}
