import {Component, inject, OnInit} from '@angular/core';
import {MatTableModule} from '@angular/material/table';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatDialog} from '@angular/material/dialog';
import {TranslatePipe} from '@ngx-translate/core';
import {StockManagementStore} from '../../../application/stock-management.store';
import {InventoryItem} from '../../../domain/model/inventory-item.entity';
import {InventoryItemForm} from '../../components/inventory-item-form/inventory-item-form';
import {StockStatusTag} from '../../components/stock-status-tag/stock-status-tag';
import {ConfirmDialog} from '../../../../shared/presentation/components/confirm-dialog/confirm-dialog';
import {NotificationService} from '../../../../shared/application/notification.service';
import {MoneyPipe} from '../../../../shared/presentation/pipes/money.pipe';
import {QuantityPipe} from '../../../../shared/presentation/pipes/quantity.pipe';
import {LocalDatePipe} from '../../../../shared/presentation/pipes/local-date.pipe';

/**
 * Inventory (Add / Modify / Remove Supplies): supply lots newest first, with their status, the lot
 * used first in sales and the value of the stock.
 * @author DataBit
 */
@Component({
  selector: 'app-inventory-list',
  imports: [MatTableModule, MatButtonModule, MatIconModule, MatTooltipModule, MatProgressBarModule, TranslatePipe, StockStatusTag, MoneyPipe,
    QuantityPipe, LocalDatePipe],
  templateUrl: './inventory-list.html',
  styles: `.name { display: flex; flex-direction: column; gap: 2px; } .lot { font-size: 0.75rem; color: #276b46; }
    td.mat-mdc-cell, th.mat-mdc-header-cell { padding: 8px 12px; } .expired td { background: #fdf4f3; }`
})
export class InventoryList implements OnInit {
  protected readonly store = inject(StockManagementStore);
  private readonly dialog = inject(MatDialog);
  private readonly notifications = inject(NotificationService);
  protected readonly columns = ['name', 'quantity', 'minThreshold', 'storage', 'expires', 'status', 'unitCost', 'actions'];

  ngOnInit(): void {
    this.store.loadItems().then(() => {
      if (this.store.error()) this.notifications.error(this.store.error(), 'errors.load');
    });
  }

  protected openForm(item: InventoryItem | null = null): void {
    this.dialog.open(InventoryItemForm, {data: item, width: '760px', maxWidth: '95vw'});
  }

  protected remove(item: InventoryItem): void {
    this.dialog.open(ConfirmDialog, {data: {title: 'inventory.delete-title', message: 'common.delete-item', params: {name: item.name},
      accept: 'inventory.delete-accept'}}).afterClosed().subscribe(async accepted => {
      if (!accepted) return;
      try {
        await this.store.deleteItem(item);
        this.notifications.success('inventory.deleted', {name: item.name});
      } catch (error) {
        this.notifications.error(error, 'errors.delete');
      }
    });
  }
}
