import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InventoryService } from '../../application/inventory.service';
import { Recipe, RecipeIngredientLine } from '../../domain/recipe.entity';
import { SalesService } from '../../../sales-order/application/sales.service';

@Component({
  selector: 'app-recipe-list',
  imports: [FormsModule],
  templateUrl: './recipe-list.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './recipe-list.component.css',
})
export class RecipeListComponent implements OnInit {
  inventory = inject(InventoryService);
  // "Simular venta" registra una Sale real (Bounded Context Sales / Order
  // Management) en vez de descontar inventario directamente: es
  // SalesService.registerSale() quien valida stock y, recién si alcanza,
  // dispara RecipeStockDeductionService (ver Capítulo IV, 4.6.5).
  private sales = inject(SalesService);

  showForm = signal(false);
  editingId = signal<number | null>(null);
  dishName = signal('');
  draftLines = signal<RecipeIngredientLine[]>([]);
  selectedItemId = signal<number | null>(null);
  selectedQty = signal<number>(1);
  justSoldId = signal<number | null>(null);

  ngOnInit() {
    this.inventory.loadItems().subscribe();
    this.inventory.loadRecipes().subscribe();
  }

  openCreate() {
    this.editingId.set(null);
    this.dishName.set('');
    this.draftLines.set([]);
    this.showForm.set(true);
  }

  openEdit(recipe: Recipe) {
    this.editingId.set(recipe.id);
    this.dishName.set(recipe.dishName);
    this.draftLines.set([...recipe.ingredients]);
    this.showForm.set(true);
  }

  addLine() {
    const itemId = this.selectedItemId();
    const item = this.inventory.items().find((i) => i.id === itemId);
    if (!item || this.selectedQty() <= 0) return;
    this.draftLines.update((lines) => [
      ...lines,
      {
        inventoryItemId: item.id,
        inventoryItemName: item.name,
        quantityRequired: this.selectedQty(),
        unit: item.unit,
      },
    ]);
  }

  removeLine(index: number) {
    this.draftLines.update((lines) => lines.filter((_, i) => i !== index));
  }

  save() {
    if (!this.dishName().trim() || this.draftLines().length === 0) return;
    const payload = { dishName: this.dishName(), ingredients: this.draftLines(), active: true };
    const id = this.editingId();
    const request = id
      ? this.inventory.updateRecipe(id, payload)
      : this.inventory.createRecipe(payload);
    request.subscribe(() => this.showForm.set(false));
  }

  simulateSale(recipeId: number) {
    this.sales.registerSale(recipeId).subscribe({
      next: () => {
        this.justSoldId.set(recipeId);
        setTimeout(() => this.justSoldId.set(null), 2000);
      },
      error: (err: Error) => {
        alert(err.message || this.sales.registrationError() || 'No se pudo registrar la venta.');
      },
    });
  }

  remove(id: number) {
    if (confirm('¿Eliminar esta receta?')) {
      this.inventory.deleteRecipe(id).subscribe();
    }
  }
}
