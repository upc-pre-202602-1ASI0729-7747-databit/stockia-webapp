import {inject, Service} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {BaseApi} from '../../shared/infrastructure/base-api';
import {ApiError} from '../../shared/infrastructure/api-error';
import {environment} from '../../../environments/environment';
import {Plan} from '../domain/model/plan.entity';
import {PaymentMethod, Subscription} from '../domain/model/subscription.entity';
import {PlansApiEndpoint} from './plans-api-endpoint';
import {SubscriptionResource} from './subscription-payments-response';

/**
 * Facade of the Subscription &amp; Payments API (catalog, current subscription and simulated checkout).
 * @author DataBit
 */
@Service()
export class SubscriptionPaymentsApi extends BaseApi {
  private readonly http = inject(HttpClient);
  private readonly plansEndpoint = new PlansApiEndpoint(this.http);
  private readonly subscriptionsUrl = `${environment.platformProviderApiBaseUrl}${environment.platformProviderSubscriptionsEndpointPath}`;

  getPlans(): Observable<Plan[]> {
    return this.plansEndpoint.getAll();
  }

  getCurrentSubscription(): Observable<Subscription> {
    return this.http.get<SubscriptionResource>(`${this.subscriptionsUrl}/current`).pipe(map(SubscriptionPaymentsApi.toEntity),
      catchError(error => throwError(() => ApiError.from(error))));
  }

  changePlan(planId: number, paymentMethod: PaymentMethod): Observable<Subscription> {
    return this.http.post<SubscriptionResource>(this.subscriptionsUrl, {planId, paymentMethod}).pipe(map(SubscriptionPaymentsApi.toEntity),
      catchError(error => throwError(() => ApiError.from(error))));
  }

  private static toEntity(resource: SubscriptionResource): Subscription {
    return new Subscription(resource.id, resource.planId, resource.status, resource.renewalDate, resource.paymentMethod);
  }
}
