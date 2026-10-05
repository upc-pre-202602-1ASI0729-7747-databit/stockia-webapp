import { BaseResource, BaseResponse } from '../../shared/infrastructure/base-response';
import { PaymentMethod } from '../domain/model/payment-method';
import { SubscriptionStatus } from '../domain/model/subscription-status';

/** API representation of a subscription. */
export interface SubscriptionResource extends BaseResource {
  /** Identifier of the subscribed plan. */
  planId: number;
  /** Current lifecycle state. */
  status: SubscriptionStatus;
  /** Date of the next renewal, in `YYYY-MM-DD` format. */
  renewalDate: string;
  /** Payment provider used to pay the subscription. */
  paymentMethod: PaymentMethod;
}

/** Envelope returned by APIs that wrap the list of subscriptions. */
export interface SubscriptionsResponse extends BaseResponse {
  /** Subscriptions contained in the response. */
  subscriptions: SubscriptionResource[];
}
