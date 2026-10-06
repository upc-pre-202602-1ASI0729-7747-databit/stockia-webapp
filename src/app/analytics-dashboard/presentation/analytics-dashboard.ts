import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InventoryService } from '../../product-inventory/application/inventory.service';
import { AlertsService } from '../../alerts/application/alerts.service';
import { AuthService } from '../../iam/application/auth.service';
import { StockStatus, STOCK_STATUS_LABEL} from '../../product-inventory/domain/inventory-item.entity';
import { DemandForecastingStore } from '../../demand-forecasting/application/demand-forecasting.store';

@Component({
  selector: 'app-analytics-dashboard',
  imports: [CommonModule],
  templateUrl: './analytics-dashboard.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './analytics-dashboard.css',
})
export class AnalyticsDashboardComponent implements OnInit {
  inventory = inject(InventoryService);
  alertsSrv = inject(AlertsService);
  forecast = inject(DemandForecastingStore);
  auth = inject(AuthService);

  statusLabel = STOCK_STATUS_LABEL;
  StockStatus = StockStatus;

  ngOnInit() {
    this.inventory.loadItems().subscribe();
    this.alertsSrv.loadAlerts().subscribe();
    this.forecast.loadForecasts().then();
  }

  get criticalItems() {
    return this.inventory
      .items()
      .filter(
        (i) =>
          i.status === StockStatus.CRITICAL ||
          i.status === StockStatus.LOW ||
          i.status === StockStatus.EXPIRED,
      );
  }
}
