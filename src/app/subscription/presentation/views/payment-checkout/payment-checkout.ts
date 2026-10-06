import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { SubscriptionStore } from '../../../application/subscription.store';
import { PaymentMethod } from '../../../domain/model/payment-method';
import { SubscribeToPlanCommand } from '../../../domain/model/subscribe-to-plan.command';

/** Payment method offered in the checkout. */
interface PaymentMethodOption {
  /** Payment method selected by the option. */
  value: PaymentMethod;
  /** Name shown to the user. */
  label: string;
  /** Short explanation shown under the name. */
  hint: string;
}

/** Simulated payment confirmation for the plan chosen in the catalog. */
@Component({
  imports: [RouterLink],
  selector: 'app-payment-checkout',
  styleUrl: './payment-checkout.css',
  templateUrl: './payment-checkout.html',
})
export class PaymentCheckout implements OnInit {
  /** Application state of the bounded context. */
  protected readonly store = inject(SubscriptionStore);
  /** Route carrying the identifier of the chosen plan. */
  private readonly route = inject(ActivatedRoute);
  /** Router used to go back to the plan list. */
  private readonly router = inject(Router);

  /** Payment methods the user can choose from. */
  protected readonly methods: PaymentMethodOption[] = [
    { value: 'STRIPE', label: 'Stripe', hint: 'Tarjeta de crédito o débito' },
    { value: 'PAYPAL', label: 'PayPal', hint: 'Saldo o cuenta de PayPal' },
  ];

  /** Payment method selected by the user. */
  protected readonly method = signal<PaymentMethod>('STRIPE');

  /** Identifier of the plan taken from the route. */
  private readonly planId = toSignal(
    this.route.paramMap.pipe(map((params) => Number(params.get('planId')))),
    { initialValue: Number.NaN },
  );

  /** Plan chosen by the user, or `null` while it is unknown. */
  protected readonly plan = computed(() => this.store.findPlan(this.planId()));

  /** Loads the plans and the current subscription when the catalog was not visited first. */
  ngOnInit(): void {
    if (this.store.plans().length === 0) {
      void this.store.loadPlans();
    }
    if (!this.store.currentSubscription()) {
      void this.store.loadCurrentSubscription();
    }
  }

  /** Pays the chosen plan with the selected method and returns to the plan list. */
  protected async onConfirm(): Promise<void> {
    const plan = this.plan();
    if (!plan || this.store.processing()) {
      return;
    }
    const activated = await this.store.subscribeToPlan(
      new SubscribeToPlanCommand({ planId: plan.id, paymentMethod: this.method() }),
    );
    if (activated) {
      await this.router.navigate(['../../plans'], { relativeTo: this.route });
    }
  }
}
