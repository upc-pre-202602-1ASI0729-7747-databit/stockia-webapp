import { BaseAssembler } from '../../shared/infrastructure/base-assembler';
import { Recommendation } from '../domain/model/recommendation.entity';
import { RecommendationResource, RecommendationsResponse } from './recommendations-response';

/** Converts between recommendation entities and their API representations. */
export class RecommendationAssembler implements BaseAssembler<
  Recommendation,
  RecommendationResource,
  RecommendationsResponse
> {
  /**
   * Builds a recommendation entity from an API resource.
   *
   * @param resource - Recommendation as returned by the API.
   * @returns The matching domain entity.
   */
  toEntityFromResource(resource: RecommendationResource): Recommendation {
    return new Recommendation({
      id: resource.id,
      type: resource.type,
      message: resource.message,
      expectedImpact: resource.expectedImpact ?? '',
      applied: resource.applied ?? false,
    });
  }

  /**
   * Builds the API resource of a recommendation entity.
   *
   * @param entity - Recommendation to send to the API.
   * @returns The matching API resource.
   */
  toResourceFromEntity(entity: Recommendation): RecommendationResource {
    return {
      id: entity.id,
      type: entity.type,
      message: entity.message,
      expectedImpact: entity.expectedImpact,
      applied: entity.applied,
    };
  }

  /**
   * Builds recommendation entities from an enveloped API response.
   *
   * @param response - Envelope containing the recommendations.
   * @returns The recommendations as domain entities.
   */
  toEntitiesFromResponse(response: RecommendationsResponse): Recommendation[] {
    return (response.recommendations ?? []).map((resource) => this.toEntityFromResource(resource));
  }
}
