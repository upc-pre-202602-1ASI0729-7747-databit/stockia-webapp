import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { InventoryItem } from '../domain/inventory-item.entity';
import { Recipe } from '../domain/recipe.entity';

@Injectable({ providedIn: 'root' })
export class InventoryApiService {
  private http = inject(HttpClient);
  private readonly itemsEndpoint = `${environment.platformProviderApiBaseUrl}${environment.platformProviderInventoryItemsEndpointPath}`;
  private readonly recipesEndpoint = `${environment.platformProviderApiBaseUrl}${environment.platformProviderRecipesEndpointPath}`;
  getItems() {
    return this.http.get<InventoryItem[]>(this.itemsEndpoint);
  }
  createItem(item: Partial<InventoryItem>) {
    return this.http.post<InventoryItem>(this.itemsEndpoint, item);
  }
  updateItem(id: number, item: Partial<InventoryItem>) {
    // El fake API (angular-in-memory-web-api) no soporta PATCH: solo GET/POST/PUT/DELETE.
    // Por eso el PUT siempre debe llevar el objeto completo, con `id` igual al de la URL.
    return this.http.put<InventoryItem>(`${this.itemsEndpoint}/${id}`, { ...item, id });
  }
  deleteItem(id: number) {
    return this.http.delete(`${this.itemsEndpoint}/${id}`);
  }

  getRecipes() {
    return this.http.get<Recipe[]>(this.recipesEndpoint);
  }
  createRecipe(recipe: Partial<Recipe>) {
    return this.http.post<Recipe>(this.recipesEndpoint, recipe);
  }
  updateRecipe(id: number, recipe: Partial<Recipe>) {
    return this.http.put<Recipe>(`${this.recipesEndpoint}/${id}`, { ...recipe, id });
  }
  deleteRecipe(id: number) {
    return this.http.delete(`${this.recipesEndpoint}/${id}`);
  }
}
