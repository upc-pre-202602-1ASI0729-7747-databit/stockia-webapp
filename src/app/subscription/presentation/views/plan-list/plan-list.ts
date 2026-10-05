import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { SubscriptionStore } from '../../../application/subscription.store';
import { PaymentMethod } from '../../../domain/model/payment-method';
import { Plan } from '../../../domain/model/plan.entity';
import { SubscribeToPlanCommand } from '../../../domain/model/subscribe-to-plan.command';
import { PlanCard } from '../../components/plan-card/plan-card';

/** Time the activation confirmation stays visible, in milliseconds. */
const ACTIVATION_NOTICE_MS = 2500;

/** "Planes y suscripción" page: plan catalog with simulated payment. */
@Component({
  imports: [PlanCard],
  selector: 'app-plan-list',
  styleUrl: './plan-list.css',
  templateUrl: './plan-list.html',
})
export class PlanList implements OnInit {
  /** Application state of the bounded context. */
  protected readonly store = inject(SubscriptionStore);

  /** Plan and payment method being processed, or `null` when idle. */
  protected readonly payment = signal<{ planId: number; method: PaymentMethod } | null>(null);
  /** Identifier of the plan whose activation is being confirmed. */
  protected readonly activatedPlanId = signal<number | null>(null);

  /** Plan of the subscription while it is active, or `null` otherwise. */
  protected readonly activePlan = computed(() =>
    this.store.currentSubscription()?.isActive() ? this.store.currentPlan() : null,
  );

  /** Timer hiding the activation confirmation. */
  private activationTimer: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.activationTimer));
  }

  /** Loads the plans and the current subscription. */
  ngOnInit(): void {
    void this.store.loadPlans();
    void this.store.loadCurrentSubscription();
  }

  /**
   * Pays a plan with the chosen method and confirms the activation.
   *
   * @param plan - Plan to subscribe to.
   * @param method - Payment method chosen by the user.
   */
  protected async onPay(plan: Plan, method: PaymentMethod): Promise<void> {
    if (this.store.processing()) {
      return;
    }
    this.payment.set({ planId: plan.id, method });
    const activated = await this.store.subscribeToPlan(
      new SubscribeToPlanCommand({ planId: plan.id, paymentMethod: method }),
    );
    this.payment.set(null);
    if (activated) {
      this.showActivationNotice(plan.id);
    }
  }

  /**
   * Tells which payment method is being processed for a plan.
   *
   * @param plan - Plan to check.
   * @returns The method being processed, or `null` when the plan is idle.
   */
  protected processingMethodOf(plan: Plan): PaymentMethod | null {
    const payment = this.payment();
    return payment?.planId === plan.id ? payment.method : null;
  }

  /**
   * Shows the activation confirmation on a plan for a short time.
   *
   * @param planId - Identifier of the activated plan.
   */
  private showActivationNotice(planId: number): void {
    clearTimeout(this.activationTimer);
    this.activatedPlanId.set(planId);
    this.activationTimer = setTimeout(() => this.activatedPlanId.set(null), ACTIVATION_NOTICE_MS);
  }
}
