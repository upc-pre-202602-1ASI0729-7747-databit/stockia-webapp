import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DemandForecast } from '../../../domain/model/demand-forecast.entity';
import { ForecastDataPoint } from '../../../domain/model/forecast-data-point';
import { ForecastChart } from './forecast-chart';

describe('ForecastChart', () => {
  let fixture: ComponentFixture<ForecastChart>;
  let element: HTMLElement;

  beforeEach(() => {
    fixture = TestBed.createComponent(ForecastChart);
    fixture.componentRef.setInput(
      'forecast',
      new DemandForecast({
        id: 1,
        generatedAt: '2026-10-05T10:00:00.000Z',
        confidenceScore: 0.82,
        weatherCondition: 'Soleado',
        dataPoints: [
          new ForecastDataPoint({
            date: '2026-10-05',
            dayLabel: 'Lun',
            dishName: 'Lomo Saltado',
            projectedUnits: 50,
          }),
          new ForecastDataPoint({
            date: '2026-10-06',
            dayLabel: 'Mar',
            dishName: 'Pizza Margarita',
            projectedUnits: 25,
          }),
        ],
      }),
    );
    fixture.detectChanges();
    element = fixture.nativeElement as HTMLElement;
  });

  it('should render one column per day', () => {
    const columns = element.querySelectorAll('.chart-column');
    expect(columns.length).toBe(2);
    expect(columns[0].querySelector('.chart-day')?.textContent).toContain('Lun');
    expect(columns[0].querySelector('.chart-value')?.textContent).toContain('50');
    expect(columns[0].getAttribute('aria-label')).toContain('50 unidades de Lomo Saltado');
  });

  it('should scale the bars to the busiest day', () => {
    const bars = Array.from(element.querySelectorAll<HTMLElement>('.chart-bar'));
    expect(bars.map((bar) => bar.style.height)).toEqual(['100%', '50%']);
  });
});
