import {Component, inject, OnInit} from '@angular/core';
import {RouterLink} from '@angular/router';
import {MatCardModule} from '@angular/material/card';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {TranslatePipe} from '@ngx-translate/core';
import {AnalyticsDashboardStore} from '../../../application/analytics-dashboard.store';
import {WeeklySavingsCard} from '../../components/weekly-savings-card/weekly-savings-card';
import {IamStore} from '../../../../iam/application/iam.store';
import {StockManagementStore} from '../../../../stock-management/application/stock-management.store';
import {StockStatusTag} from '../../../../stock-management/presentation/components/stock-status-tag/stock-status-tag';
import {NotificationsMessagingStore} from '../../../../notifications-messaging/application/notifications-messaging.store';
import {AlertSeverityTag} from '../../../../notifications-messaging/presentation/components/alert-severity-tag/alert-severity-tag';
import {MlRecommendationsStore} from '../../../../ml-recommendations/application/ml-recommendations.store';
import {ForecastChart} from '../../../../ml-recommendations/presentation/components/forecast-chart/forecast-chart';
import {NotificationService} from '../../../../shared/application/notification.service';
import {MoneyPipe} from '../../../../shared/presentation/pipes/money.pipe';
import {QuantityPipe} from '../../../../shared/presentation/pipes/quantity.pipe';

/**
 * Business dashboard (Metrics View Updater + Alerts Panel + Demand Prediction View + Weekly Savings
 * Calculator): it composes the other bounded contexts.
 * @author DataBit
 */
@Component({
  selector: 'app-business-dashboard',
  imports: [RouterLink, MatCardModule, MatButtonModule, MatIconModule, MatProgressBarModule, TranslatePipe, WeeklySavingsCard, StockStatusTag,
    AlertSeverityTag, ForecastChart, MoneyPipe, QuantityPipe],
  templateUrl: './business-dashboard.html',
  styles: `.kpis { display: grid; gap: 16px; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); }
    .kpi strong { display: block; font-size: 1.7rem; color: #14301f; } .kpi mat-icon { color: #b84a1a; }
    .panels { display: grid; gap: 16px; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); }
    ul { list-style: none; padding: 0; margin: 0; display: grid; gap: 8px; } li { display: flex; justify-content: space-between; gap: 8px; align-items: center; }`
})
export class BusinessDashboard implements OnInit {
  protected readonly store = inject(AnalyticsDashboardStore);
  protected readonly iamStore = inject(IamStore);
  protected readonly stockStore = inject(StockManagementStore);
  protected readonly alertsStore = inject(NotificationsMessagingStore);
  protected readonly mlStore = inject(MlRecommendationsStore);
  private readonly notifications = inject(NotificationService);

  ngOnInit(): void {
    const loads: Promise<void>[] = [this.store.loadSummary(), this.stockStore.loadItems(), this.alertsStore.loadAlerts(), this.mlStore.loadLatestForecast()];
    if (this.iamStore.isAdmin()) loads.push(this.store.loadWeeklySavings());
    Promise.all(loads).catch(error => this.notifications.error(error, 'errors.load'));
  }
}
