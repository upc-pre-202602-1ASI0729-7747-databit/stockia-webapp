import { Injectable, inject, signal, computed } from '@angular/core';
import { tap } from 'rxjs';
import { InventoryApiService } from '../infrastructure/inventory-api.service';
import { InventoryItem, StockStatus } from '../domain/inventory-item.entity';
import { Recipe } from '../domain/recipe.entity';

// Capa de aplicación del Bounded Context Inventory & Recipe Management.
// Implementa RecipeStockDeductionService (Capítulo IV, 4.6.5) del lado del
// cliente (simulado aquí porque aún no existe backend real). Este servicio ya
// NO es invocado directamente por la UI: es SalesService.registerSale(), en el
// Bounded Context Sales / Order Management, quien lo dispara como reacción al
// evento de dominio `DishSold` una vez que una Sale queda confirmada.
@Injectable({ providedIn: 'root' })
export class InventoryService {
  private api = inject(InventoryApiService);

  readonly items = signal<InventoryItem[]>([]);
  readonly recipes = signal<Recipe[]>([]);
  readonly loading = signal(false);

  readonly criticalCount = computed(
    () => this.items().filter((i) => i.status === StockStatus.CRITICAL || i.status === StockStatus.LOW).length,
  );
  readonly expiringSoonCount = computed(() => {
    const today = new Date();
    return this.items().filter((i) => {
      const days = Math.ceil((new Date(i.expirationDate).getTime() - today.getTime()) / 86400000);
      return days >= 0 && days <= 3;
    }).length;
  });
  readonly inventoryValue = computed(
    () => this.items().reduce((sum, i) => sum + i.quantity * i.unitCost, 0),
  );

  loadItems() {
    this.loading.set(true);
    return this.api.getItems().pipe(
      tap((items) => {
        this.items.set(items.map((i) => InventoryItem.fromJson(i)));
        this.loading.set(false);
      }),
    );
  }

  loadRecipes() {
    return this.api.getRecipes().pipe(
      tap((recipes) => this.recipes.set(recipes.map((r) => Recipe.fromJson(r)))),
    );
  }

  createItem(item: Partial<InventoryItem>) {
    return this.api.createItem(item).pipe(tap(() => this.loadItems().subscribe()));
  }

  updateItem(id: number, changes: Partial<InventoryItem>) {
    // El fake API reemplaza el recurso completo en cada PUT, así que siempre
    // fusionamos los cambios sobre el objeto completo ya cargado en memoria.
    const current = this.items().find((i) => i.id === id);
    const full = { ...current, ...changes, id };
    return this.api.updateItem(id, full).pipe(tap(() => this.loadItems().subscribe()));
  }

  deleteItem(id: number) {
    return this.api.deleteItem(id).pipe(tap(() => this.loadItems().subscribe()));
  }

  createRecipe(recipe: Partial<Recipe>) {
    return this.api.createRecipe(recipe).pipe(tap(() => this.loadRecipes().subscribe()));
  }

  updateRecipe(id: number, recipe: Partial<Recipe>) {
    return this.api.updateRecipe(id, recipe).pipe(tap(() => this.loadRecipes().subscribe()));
  }

  deleteRecipe(id: number) {
    return this.api.deleteRecipe(id).pipe(tap(() => this.loadRecipes().subscribe()));
  }

  /**
   * RecipeStockDeductionService (4.6.5): descuenta de cada insumo la cantidad
   * requerida por la receta vendida. Invocado por SalesService.registerSale()
   * justo después de confirmar la Sale — representa el consumo del evento de
   * dominio `DishSold` publicado por el Bounded Context Sales / Order Management.
   * No debe ser llamado directamente desde la UI.
   */
  sellDish(recipeId: number) {
    const recipe = this.recipes().find((r) => r.id === recipeId);
    if (!recipe) return;
    const updated = this.items().map((item) => {
      const line = recipe.ingredients.find((l) => l.inventoryItemId === item.id);
      if (!line) return item;
      const nextQty = Math.max(0, item.quantity - line.quantityRequired);
      this.updateItem(item.id, { quantity: nextQty }).subscribe();
      return item;
    });
    return updated;
  }
}
