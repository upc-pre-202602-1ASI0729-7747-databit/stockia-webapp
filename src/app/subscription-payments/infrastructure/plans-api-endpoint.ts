import {HttpClient} from '@angular/common/http';
import {BaseApiEndpoint} from '../../shared/infrastructure/base-api-endpoint';
import {environment} from '../../../environments/environment';
import {Plan} from '../domain/model/plan.entity';
import {PlanAssembler} from './plan-assembler';
import {PlanResource, PlansResponse} from './subscription-payments-response';

/**
 * Endpoint /plans (public catalog).
 * @author DataBit
 */
export class PlansApiEndpoint extends BaseApiEndpoint<Plan, PlanResource, PlansResponse, PlanAssembler> {
  constructor(http: HttpClient) {
    super(http, `${environment.platformProviderApiBaseUrl}${environment.platformProviderPlansEndpointPath}`, new PlanAssembler());
  }
}
