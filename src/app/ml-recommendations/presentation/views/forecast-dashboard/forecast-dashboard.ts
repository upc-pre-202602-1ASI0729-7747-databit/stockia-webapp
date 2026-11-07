import {Component, computed, inject, OnInit} from '@angular/core';
import {MatCardModule} from '@angular/material/card';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatExpansionModule} from '@angular/material/expansion';
import {TranslatePipe} from '@ngx-translate/core';
import {MlRecommendationsStore} from '../../../application/ml-recommendations.store';
import {ForecastChart} from '../../components/forecast-chart/forecast-chart';
import {NotificationService} from '../../../../shared/application/notification.service';
import {LocalDatePipe} from '../../../../shared/presentation/pipes/local-date.pipe';

/**
 * Demand forecast (Demand Prediction View): units per dish for the next 7 days predicted by the ML
 * model of the API with the sales history, the Peruvian calendar and the Open-Meteo weather.
 * @author DataBit
 */
@Component({
  selector: 'app-forecast-dashboard',
  imports: [MatCardModule, MatButtonModule, MatIconModule, MatProgressBarModule, MatExpansionModule, TranslatePipe, ForecastChart, LocalDatePipe],
  templateUrl: './forecast-dashboard.html',
  styles: `.summary { display: grid; gap: 16px; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); }
    .value { font-size: 1.4rem; font-weight: 700; color: #14301f; margin: 4px 0 0; }
    .dishes { display: grid; grid-template-columns: 1fr auto; gap: 4px 16px; margin: 0; } dd { margin: 0; font-weight: 500; }`
})
export class ForecastDashboard implements OnInit {
  protected readonly store = inject(MlRecommendationsStore);
  private readonly notifications = inject(NotificationService);
  protected readonly weatherKey = computed(() => {
    const condition = this.store.forecast()?.weatherCondition ?? 'SUNNY';
    return `forecast.weather.${({SUNNY: 'sunny', CLOUDY: 'cloudy', DRIZZLE: 'drizzle', RAIN: 'rain'})[condition]}`;
  });

  ngOnInit(): void {
    this.store.loadLatestForecast().catch(error => this.notifications.error(error, 'errors.load'));
  }

  protected async generate(): Promise<void> {
    try {
      await this.store.generateForecast();
      this.notifications.success('forecast.generated');
    } catch (error) {
      this.notifications.error(error, 'forecast.errors.no-dishes');
    }
  }
}
