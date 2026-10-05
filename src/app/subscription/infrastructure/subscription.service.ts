import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApi } from '../../shared/infrastructure/base-api';
import { Plan } from '../domain/model/plan.entity';
import { Subscription } from '../domain/model/subscription.entity';
import { PlansApiEndpoint } from './plans-api-endpoint';
import { SubscriptionsApiEndpoint } from './subscriptions-api-endpoint';

/** API facade of the Subscription and Payment Management bounded context. */
@Injectable({ providedIn: 'root' })
export class SubscriptionService extends BaseApi {
  /** HTTP client shared by the endpoints. */
  private readonly http = inject(HttpClient);
  /** Endpoint of the plans collection. */
  private readonly plansEndpoint = new PlansApiEndpoint(this.http);
  /** Endpoint of the subscriptions collection. */
  private readonly subscriptionsEndpoint = new SubscriptionsApiEndpoint(this.http);

  /**
   * Retrieves every plan offered by the platform.
   *
   * @returns An observable emitting the plans.
   */
  getPlans(): Observable<Plan[]> {
    return this.plansEndpoint.getAll();
  }

  /**
   * Retrieves a plan by its identifier.
   *
   * @param id - Identifier of the plan.
   * @returns An observable emitting the plan.
   */
  getPlan(id: number): Observable<Plan> {
    return this.plansEndpoint.getById(id);
  }

  /**
   * Retrieves every subscription.
   *
   * @returns An observable emitting the subscriptions.
   */
  getSubscriptions(): Observable<Subscription[]> {
    return this.subscriptionsEndpoint.getAll();
  }

  /**
   * Creates a subscription.
   *
   * @param subscription - Subscription to create.
   * @returns An observable emitting the created subscription.
   */
  createSubscription(subscription: Subscription): Observable<Subscription> {
    return this.subscriptionsEndpoint.create(subscription);
  }

  /**
   * Replaces the state of an existing subscription.
   *
   * @param subscription - Subscription carrying the new state.
   * @returns An observable emitting the updated subscription.
   */
  updateSubscription(subscription: Subscription): Observable<Subscription> {
    return this.subscriptionsEndpoint.update(subscription, subscription.id);
  }
}
