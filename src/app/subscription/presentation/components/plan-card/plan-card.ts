import { Component, input, output } from '@angular/core';
import { PaymentMethod } from '../../../domain/model/payment-method';
import { Plan } from '../../../domain/model/plan.entity';

/** Card presenting a plan with its price, features and payment actions. */
@Component({
  selector: 'app-plan-card',
  styleUrl: './plan-card.css',
  templateUrl: './plan-card.html',
})
export class PlanCard {
  /** Plan presented by the card. */
  readonly plan = input.required<Plan>();
  /** Payment method being processed for this plan, or `null` when idle. */
  readonly processingMethod = input<PaymentMethod | null>(null);
  /** Whether the payment actions are disabled. */
  readonly disabled = input(false);
  /** Whether the subscription to this plan was just activated. */
  readonly activated = input(false);

  /** Emits the payment method chosen to pay the plan. */
  readonly pay = output<PaymentMethod>();
}
