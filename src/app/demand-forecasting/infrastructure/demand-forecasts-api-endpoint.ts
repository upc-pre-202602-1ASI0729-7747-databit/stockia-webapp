import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { BaseApiEndpoint } from '../../shared/infrastructure/base-api-endpoint';
import { DemandForecast } from '../domain/model/demand-forecast.entity';
import { DemandForecastAssembler } from './demand-forecast-assembler';
import { DemandForecastResource, DemandForecastsResponse } from './demand-forecasts-response';

/** URL of the demand forecasts collection. */
const demandForecastsEndpointUrl = `${environment.platformProviderApiBaseUrl}${environment.platformProviderDemandForecastsEndpointPath}`;

/** HTTP client for the demand forecasts collection. */
export class DemandForecastsApiEndpoint extends BaseApiEndpoint<
  DemandForecast,
  DemandForecastResource,
  DemandForecastsResponse,
  DemandForecastAssembler
> {
  /**
   * @param http - HTTP client used to perform the requests.
   */
  constructor(http: HttpClient) {
    super(http, demandForecastsEndpointUrl, new DemandForecastAssembler());
  }
}
