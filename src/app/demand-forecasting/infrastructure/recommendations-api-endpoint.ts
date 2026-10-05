import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { BaseApiEndpoint } from '../../shared/infrastructure/base-api-endpoint';
import { Recommendation } from '../domain/model/recommendation.entity';
import { RecommendationAssembler } from './recommendation-assembler';
import { RecommendationResource, RecommendationsResponse } from './recommendations-response';

/** URL of the recommendations collection. */
const recommendationsEndpointUrl = `${environment.platformProviderApiBaseUrl}${environment.platformProviderRecommendationsEndpointPath}`;

/** HTTP client for the recommendations collection. */
export class RecommendationsApiEndpoint extends BaseApiEndpoint<
  Recommendation,
  RecommendationResource,
  RecommendationsResponse,
  RecommendationAssembler
> {
  /**
   * @param http - HTTP client used to perform the requests.
   */
  constructor(http: HttpClient) {
    super(http, recommendationsEndpointUrl, new RecommendationAssembler());
  }
}
