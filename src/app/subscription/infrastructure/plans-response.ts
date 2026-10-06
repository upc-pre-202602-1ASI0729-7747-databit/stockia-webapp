import { BaseResource, BaseResponse } from '../../shared/infrastructure/base-response';

/** API representation of a subscription plan. */
export interface PlanResource extends BaseResource {
  /** Commercial name of the plan. */
  name: string;
  /** Monthly price of the plan, in soles. */
  monthlyPrice: number;
  /** Features included in the plan. */
  features: string[];
  /** Whether the plan is promoted as the recommended option. */
  highlighted: boolean;
}

/** Envelope returned by APIs that wrap the list of plans. */
export interface PlansResponse extends BaseResponse {
  /** Plans contained in the response. */
  plans: PlanResource[];
}
