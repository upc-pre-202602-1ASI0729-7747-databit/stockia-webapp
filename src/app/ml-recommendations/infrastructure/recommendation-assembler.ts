import {BaseAssembler} from '../../shared/infrastructure/base-assembler';
import {Recommendation} from '../domain/model/recommendation.entity';
import {RecommendationResource, RecommendationsResponse} from './demand-forecasts-response';

/**
 * Translates recommendations from the API.
 * @author DataBit
 */
export class RecommendationAssembler implements BaseAssembler<Recommendation, RecommendationResource, RecommendationsResponse> {
  toEntityFromResource(resource: RecommendationResource): Recommendation {
    return new Recommendation({id: resource.id, type: resource.type, message: resource.message, expectedImpact: resource.expectedImpact,
      applied: resource.applied, createdAt: new Date(resource.createdAt)});
  }

  toResourceFromEntity(entity: Recommendation): RecommendationResource {
    return {id: entity.id, type: entity.type, message: entity.message, expectedImpact: entity.expectedImpact, applied: entity.applied,
      createdAt: entity.createdAt.toISOString()};
  }

  toEntitiesFromResponse(response: RecommendationsResponse): Recommendation[] {
    return response.recommendations.map(resource => this.toEntityFromResource(resource));
  }
}
