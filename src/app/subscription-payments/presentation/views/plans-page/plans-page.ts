import {Component, inject, OnInit, signal} from '@angular/core';
import {MatCardModule} from '@angular/material/card';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {TranslatePipe} from '@ngx-translate/core';
import {SubscriptionPaymentsStore} from '../../../application/subscription-payments.store';
import {Plan} from '../../../domain/model/plan.entity';
import {PaymentMethod} from '../../../domain/model/subscription.entity';
import {NotificationService} from '../../../../shared/application/notification.service';
import {MoneyPipe} from '../../../../shared/presentation/pipes/money.pipe';
import {LocalDatePipe} from '../../../../shared/presentation/pipes/local-date.pipe';

/**
 * Upgrade plan (Administrator): plan catalog and simulated Stripe / PayPal checkout.
 * @author DataBit
 */
@Component({
  selector: 'app-plans-page',
  imports: [MatCardModule, MatButtonModule, MatIconModule, TranslatePipe, MoneyPipe, LocalDatePipe],
  templateUrl: './plans-page.html',
  styles: `.plans { display: grid; gap: 16px; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); }
    .plan { position: relative; } .plan.highlighted { border: 2px solid #b84a1a; }
    .badge { position: absolute; top: 12px; right: 12px; } .price { font-size: 2rem; font-weight: 700; color: #14301f; margin: 8px 0; }
    .price small { font-size: 0.9rem; font-weight: 400; color: #55635c; }
    ul { padding: 0; list-style: none; display: grid; gap: 6px; } li { display: flex; gap: 6px; align-items: center; }
    li mat-icon { color: #276b46; font-size: 18px; width: 18px; height: 18px; }
    .pay { display: flex; flex-direction: column; gap: 8px; }`
})
export class PlansPage implements OnInit {
  protected readonly store = inject(SubscriptionPaymentsStore);
  private readonly notifications = inject(NotificationService);
  /** Plan and method being paid, so only that button shows "Processing…". */
  protected readonly processing = signal<string | null>(null);
  protected readonly providers: {method: PaymentMethod; label: string}[] = [{method: 'STRIPE', label: 'Stripe'}, {method: 'PAYPAL', label: 'PayPal'}];

  ngOnInit(): void {
    this.store.loadPlans().then(() => this.store.loadSubscription()).catch(error => this.notifications.error(error, 'errors.load'));
  }

  protected isCurrent(plan: Plan): boolean {
    return this.store.subscription()?.planId === plan.id;
  }

  protected async choose(plan: Plan, method: PaymentMethod): Promise<void> {
    this.processing.set(`${plan.id}-${method}`);
    try {
      await this.store.changePlan(plan, method);
      this.notifications.success('plans.activated', {plan: plan.name});
    } catch (error) {
      this.notifications.error(error);
    } finally {
      this.processing.set(null);
    }
  }
}
