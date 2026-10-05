import { PaymentMethod } from './payment-method';

/** Request to subscribe to a plan using a payment method. */
export class SubscribeToPlanCommand {
  /** Identifier of the plan to subscribe to. */
  #planId: number;
  /** Payment provider chosen to pay the plan. */
  #paymentMethod: PaymentMethod;

  /**
   * @param command - Plan and payment method chosen by the user.
   */
  constructor(command: { planId: number; paymentMethod: PaymentMethod }) {
    this.#planId = command.planId;
    this.#paymentMethod = command.paymentMethod;
  }

  /** Identifier of the plan to subscribe to. */
  get planId(): number {
    return this.#planId;
  }

  set planId(value: number) {
    this.#planId = value;
  }

  /** Payment provider chosen to pay the plan. */
  get paymentMethod(): PaymentMethod {
    return this.#paymentMethod;
  }

  set paymentMethod(value: PaymentMethod) {
    this.#paymentMethod = value;
  }
}
