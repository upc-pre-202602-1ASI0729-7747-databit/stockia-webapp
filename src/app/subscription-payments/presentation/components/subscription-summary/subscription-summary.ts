import {Component, inject, OnInit} from '@angular/core';
import {RouterLink} from '@angular/router';
import {MatCardModule} from '@angular/material/card';
import {MatButtonModule} from '@angular/material/button';
import {TranslatePipe} from '@ngx-translate/core';
import {SubscriptionPaymentsStore} from '../../../application/subscription-payments.store';
import {MoneyPipe} from '../../../../shared/presentation/pipes/money.pipe';
import {LocalDatePipe} from '../../../../shared/presentation/pipes/local-date.pipe';

/**
 * Subscription type of the restaurant (Administrator): plan, price, status, renewal and payment method.
 * @author DataBit
 */
@Component({
  selector: 'app-subscription-summary',
  imports: [RouterLink, MatCardModule, MatButtonModule, TranslatePipe, MoneyPipe, LocalDatePipe],
  template: `
    <mat-card appearance="outlined">
      <mat-card-header><mat-card-title>{{ 'settings.subscription.title' | translate }}</mat-card-title>
        <mat-card-subtitle>{{ 'settings.subscription.description' | translate }}</mat-card-subtitle></mat-card-header>
      <mat-card-content>
        @if (store.subscription(); as subscription) {
          <dl class="details">
            <dt>{{ 'settings.subscription.plan' | translate }}</dt><dd>{{ store.currentPlan()?.name }}</dd>
            <dt>{{ 'settings.subscription.price' | translate }}</dt><dd>{{ store.currentPlan()?.monthlyPrice | money }}{{ 'plans.per-month' | translate }}</dd>
            <dt>{{ 'settings.subscription.status' | translate }}</dt><dd>{{ 'settings.subscription.statuses.' + subscription.status | translate }}</dd>
            <dt>{{ 'settings.subscription.renewal' | translate }}</dt><dd>{{ subscription.renewalDate | localDate }}</dd>
            <dt>{{ 'settings.subscription.payment' | translate }}</dt><dd>{{ subscription.paymentMethod }}</dd>
          </dl>
        } @else {
          <p class="muted">{{ 'settings.subscription.none' | translate }}</p>
        }
        <div class="form-actions"><a mat-stroked-button routerLink="/app/settings/plans">{{ 'nav.settings-plans' | translate }}</a></div>
      </mat-card-content>
    </mat-card>`,
  styles: `.details { display: grid; grid-template-columns: auto 1fr; gap: 8px 16px; } dt { color: #55635c; } dd { margin: 0; font-weight: 500; }`
})
export class SubscriptionSummary implements OnInit {
  protected readonly store = inject(SubscriptionPaymentsStore);

  ngOnInit(): void {
    this.store.loadPlans().then(() => this.store.loadSubscription()).catch(() => undefined);
  }
}
