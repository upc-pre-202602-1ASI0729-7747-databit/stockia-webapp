import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BaseApiEndpoint } from '../../shared/infrastructure/base-api-endpoint';
import { Subscription } from '../domain/model/subscription.entity';
import { SubscriptionAssembler } from './subscription-assembler';
import { SubscriptionResource, SubscriptionsResponse } from './subscriptions-response';

/** URL of the subscriptions collection. */
const subscriptionsEndpointUrl = `${environment.platformProviderApiBaseUrl}${environment.platformProviderSubscriptionsEndpointPath}`;

/** HTTP client for the subscriptions collection. */
export class SubscriptionsApiEndpoint extends BaseApiEndpoint<
  Subscription,
  SubscriptionResource,
  SubscriptionsResponse,
  SubscriptionAssembler
> {
  /**
   * @param http - HTTP client used to perform the requests.
   */
  constructor(http: HttpClient) {
    super(http, subscriptionsEndpointUrl, new SubscriptionAssembler());
  }

  /**
   * Creates a subscription, letting the API assign its identifier.
   *
   * @param entity - Subscription to create.
   * @returns An observable emitting the created subscription.
   */
  override create(entity: Subscription): Observable<Subscription> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...resource } = this.assembler.toResourceFromEntity(entity);
    return this.http.post<SubscriptionResource>(this.endpointUrl, resource).pipe(
      map((created) => this.assembler.toEntityFromResource(created)),
      catchError(this.handleError('Failed to create entity')),
    );
  }
}
