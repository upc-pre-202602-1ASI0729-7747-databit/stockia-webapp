import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {BaseApiEndpoint} from '../../shared/infrastructure/base-api-endpoint';
import {environment} from '../../../environments/environment';
import {Recommendation} from '../domain/model/recommendation.entity';
import {RecommendationAssembler} from './recommendation-assembler';
import {RecommendationResource, RecommendationsResponse} from './demand-forecasts-response';

/**
 * Endpoint /recommendations (Administrator).
 * @author DataBit
 */
export class RecommendationsApiEndpoint extends BaseApiEndpoint<Recommendation, RecommendationResource, RecommendationsResponse,
  RecommendationAssembler> {
  constructor(http: HttpClient) {
    super(http, `${environment.platformProviderApiBaseUrl}${environment.platformProviderRecommendationsEndpointPath}`,
      new RecommendationAssembler());
  }

  apply(id: number): Observable<Recommendation> {
    return this.http.post<RecommendationResource>(`${this.endpointUrl}/${id}/apply`, {}).pipe(
      map(resource => this.assembler.toEntityFromResource(resource)), catchError(this.handleError));
  }
}
