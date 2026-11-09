import {Component, computed, inject, signal} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {TranslatePipe} from '@ngx-translate/core';
import {Recipe} from '../../../domain/model/recipe.entity';
import {RecipesManagementStore} from '../../../application/recipes-management.store';
import {StockManagementStore} from '../../../../stock-management/application/stock-management.store';
import {NotificationService} from '../../../../shared/application/notification.service';
import {ErrorMessagePipe} from '../../../../shared/presentation/pipes/error-message.pipe';
import {AppValidators} from '../../../../shared/presentation/validators';

/**
 * Dialog to create or edit a recipe: the dish name and its ingredient lines (supply and quantity per
 * portion). The API takes the name and unit of each supply from the inventory.
 * @author DataBit
 */
@Component({
  selector: 'app-recipe-form',
  imports: [ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatIconModule,
    TranslatePipe, ErrorMessagePipe],
  templateUrl: './recipe-form.html',
  styles: `.line { display: grid; grid-template-columns: minmax(0, 2fr) minmax(0, 1fr) auto; gap: 8px; align-items: start; }`
})
export class RecipeForm {
  protected readonly recipe = inject<Recipe | null>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<RecipeForm>);
  private readonly recipesStore = inject(RecipesManagementStore);
  private readonly notifications = inject(NotificationService);
  private readonly formBuilder = inject(FormBuilder);
  protected readonly stockStore = inject(StockManagementStore);
  protected readonly saving = signal(false);
  protected readonly supplies = computed(() => this.stockStore.items());
  protected readonly form = this.formBuilder.nonNullable.group({
    dishName: [this.recipe?.dishName ?? '', Validators.required],
    ingredients: this.formBuilder.array<FormGroup>([])
  });

  constructor() {
    (this.recipe?.ingredients ?? []).forEach(line => this.addLine(line.inventoryItemId, line.quantityRequired));
    if (this.lines.length === 0) this.addLine();
  }

  protected get lines(): FormArray<FormGroup> {
    return this.form.controls.ingredients;
  }

  protected unitOf(inventoryItemId: number | null): string {
    return this.supplies().find(item => item.id === inventoryItemId)?.unit ?? '';
  }

  protected addLine(inventoryItemId: number | null = null, quantityRequired = ''): void {
    this.lines.push(this.formBuilder.group({
      inventoryItemId: [inventoryItemId, Validators.required],
      quantityRequired: [quantityRequired, [Validators.required, AppValidators.quantity(true)]]
    }));
  }

  protected removeLine(index: number): void {
    this.lines.removeAt(index);
  }

  protected async save(): Promise<void> {
    this.form.markAllAsTouched();
    if (this.lines.length === 0) {
      this.notifications.error(null, 'recipes.errors.no-ingredients');
      return;
    }
    if (this.form.invalid || this.saving()) return;
    this.saving.set(true);
    const value = this.form.getRawValue();
    const ingredients = value.ingredients.map(line => {
      const supply = this.supplies().find(item => item.id === line['inventoryItemId']);
      return {inventoryItemId: Number(line['inventoryItemId']), inventoryItemName: supply?.name ?? '', unit: supply?.unit ?? '',
        quantityRequired: String(line['quantityRequired']).trim()};
    });
    try {
      const saved = await this.recipesStore.saveRecipe(new Recipe({id: this.recipe?.id ?? 0, dishName: value.dishName, ingredients}));
      this.notifications.success(this.recipe ? 'recipes.updated' : 'recipes.created', {name: saved.dishName});
      this.dialogRef.close(saved);
    } catch (error) {
      this.notifications.error(error);
    } finally {
      this.saving.set(false);
    }
  }
}
