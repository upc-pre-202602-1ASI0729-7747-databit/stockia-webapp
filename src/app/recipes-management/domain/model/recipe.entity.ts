import {BaseEntity} from '../../../shared/domain/model/base-entity';
import {IngredientNeed} from '../../../stock-management/domain/services/stock-allocation';

/** A supply a dish consumes per portion (quantity as exact text). */
export interface RecipeIngredient extends IngredientNeed {
  inventoryItemId: number;
  inventoryItemName: string;
  quantityRequired: string;
  unit: string;
}

/**
 * A dish of the menu and the supplies it consumes each time it is sold. Its price is the sum of its
 * ingredients, calculated by the API.
 * @author DataBit
 */
export class Recipe implements BaseEntity {
  #id: number;
  #dishName: string;
  #active: boolean;
  #ingredients: RecipeIngredient[];
  #price: number;

  constructor(recipe: {id?: number; dishName?: string; active?: boolean; ingredients?: RecipeIngredient[]; price?: number}) {
    this.#id = recipe.id ?? 0;
    this.#dishName = recipe.dishName ?? '';
    this.#active = recipe.active ?? true;
    this.#ingredients = recipe.ingredients ?? [];
    this.#price = recipe.price ?? 0;
  }

  get id(): number { return this.#id; }
  set id(value: number) { this.#id = value; }
  get dishName(): string { return this.#dishName; }
  set dishName(value: string) { this.#dishName = value; }
  get active(): boolean { return this.#active; }
  get ingredients(): RecipeIngredient[] { return this.#ingredients; }
  set ingredients(value: RecipeIngredient[]) { this.#ingredients = value; }
  get price(): number { return this.#price; }

  /** A recipe needs a dish name and at least one ingredient (same rule as the API). */
  get isComplete(): boolean {
    return this.#dishName.trim().length > 0 && this.#ingredients.length > 0;
  }
}
