import {BaseEntity} from '../../../shared/domain/model/base-entity';

export type SubscriptionStatus = 'ACTIVE' | 'PAST_DUE' | 'CANCELED';
export type PaymentMethod = 'NONE' | 'STRIPE' | 'PAYPAL';

/**
 * The plan the restaurant is subscribed to; it renews every 30 days.
 * @author DataBit
 */
export class Subscription implements BaseEntity {
  constructor(
    readonly id: number,
    readonly planId: number,
    readonly status: SubscriptionStatus,
    readonly renewalDate: string,
    readonly paymentMethod: PaymentMethod
  ) {}
}
