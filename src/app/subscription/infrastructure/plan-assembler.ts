import { BaseAssembler } from '../../shared/infrastructure/base-assembler';
import { Plan } from '../domain/model/plan.entity';
import { PlanResource, PlansResponse } from './plans-response';

/** Converts between plan entities and their API representations. */
export class PlanAssembler implements BaseAssembler<Plan, PlanResource, PlansResponse> {
  /**
   * Builds a plan entity from an API resource.
   *
   * @param resource - Plan as returned by the API.
   * @returns The matching domain entity.
   */
  toEntityFromResource(resource: PlanResource): Plan {
    return new Plan({
      id: resource.id,
      name: resource.name,
      monthlyPrice: resource.monthlyPrice,
      features: resource.features ?? [],
      highlighted: resource.highlighted ?? false,
    });
  }

  /**
   * Builds the API resource of a plan entity.
   *
   * @param entity - Plan to send to the API.
   * @returns The matching API resource.
   */
  toResourceFromEntity(entity: Plan): PlanResource {
    return {
      id: entity.id,
      name: entity.name,
      monthlyPrice: entity.monthlyPrice,
      features: [...entity.features],
      highlighted: entity.highlighted,
    };
  }

  /**
   * Builds plan entities from an enveloped API response.
   *
   * @param response - Envelope containing the plans.
   * @returns The plans as domain entities.
   */
  toEntitiesFromResponse(response: PlansResponse): Plan[] {
    return (response.plans ?? []).map((resource) => this.toEntityFromResource(resource));
  }
}
