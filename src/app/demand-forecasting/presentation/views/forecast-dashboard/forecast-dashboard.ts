import { DatePipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { DemandForecastingStore } from '../../../application/demand-forecasting.store';
import { ForecastChart } from '../../components/forecast-chart/forecast-chart';

/** "Predicción de demanda" page: latest 7-day forecast and its generation. */
@Component({
  imports: [DatePipe, ForecastChart],
  selector: 'app-forecast-dashboard',
  styleUrl: './forecast-dashboard.css',
  templateUrl: './forecast-dashboard.html',
})
export class ForecastDashboard implements OnInit {
  /** Application state of the bounded context. */
  protected readonly store = inject(DemandForecastingStore);

  /** Loads the forecasts generated so far. */
  ngOnInit(): void {
    void this.store.loadForecasts();
  }

  /** Generates a new forecast with the simulated model. */
  protected onGenerate(): void {
    if (this.store.generating()) {
      return;
    }
    void this.store.generateForecast();
  }
}
