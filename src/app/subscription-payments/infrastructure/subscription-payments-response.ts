import {BaseResource, BaseResponse} from '../../shared/infrastructure/base-response';
import {PaymentMethod, SubscriptionStatus} from '../domain/model/subscription.entity';

export interface PlanResource extends BaseResource {
  id: number;
  name: string;
  monthlyPrice: number;
  features: string[];
  highlighted: boolean;
}

export interface PlansResponse extends BaseResponse {
  plans: PlanResource[];
}

export interface SubscriptionResource extends BaseResource {
  id: number;
  planId: number;
  status: SubscriptionStatus;
  renewalDate: string;
  paymentMethod: PaymentMethod;
}
