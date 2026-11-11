import {BaseAssembler} from '../../shared/infrastructure/base-assembler';
import {Plan} from '../domain/model/plan.entity';
import {PlanResource, PlansResponse} from './subscription-payments-response';

/**
 * Translates the plan catalog.
 * @author DataBit
 */
export class PlanAssembler implements BaseAssembler<Plan, PlanResource, PlansResponse> {
  toEntityFromResource(resource: PlanResource): Plan {
    return new Plan(resource.id, resource.name, Number(resource.monthlyPrice), resource.features, resource.highlighted);
  }

  toResourceFromEntity(entity: Plan): PlanResource {
    return {id: entity.id, name: entity.name, monthlyPrice: entity.monthlyPrice, features: entity.features, highlighted: entity.highlighted};
  }

  toEntitiesFromResponse(response: PlansResponse): Plan[] {
    return response.plans.map(resource => this.toEntityFromResource(resource));
  }
}
