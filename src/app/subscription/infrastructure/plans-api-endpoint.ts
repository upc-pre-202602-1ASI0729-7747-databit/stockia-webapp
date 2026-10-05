import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { BaseApiEndpoint } from '../../shared/infrastructure/base-api-endpoint';
import { Plan } from '../domain/model/plan.entity';
import { PlanAssembler } from './plan-assembler';
import { PlanResource, PlansResponse } from './plans-response';

/** URL of the plans collection. */
const plansEndpointUrl = `${environment.platformProviderApiBaseUrl}${environment.platformProviderPlansEndpointPath}`;

/** HTTP client for the plans collection. */
export class PlansApiEndpoint extends BaseApiEndpoint<
  Plan,
  PlanResource,
  PlansResponse,
  PlanAssembler
> {
  /**
   * @param http - HTTP client used to perform the requests.
   */
  constructor(http: HttpClient) {
    super(http, plansEndpointUrl, new PlanAssembler());
  }
}
