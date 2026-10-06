import { BaseResource, BaseResponse } from '../../shared/infrastructure/base-response';
import { RecommendationType } from '../domain/model/recommendation-type';

/** API representation of an automatic recommendation. */
export interface RecommendationResource extends BaseResource {
  /** Kind of recommendation. */
  type: RecommendationType;
  /** Action the restaurant is advised to take. */
  message: string;
  /** Expected effect of applying the recommendation. */
  expectedImpact: string;
  /** Whether the restaurant already applied the recommendation. */
  applied: boolean;
}

/** Envelope returned by APIs that wrap the list of recommendations. */
export interface RecommendationsResponse extends BaseResponse {
  /** Recommendations contained in the response. */
  recommendations: RecommendationResource[];
}
