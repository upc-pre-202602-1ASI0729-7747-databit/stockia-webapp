import {Component, input} from '@angular/core';
import {TranslatePipe} from '@ngx-translate/core';
import {DemandForecast} from '../../../domain/model/demand-forecast.entity';
import {LocalDatePipe} from '../../../../shared/presentation/pipes/local-date.pipe';

/**
 * Bar chart of the projected units per day (accessible: every bar has its value as text and the chart
 * is described by a label).
 * @author DataBit
 */
@Component({
  selector: 'app-forecast-chart',
  imports: [TranslatePipe, LocalDatePipe],
  template: `
    <figure class="chart" role="group" [attr.aria-label]="'forecast.chart-label' | translate">
      @for (day of forecast().days; track day.date) {
        <div class="bar-column">
          <span class="value">{{ day.projectedUnits }}</span>
          <div class="bar" [style.height.%]="(day.projectedUnits / forecast().maxDailyUnits) * 100" aria-hidden="true"></div>
          <span class="label">{{ day.date | localDate }}</span>
          <span class="dish">{{ day.dishName }}</span>
        </div>
      }
    </figure>`,
  styles: `.chart { display: grid; grid-auto-flow: column; grid-auto-columns: minmax(64px, 1fr); gap: 12px; align-items: end; height: 260px;
    margin: 0; padding: 16px; background: white; border: 1px solid #e1e8e3; border-radius: 12px; overflow-x: auto; }
    .bar-column { display: flex; flex-direction: column; align-items: center; justify-content: flex-end; height: 100%; gap: 4px; }
    .bar { width: 70%; min-height: 4px; background: linear-gradient(180deg, #e2672d, #b84a1a); border-radius: 6px 6px 0 0; }
    .value { font-weight: 700; color: #14301f; } .label { font-size: 0.75rem; color: #55635c; text-align: center; }
    .dish { font-size: 0.7rem; color: #1f4631; text-align: center; }`
})
export class ForecastChart {
  readonly forecast = input.required<DemandForecast>();
}
