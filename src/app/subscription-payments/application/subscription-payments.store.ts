import {computed, inject, Service, signal} from '@angular/core';
import {firstValueFrom} from 'rxjs';
import {SubscriptionPaymentsApi} from '../infrastructure/subscription-payments-api';
import {Plan} from '../domain/model/plan.entity';
import {PaymentMethod, Subscription} from '../domain/model/subscription.entity';

/**
 * State of Subscription &amp; Payments: the plan catalog and the subscription of the restaurant.
 * @author DataBit
 */
@Service()
export class SubscriptionPaymentsStore {
  private readonly subscriptionApi = inject(SubscriptionPaymentsApi);
  private readonly plansSignal = signal<Plan[]>([]);
  private readonly subscriptionSignal = signal<Subscription | null>(null);
  private readonly payingSignal = signal<boolean>(false);

  readonly plans = this.plansSignal.asReadonly();
  readonly subscription = this.subscriptionSignal.asReadonly();
  readonly paying = this.payingSignal.asReadonly();
  readonly currentPlan = computed(() => this.plansSignal().find(plan => plan.id === this.subscriptionSignal()?.planId) ?? null);

  loadPlans(): Promise<void> {
    return firstValueFrom(this.subscriptionApi.getPlans()).then(plans => this.plansSignal.set(plans));
  }

  loadSubscription(): Promise<void> {
    return firstValueFrom(this.subscriptionApi.getCurrentSubscription()).then(subscription => this.subscriptionSignal.set(subscription));
  }

  /** Simulated Stripe / PayPal checkout, then the plan is active for 30 days. */
  async changePlan(plan: Plan, paymentMethod: PaymentMethod): Promise<Subscription> {
    this.payingSignal.set(true);
    try {
      const subscription = await firstValueFrom(this.subscriptionApi.changePlan(plan.id, plan.isFree ? 'NONE' : paymentMethod));
      this.subscriptionSignal.set(subscription);
      return subscription;
    } finally {
      this.payingSignal.set(false);
    }
  }
}
