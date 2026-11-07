import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {BaseApiEndpoint} from '../../shared/infrastructure/base-api-endpoint';
import {environment} from '../../../environments/environment';
import {DemandForecast} from '../domain/model/demand-forecast.entity';
import {DemandForecastAssembler} from './demand-forecast-assembler';
import {DemandForecastResource, DemandForecastsResponse} from './demand-forecasts-response';

/**
 * Endpoint /demand-forecasts: latest forecast and generation of a new one (ONNX model of the API).
 * @author DataBit
 */
export class DemandForecastsApiEndpoint extends BaseApiEndpoint<DemandForecast, DemandForecastResource, DemandForecastsResponse,
  DemandForecastAssembler> {
  constructor(http: HttpClient) {
    super(http, `${environment.platformProviderApiBaseUrl}${environment.platformProviderDemandForecastsEndpointPath}`,
      new DemandForecastAssembler());
  }

  getLatest(): Observable<DemandForecast> {
    return this.http.get<DemandForecastResource>(`${this.endpointUrl}/latest`).pipe(
      map(resource => this.assembler.toEntityFromResource(resource)), catchError(this.handleError));
  }

  generate(horizonDays = 7): Observable<DemandForecast> {
    return this.http.post<DemandForecastResource>(this.endpointUrl, {horizonDays}).pipe(
      map(resource => this.assembler.toEntityFromResource(resource)), catchError(this.handleError));
  }
}
