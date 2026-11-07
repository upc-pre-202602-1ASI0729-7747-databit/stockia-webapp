import {inject, Service} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {BaseApi} from '../../shared/infrastructure/base-api';
import {DemandForecast} from '../domain/model/demand-forecast.entity';
import {Recommendation} from '../domain/model/recommendation.entity';
import {DemandForecastsApiEndpoint} from './demand-forecasts-api-endpoint';
import {RecommendationsApiEndpoint} from './recommendations-api-endpoint';

/**
 * Facade of the ML &amp; Recommendations API.
 * @author DataBit
 */
@Service()
export class MlRecommendationsApi extends BaseApi {
  private readonly http = inject(HttpClient);
  private readonly forecastsEndpoint = new DemandForecastsApiEndpoint(this.http);
  private readonly recommendationsEndpoint = new RecommendationsApiEndpoint(this.http);

  getLatestForecast(): Observable<DemandForecast> {
    return this.forecastsEndpoint.getLatest();
  }

  generateForecast(horizonDays = 7): Observable<DemandForecast> {
    return this.forecastsEndpoint.generate(horizonDays);
  }

  getRecommendations(): Observable<Recommendation[]> {
    return this.recommendationsEndpoint.getAll();
  }

  applyRecommendation(id: number): Observable<Recommendation> {
    return this.recommendationsEndpoint.apply(id);
  }
}
