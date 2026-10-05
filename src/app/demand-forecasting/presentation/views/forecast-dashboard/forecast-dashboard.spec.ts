import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { environment } from '../../../../../environments/environment';
import { ForecastDashboard } from './forecast-dashboard';

const demandForecastsUrl = `${environment.platformProviderApiBaseUrl}${environment.platformProviderDemandForecastsEndpointPath}`;

/** Waits for the pending promise callbacks to run. */
const settle = () => new Promise((resolve) => setTimeout(resolve));

describe('ForecastDashboard', () => {
  let fixture: ComponentFixture<ForecastDashboard>;
  let http: HttpTestingController;
  let element: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(ForecastDashboard);
    fixture.detectChanges();
    element = fixture.nativeElement as HTMLElement;
  });

  afterEach(() => http.verify());

  it('should summarize the latest forecast', async () => {
    http.expectOne(demandForecastsUrl).flush([
      {
        id: 1,
        generatedAt: '2026-10-05T10:00:00.000Z',
        confidenceScore: 0.82,
        weatherCondition: 'Soleado',
        dataPoints: [
          { date: '2026-10-05', dayLabel: 'Lun', dishName: 'Lomo Saltado', projectedUnits: 40 },
          { date: '2026-10-06', dayLabel: 'Mar', dishName: 'Pizza Margarita', projectedUnits: 20 },
        ],
      },
    ]);
    await settle();
    fixture.detectChanges();

    const stats = Array.from(element.querySelectorAll('.forecast-stat strong')).map((stat) =>
      stat.textContent?.trim(),
    );
    expect(stats).toEqual(['82%', 'Soleado', '60', 'Lun']);
    expect(element.querySelectorAll('app-forecast-chart .chart-column').length).toBe(2);
  });

  it('should invite to generate a forecast when there is none', async () => {
    http.expectOne(demandForecastsUrl).flush([]);
    await settle();
    fixture.detectChanges();

    expect(element.querySelector('.empty-state')?.textContent).toContain(
      'Aún no hay predicciones generadas',
    );
  });

  it('should generate a new forecast', async () => {
    http.expectOne(demandForecastsUrl).flush([]);
    await settle();
    fixture.detectChanges();

    element.querySelector<HTMLButtonElement>('.page-header button')?.click();
    fixture.detectChanges();
    const request = http.expectOne(demandForecastsUrl);
    expect(request.request.method).toBe('POST');
    expect(element.querySelector('.page-header button')?.textContent).toContain('Generando…');

    request.flush({ ...request.request.body, id: 1 });
    await settle();
    fixture.detectChanges();

    expect(element.querySelectorAll('app-forecast-chart .chart-column').length).toBe(7);
  });
});
