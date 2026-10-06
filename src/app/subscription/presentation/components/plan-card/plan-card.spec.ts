import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { PaymentMethod } from '../../../domain/model/payment-method';
import { Plan } from '../../../domain/model/plan.entity';
import { PlanCard } from './plan-card';

describe('PlanCard', () => {
  let fixture: ComponentFixture<PlanCard>;
  let element: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    fixture = TestBed.createComponent(PlanCard);
    fixture.componentRef.setInput(
      'plan',
      new Plan({
        id: 2,
        name: 'Profesional',
        monthlyPrice: 39,
        features: ['Insumos ilimitados', 'Hasta 5 usuarios'],
        highlighted: true,
      }),
    );
    fixture.detectChanges();
    element = fixture.nativeElement as HTMLElement;
  });

  it('should render the plan with its highlighted tag', () => {
    expect(element.querySelector('h3')?.textContent).toContain('Profesional');
    expect(element.querySelector('.amount')?.textContent).toContain('S/39');
    expect(element.querySelectorAll('.plan-features li').length).toBe(2);
    expect(element.querySelector('.plan-tag')?.textContent).toContain('Más popular');
  });

  it('should emit the chosen payment method', () => {
    const chosen: PaymentMethod[] = [];
    fixture.componentInstance.pay.subscribe((method) => chosen.push(method));

    element.querySelectorAll('button').forEach((button) => button.click());

    expect(chosen).toEqual(['STRIPE', 'PAYPAL']);
  });

  it('should disable the actions while a payment is processed', () => {
    fixture.componentRef.setInput('processingMethod', 'STRIPE');
    fixture.detectChanges();

    const buttons = Array.from(element.querySelectorAll('button'));
    expect(buttons.every((button) => button.disabled)).toBe(true);
    expect(buttons[0].textContent).toContain('Procesando…');
  });
});
