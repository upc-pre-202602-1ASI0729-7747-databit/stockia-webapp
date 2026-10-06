import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { DemandForecastingStore } from './demand-forecasting.store';

const demandForecastsUrl = `${environment.platformProviderApiBaseUrl}${environment.platformProviderDemandForecastsEndpointPath}`;
const recommendationsUrl = `${environment.platformProviderApiBaseUrl}${environment.platformProviderRecommendationsEndpointPath}`;

const forecastResources = [
  {
    id: 1,
    generatedAt: '2026-10-01T10:00:00.000Z',
    confidenceScore: 0.82,
    weatherCondition: 'Soleado',
    dataPoints: [
      { date: '2026-10-01', dayLabel: 'Jue', dishName: 'Pizza Margarita', projectedUnits: 25 },
      { date: '2026-10-02', dayLabel: 'Vie', dishName: 'Lomo Saltado', projectedUnits: 49 },
    ],
  },
  {
    id: 2,
    generatedAt: '2026-10-03T10:00:00.000Z',
    confidenceScore: 0.9,
    weatherCondition: 'Nublado',
    dataPoints: [
      { date: '2026-10-03', dayLabel: 'Sáb', dishName: 'Lomo Saltado', projectedUnits: 30 },
    ],
  },
];
const recommendationResources = [
  {
    id: 1,
    type: 'PURCHASE_SUGGESTION',
    message: 'Reponer Lomo fino antes del fin de semana.',
    expectedImpact: 'Evita quiebre de stock',
    applied: false,
  },
  {
    id: 2,
    type: 'MENU_ADJUSTMENT',
    message: 'Destacar la Ensalada César en el menú.',
    expectedImpact: '+12% de margen estimado',
    applied: true,
  },
];

describe('DemandForecastingStore', () => {
  let store: DemandForecastingStore;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    store = TestBed.inject(DemandForecastingStore);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should expose the most recent forecast', async () => {
    const loaded = store.loadForecasts();
    expect(store.loading()).toBe(true);
    http.expectOne(demandForecastsUrl).flush(forecastResources);
    await loaded;

    expect(store.loading()).toBe(false);
    expect(store.forecasts().length).toBe(2);
    expect(store.latestForecast()?.id).toBe(2);
    expect(store.latestForecast()?.confidencePercentage()).toBe(90);
  });

  it('should generate a 7-day forecast with the dishes of the latest one', async () => {
    const loaded = store.loadForecasts();
    http.expectOne(demandForecastsUrl).flush(forecastResources);
    await loaded;

    const generated = store.generateForecast();
    expect(store.generating()).toBe(true);
    const request = http.expectOne(demandForecastsUrl);
    expect(request.request.method).toBe('POST');
    expect(request.request.body.dataPoints.length).toBe(7);
    expect(
      request.request.body.dataPoints.every(
        (point: { dishName: string }) => point.dishName === 'Lomo Saltado',
      ),
    ).toBe(true);
    request.flush({ ...request.request.body, id: 3, generatedAt: '2026-10-05T10:00:00.000Z' });

    expect(await generated).toBe(true);
    expect(store.generating()).toBe(false);
    expect(store.latestForecast()?.id).toBe(3);
  });

  it('should list only the pending recommendations', async () => {
    const loaded = store.loadRecommendations();
    http.expectOne(recommendationsUrl).flush(recommendationResources);
    await loaded;

    expect(store.recommendations().length).toBe(2);
    expect(store.pendingRecommendations().map((recommendation) => recommendation.id)).toEqual([1]);
    expect(store.recommendations()[0].typeLabel()).toBe('Sugerencia de compra');
  });

  it('should apply a recommendation', async () => {
    const loaded = store.loadRecommendations();
    http.expectOne(recommendationsUrl).flush(recommendationResources);
    await loaded;

    const applied = store.applyRecommendation(1);
    expect(store.applyingId()).toBe(1);
    const request = http.expectOne(`${recommendationsUrl}/1`);
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual({ ...recommendationResources[0], applied: true });
    request.flush(request.request.body);

    expect(await applied).toBe(true);
    expect(store.applyingId()).toBeNull();
    expect(store.pendingRecommendations().length).toBe(0);
  });

  it('should report a failed load', async () => {
    const loaded = store.loadRecommendations();
    http
      .expectOne(recommendationsUrl)
      .flush('Server error', { status: 500, statusText: 'Server Error' });
    await loaded;

    expect(store.recommendations().length).toBe(0);
    expect(store.error()).toContain('No se pudieron cargar las recomendaciones');
  });
});
