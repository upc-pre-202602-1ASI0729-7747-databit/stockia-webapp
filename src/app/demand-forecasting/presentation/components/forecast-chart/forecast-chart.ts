import { Component, computed, input } from '@angular/core';
import { DemandForecast } from '../../../domain/model/demand-forecast.entity';

/** Smallest bar height, as a percentage, so days with few units stay visible. */
const MIN_BAR_HEIGHT_PERCENTAGE = 6;

/** Bar chart of the units projected for each day of a forecast. */
@Component({
  selector: 'app-forecast-chart',
  styleUrl: './forecast-chart.css',
  templateUrl: './forecast-chart.html',
})
export class ForecastChart {
  /** Forecast whose data points are charted. */
  readonly forecast = input.required<DemandForecast>();

  /** Data points with the height of their bar, relative to the busiest day. */
  protected readonly bars = computed(() => {
    const dataPoints = this.forecast().dataPoints;
    const maxUnits = Math.max(1, ...dataPoints.map((point) => point.projectedUnits));
    return dataPoints.map((point) => ({
      point,
      heightPercentage: Math.max(
        MIN_BAR_HEIGHT_PERCENTAGE,
        Math.round((point.projectedUnits / maxUnits) * 100),
      ),
    }));
  });
}
