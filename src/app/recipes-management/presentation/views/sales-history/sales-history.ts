import {Component, inject, OnInit} from '@angular/core';
import {MatTableModule} from '@angular/material/table';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatDialog} from '@angular/material/dialog';
import {TranslatePipe} from '@ngx-translate/core';
import {RecipesManagementStore} from '../../../application/recipes-management.store';
import {Sale} from '../../../domain/model/sale.entity';
import {ConfirmDialog} from '../../../../shared/presentation/components/confirm-dialog/confirm-dialog';
import {NotificationService} from '../../../../shared/application/notification.service';
import {MoneyPipe} from '../../../../shared/presentation/pipes/money.pipe';
import {LocalDatePipe} from '../../../../shared/presentation/pipes/local-date.pipe';

/**
 * Sales history (confirmed and voided sales), the data the demand forecast learns from.
 * @author DataBit
 */
@Component({
  selector: 'app-sales-history',
  imports: [MatTableModule, MatButtonModule, MatCardModule, MatProgressBarModule, TranslatePipe, MoneyPipe, LocalDatePipe],
  templateUrl: './sales-history.html',
  styles: `.summary { display: grid; gap: 16px; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); }
    .value { font-size: 1.6rem; font-weight: 700; color: #14301f; margin: 4px 0 0; }
    td.mat-mdc-cell, th.mat-mdc-header-cell { padding: 8px 12px; } .voided td { color: #55635c; text-decoration: line-through; }
    .voided td:last-child, .voided td:nth-last-child(2) { text-decoration: none; }`
})
export class SalesHistory implements OnInit {
  protected readonly store = inject(RecipesManagementStore);
  private readonly dialog = inject(MatDialog);
  private readonly notifications = inject(NotificationService);
  protected readonly columns = ['date', 'channel', 'dishes', 'total', 'status', 'actions'];

  ngOnInit(): void {
    this.store.loadSales().catch(error => this.notifications.error(error, 'errors.load'));
  }

  protected voidSale(sale: Sale): void {
    this.dialog.open(ConfirmDialog, {data: {title: 'sales.void-title', message: 'sales.void-confirm', params: {dishes: sale.dishesSummary},
      accept: 'sales.void'}}).afterClosed().subscribe(async accepted => {
      if (!accepted) return;
      try {
        await this.store.voidSale(sale);
        this.notifications.success('sales.voided');
      } catch (error) {
        this.notifications.error(error);
      }
    });
  }
}
