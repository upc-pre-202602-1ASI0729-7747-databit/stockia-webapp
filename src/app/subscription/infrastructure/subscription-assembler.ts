import { BaseAssembler } from '../../shared/infrastructure/base-assembler';
import { Subscription } from '../domain/model/subscription.entity';
import { SubscriptionResource, SubscriptionsResponse } from './subscriptions-response';

/** Converts between subscription entities and their API representations. */
export class SubscriptionAssembler implements BaseAssembler<
  Subscription,
  SubscriptionResource,
  SubscriptionsResponse
> {
  /**
   * Builds a subscription entity from an API resource.
   *
   * @param resource - Subscription as returned by the API.
   * @returns The matching domain entity, without its plan.
   */
  toEntityFromResource(resource: SubscriptionResource): Subscription {
    return new Subscription({
      id: resource.id,
      planId: resource.planId,
      status: resource.status,
      renewalDate: resource.renewalDate,
      paymentMethod: resource.paymentMethod,
    });
  }

  /**
   * Builds the API resource of a subscription entity.
   * The plan of the entity is not part of the resource.
   *
   * @param entity - Subscription to send to the API.
   * @returns The matching API resource.
   */
  toResourceFromEntity(entity: Subscription): SubscriptionResource {
    return {
      id: entity.id,
      planId: entity.planId,
      status: entity.status,
      renewalDate: entity.renewalDate,
      paymentMethod: entity.paymentMethod,
    };
  }

  /**
   * Builds subscription entities from an enveloped API response.
   *
   * @param response - Envelope containing the subscriptions.
   * @returns The subscriptions as domain entities.
   */
  toEntitiesFromResponse(response: SubscriptionsResponse): Subscription[] {
    return (response.subscriptions ?? []).map((resource) => this.toEntityFromResource(resource));
  }
}
