import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Plan } from '../../../domain/model/plan.entity';
import { Subscription } from '../../../domain/model/subscription.entity';
import { SubscriptionStatus } from '../../../domain/model/subscription-status';
import { CurrentSubscriptionCard } from './current-subscription-card';

/** Builds a subscription to the "Esencial" plan with the given status. */
function subscriptionWith(status: SubscriptionStatus): Subscription {
  return new Subscription({
    id: 1,
    planId: 1,
    status,
    renewalDate: '2026-10-31',
    paymentMethod: 'PAYPAL',
    plan: new Plan({ id: 1, name: 'Esencial', monthlyPrice: 0, features: [], highlighted: false }),
  });
}

describe('CurrentSubscriptionCard', () => {
  let fixture: ComponentFixture<CurrentSubscriptionCard>;
  let element: HTMLElement;

  beforeEach(() => {
    fixture = TestBed.createComponent(CurrentSubscriptionCard);
    fixture.componentRef.setInput('subscription', subscriptionWith('ACTIVE'));
    fixture.detectChanges();
    element = fixture.nativeElement as HTMLElement;
  });

  it('should render the plan, status, renewal date and payment method', () => {
    expect(element.querySelector('h2')?.textContent).toContain('Esencial');
    expect(element.querySelector('.badge')?.className).toContain('badge-success');
    expect(element.querySelector('.badge')?.textContent).toContain('Activa');
    expect(element.textContent).toContain('31/10/2026');
    expect(element.textContent).toContain('PayPal');
  });

  it('should emit renew and cancel', () => {
    const events: string[] = [];
    fixture.componentInstance.renew.subscribe(() => events.push('renew'));
    fixture.componentInstance.cancel.subscribe(() => events.push('cancel'));

    element.querySelectorAll('button').forEach((button) => button.click());

    expect(events).toEqual(['renew', 'cancel']);
  });

  it('should flag a cancelled subscription and disable cancelling it again', () => {
    fixture.componentRef.setInput('subscription', subscriptionWith('CANCELLED'));
    fixture.detectChanges();

    expect(element.querySelector('.badge')?.className).toContain('badge-danger');
    expect(element.querySelector<HTMLButtonElement>('.btn-danger')?.disabled).toBe(true);
    expect(element.querySelector<HTMLButtonElement>('.btn-primary')?.disabled).toBe(false);
  });
});
