import { DatePipe } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';
import { PaymentMethod } from '../../../domain/model/payment-method';
import { Subscription } from '../../../domain/model/subscription.entity';
import { SubscriptionStatus } from '../../../domain/model/subscription-status';

/** Text shown for each subscription status. */
const STATUS_LABELS: Record<SubscriptionStatus, string> = {
  ACTIVE: 'Activa',
  PENDING: 'Pendiente',
  CANCELLED: 'Cancelada',
  EXPIRED: 'Vencida',
};

/** Badge class used for each subscription status. */
const STATUS_BADGES: Record<SubscriptionStatus, string> = {
  ACTIVE: 'badge-success',
  PENDING: 'badge-warning',
  CANCELLED: 'badge-danger',
  EXPIRED: 'badge-danger',
};

/** Text shown for each payment method. */
const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  STRIPE: 'Stripe',
  PAYPAL: 'PayPal',
};

/** Card summarizing the current subscription with its renew and cancel actions. */
@Component({
  imports: [DatePipe],
  selector: 'app-current-subscription-card',
  styleUrl: './current-subscription-card.css',
  templateUrl: './current-subscription-card.html',
})
export class CurrentSubscriptionCard {
  /** Subscription presented by the card. */
  readonly subscription = input.required<Subscription>();
  /** Whether the actions are disabled because a change is being saved. */
  readonly processing = input(false);

  /** Emits when the user asks to renew the subscription. */
  readonly renew = output<void>();
  /** Emits when the user asks to cancel the subscription. */
  readonly cancel = output<void>();

  /** Name of the subscribed plan. */
  protected readonly planName = computed(
    () => this.subscription().plan?.name ?? `Plan #${this.subscription().planId}`,
  );
  /** Text of the status badge. */
  protected readonly statusLabel = computed(() => STATUS_LABELS[this.subscription().status]);
  /** Class of the status badge. */
  protected readonly statusBadge = computed(() => STATUS_BADGES[this.subscription().status]);
  /** Name of the payment method. */
  protected readonly paymentMethodLabel = computed(
    () => PAYMENT_METHOD_LABELS[this.subscription().paymentMethod],
  );
  /** Whether the subscription is already cancelled. */
  protected readonly cancelled = computed(() => this.subscription().status === 'CANCELLED');

  /** Days left until the renewal date, in words. */
  protected readonly remainingDays = computed(() => {
    const days = this.subscription().daysUntilRenewal();
    if (days === 0) {
      return 'Vence hoy';
    }
    const amount = Math.abs(days) === 1 ? '1 día' : `${Math.abs(days)} días`;
    return days > 0 ? amount : `Venció hace ${amount}`;
  });
}
