import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApi } from '../../shared/infrastructure/base-api';
import { DemandForecast } from '../domain/model/demand-forecast.entity';
import { Recommendation } from '../domain/model/recommendation.entity';
import { DemandForecastsApiEndpoint } from './demand-forecasts-api-endpoint';
import { RecommendationsApiEndpoint } from './recommendations-api-endpoint';

/** API facade of the ML and Recommendations bounded context. */
@Injectable({ providedIn: 'root' })
export class DemandForecastingService extends BaseApi {
  /** HTTP client shared by the endpoints. */
  private readonly http = inject(HttpClient);
  /** Endpoint of the demand forecasts collection. */
  private readonly demandForecastsEndpoint = new DemandForecastsApiEndpoint(this.http);
  /** Endpoint of the recommendations collection. */
  private readonly recommendationsEndpoint = new RecommendationsApiEndpoint(this.http);

  /**
   * Retrieves every demand forecast generated so far.
   *
   * @returns An observable emitting the demand forecasts.
   */
  getDemandForecasts(): Observable<DemandForecast[]> {
    return this.demandForecastsEndpoint.getAll();
  }

  /**
   * Saves a newly generated demand forecast.
   *
   * @param forecast - Demand forecast to save.
   * @returns An observable emitting the saved demand forecast.
   */
  createDemandForecast(forecast: DemandForecast): Observable<DemandForecast> {
    return this.demandForecastsEndpoint.create(forecast);
  }

  /**
   * Retrieves every automatic recommendation.
   *
   * @returns An observable emitting the recommendations.
   */
  getRecommendations(): Observable<Recommendation[]> {
    return this.recommendationsEndpoint.getAll();
  }

  /**
   * Replaces the state of an existing recommendation.
   *
   * @param recommendation - Recommendation carrying the new state.
   * @returns An observable emitting the updated recommendation.
   */
  updateRecommendation(recommendation: Recommendation): Observable<Recommendation> {
    return this.recommendationsEndpoint.update(recommendation, recommendation.id);
  }
}
