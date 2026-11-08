import {inject, Service, signal} from '@angular/core';
import {firstValueFrom} from 'rxjs';
import {AnalyticsDashboardApi} from '../infrastructure/analytics-dashboard-api';
import {DashboardSummary} from '../domain/model/dashboard-summary.entity';
import {WeeklySavings} from '../domain/model/weekly-savings.entity';

/**
 * State of Analytics &amp; Dashboard: KPIs and the weekly savings (Administrator).
 * @author DataBit
 */
@Service()
export class AnalyticsDashboardStore {
  private readonly dashboardApi = inject(AnalyticsDashboardApi);
  private readonly summarySignal = signal<DashboardSummary | null>(null);
  private readonly savingsSignal = signal<WeeklySavings | null>(null);
  private readonly loadingSignal = signal<boolean>(false);

  readonly summary = this.summarySignal.asReadonly();
  readonly savings = this.savingsSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();

  loadSummary(): Promise<void> {
    this.loadingSignal.set(true);
    return firstValueFrom(this.dashboardApi.getSummary()).then(summary => this.summarySignal.set(summary))
      .finally(() => this.loadingSignal.set(false));
  }

  loadWeeklySavings(): Promise<void> {
    return firstValueFrom(this.dashboardApi.getWeeklySavings()).then(savings => this.savingsSignal.set(savings));
  }
}
