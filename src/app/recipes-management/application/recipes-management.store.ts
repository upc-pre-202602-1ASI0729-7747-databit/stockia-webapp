import {computed, inject, Service, signal} from '@angular/core';
import {firstValueFrom} from 'rxjs';
import {RecipesManagementApi} from '../infrastructure/recipes-management-api';
import {Recipe} from '../domain/model/recipe.entity';
import {Sale} from '../domain/model/sale.entity';
import {SaleBlocked} from '../domain/model/sale-blocked';
import {ApiError} from '../../shared/infrastructure/api-error';
import {StockManagementStore} from '../../stock-management/application/stock-management.store';
import {DishAvailability, StockAllocation} from '../../stock-management/domain/services/stock-allocation';

/** Outcome of selling a dish: the sale, or why the API refused it (422 CannotSell). */
export type SellResult = {sale: Sale; blocked: null} | {sale: null; blocked: SaleBlocked};

/**
 * State of Recipes Management: recipes (newest first), the sales history and the sale of a dish. After
 * a sale the inventory is reloaded, because the API took out the supplies.
 * @author DataBit
 */
@Service()
export class RecipesManagementStore {
  private readonly recipesApi = inject(RecipesManagementApi);
  private readonly stockStore = inject(StockManagementStore);
  private readonly recipesSignal = signal<Recipe[]>([]);
  private readonly salesSignal = signal<Sale[]>([]);
  private readonly loadingRecipesSignal = signal<boolean>(false);
  private readonly loadingSalesSignal = signal<boolean>(false);

  readonly recipes = this.recipesSignal.asReadonly();
  readonly sales = this.salesSignal.asReadonly();
  readonly loadingRecipes = this.loadingRecipesSignal.asReadonly();
  readonly loadingSales = this.loadingSalesSignal.asReadonly();
  readonly confirmedSales = computed(() => this.salesSignal().filter(sale => sale.isConfirmed));
  readonly revenue = computed(() => this.confirmedSales().reduce((total, sale) => total + sale.total, 0));

  /** Preview of whether a dish can be sold with the current inventory (the API decides). */
  readonly availabilityOf = (recipe: Recipe) => computed<DishAvailability>(() =>
    StockAllocation.availabilityOf(recipe.ingredients, this.stockStore.items()));

  loadRecipes(): Promise<void> {
    this.loadingRecipesSignal.set(true);
    return firstValueFrom(this.recipesApi.getRecipes())
      .then(recipes => this.recipesSignal.set([...recipes].sort((a, b) => b.id - a.id)))
      .finally(() => this.loadingRecipesSignal.set(false));
  }

  loadSales(): Promise<void> {
    this.loadingSalesSignal.set(true);
    return firstValueFrom(this.recipesApi.getSales())
      .then(sales => this.salesSignal.set(sales))
      .finally(() => this.loadingSalesSignal.set(false));
  }

  async saveRecipe(recipe: Recipe): Promise<Recipe> {
    const saved = await firstValueFrom(recipe.id ? this.recipesApi.updateRecipe(recipe) : this.recipesApi.createRecipe(recipe));
    this.recipesSignal.update(recipes => recipe.id
      ? recipes.map(candidate => (candidate.id === saved.id ? saved : candidate))
      : [saved, ...recipes]);
    return saved;
  }

  async deleteRecipe(recipe: Recipe): Promise<void> {
    await firstValueFrom(this.recipesApi.deleteRecipe(recipe.id));
    this.recipesSignal.update(recipes => recipes.filter(candidate => candidate.id !== recipe.id));
  }

  /** Sells portions of a dish. A 422 CannotSell comes back as "blocked" with the supplies that failed. */
  async sell(recipe: Recipe, quantity = 1): Promise<SellResult> {
    try {
      const sale = await firstValueFrom(this.recipesApi.registerSale(recipe.id, quantity, 'MANUAL'));
      this.salesSignal.update(sales => [sale, ...sales]);
      await this.stockStore.loadItems();
      return {sale, blocked: null};
    } catch (error) {
      const apiError = ApiError.from(error);
      if (apiError.title === 'CannotSell' && apiError.details) return {sale: null, blocked: apiError.details as unknown as SaleBlocked};
      throw apiError;
    }
  }

  async voidSale(sale: Sale): Promise<void> {
    const voided = await firstValueFrom(this.recipesApi.voidSale(sale.id));
    this.salesSignal.update(sales => sales.map(candidate => (candidate.id === voided.id ? voided : candidate)));
  }
}
