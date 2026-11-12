import {Component, inject, OnInit, signal} from '@angular/core';
import {MatCardModule} from '@angular/material/card';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatDialog} from '@angular/material/dialog';
import {TranslatePipe} from '@ngx-translate/core';
import {RecipesManagementStore} from '../../../application/recipes-management.store';
import {Recipe} from '../../../domain/model/recipe.entity';
import {RecipeForm} from '../../components/recipe-form/recipe-form';
import {SaleBlockedDialog} from '../../components/sale-blocked-dialog/sale-blocked-dialog';
import {StockManagementStore} from '../../../../stock-management/application/stock-management.store';
import {ConfirmDialog} from '../../../../shared/presentation/components/confirm-dialog/confirm-dialog';
import {NotificationService} from '../../../../shared/application/notification.service';
import {LanguageStore} from '../../../../shared/application/language.store';
import {MoneyPipe} from '../../../../shared/presentation/pipes/money.pipe';
import {QuantityPipe} from '../../../../shared/presentation/pipes/quantity.pipe';

/**
 * Recipes (Recipe CRUD Controller) and the sale of one portion (Ingredient Deduction Engine): a dish is
 * sold only when every supply is available in a lot that is not expired.
 * @author DataBit
 */
@Component({
  selector: 'app-recipe-list',
  imports: [MatCardModule, MatButtonModule, MatIconModule, MatTooltipModule, MatProgressBarModule, TranslatePipe, MoneyPipe, QuantityPipe],
  templateUrl: './recipe-list.html',
  styles: `.recipes { display: grid; gap: 16px; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); }
    .head { display: flex; justify-content: space-between; gap: 8px; align-items: flex-start; } h3 { margin: 0; color: #14301f; }
    ul { padding-left: 18px; margin: 8px 0; } .price { font-size: 1.3rem; font-weight: 700; color: #1f4631; margin: 0; }
    mat-card-actions { display: flex; flex-wrap: wrap; gap: 4px; }
    mat-card.sold { outline: 3px solid #2e7d32; background: #e8f5e9; transition: background 0.3s; }`
})
export class RecipeList implements OnInit {
  protected readonly store = inject(RecipesManagementStore);
  private readonly stockStore = inject(StockManagementStore);
  private readonly dialog = inject(MatDialog);
  private readonly notifications = inject(NotificationService);
  private readonly language = inject(LanguageStore);
  protected readonly selling = signal<number | null>(null);
  /** Recipe whose sale was just registered; its card is highlighted for two seconds. */
  protected readonly justSold = signal<number | null>(null);

  ngOnInit(): void {
    Promise.all([this.store.loadRecipes(), this.stockStore.loadItems()]).catch(error => this.notifications.error(error, 'errors.load'));
  }

  protected availabilityCss(recipe: Recipe): string {
    return ({READY: 'tag-success', NO_STOCK: 'tag-danger', EXPIRED: 'tag-warning'})[this.store.availabilityOf(recipe)()];
  }

  protected availabilityKey(recipe: Recipe): string {
    const keys = {READY: 'recipes.availability.ready', NO_STOCK: 'recipes.availability.no-stock', EXPIRED: 'recipes.availability.expired'};
    return keys[this.store.availabilityOf(recipe)()];
  }

  protected openForm(recipe: Recipe | null = null): void {
    this.dialog.open(RecipeForm, {data: recipe, width: '720px', maxWidth: '95vw'});
  }

  protected async sell(recipe: Recipe): Promise<void> {
    this.selling.set(recipe.id);
    try {
      const result = await this.store.sell(recipe);
      if (result.blocked) this.dialog.open(SaleBlockedDialog, {data: result.blocked, maxWidth: '95vw'});
      else {
        this.notifications.success('recipes.sold', {dish: recipe.dishName, total: this.formatMoney(result.sale.total)});
        this.justSold.set(recipe.id);
        setTimeout(() => this.justSold.update(id => (id === recipe.id ? null : id)), 2000);
      }
    } catch (error) {
      this.notifications.error(error);
    } finally {
      this.selling.set(null);
    }
  }

  protected remove(recipe: Recipe): void {
    this.dialog.open(ConfirmDialog, {data: {title: 'recipes.delete-title', message: 'common.delete-item', params: {name: recipe.dishName},
      accept: 'recipes.delete-accept'}}).afterClosed().subscribe(async accepted => {
      if (!accepted) return;
      try {
        await this.store.deleteRecipe(recipe);
        this.notifications.success('recipes.deleted', {name: recipe.dishName});
      } catch (error) {
        this.notifications.error(error, 'errors.delete');
      }
    });
  }

  private formatMoney(amount: number): string {
    return `S/ ${new Intl.NumberFormat(this.language.locale(), {minimumFractionDigits: 2, maximumFractionDigits: 2}).format(amount)}`;
  }
}
