import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { environment } from '../../../../../environments/environment';
import { PaymentCheckout } from './payment-checkout';

const plansUrl = `${environment.platformProviderApiBaseUrl}${environment.platformProviderPlansEndpointPath}`;
const subscriptionsUrl = `${environment.platformProviderApiBaseUrl}${environment.platformProviderSubscriptionsEndpointPath}`;

/** Waits for the pending promise callbacks to run. */
const settle = () => new Promise((resolve) => setTimeout(resolve));

describe('PaymentCheckout', () => {
  let harness: RouterTestingHarness;
  let http: HttpTestingController;
  let element: HTMLElement;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([
          {
            path: 'subscription',
            children: [
              { path: 'plans', children: [] },
              { path: 'checkout/:planId', component: PaymentCheckout },
            ],
          },
        ]),
      ],
    });
    http = TestBed.inject(HttpTestingController);
    harness = await RouterTestingHarness.create('/subscription/checkout/2');
    http.expectOne(plansUrl).flush([
      { id: 1, name: 'Esencial', monthlyPrice: 0, features: [], highlighted: false },
      { id: 2, name: 'Profesional', monthlyPrice: 39, features: ['IA'], highlighted: true },
    ]);
    http
      .expectOne(subscriptionsUrl)
      .flush([
        { id: 1, planId: 1, status: 'ACTIVE', renewalDate: '2026-10-31', paymentMethod: 'STRIPE' },
      ]);
    await settle();
    harness.detectChanges();
    element = harness.routeNativeElement as HTMLElement;
  });

  afterEach(() => http.verify());

  it('should summarize the plan taken from the route', () => {
    expect(element.querySelector('h2')?.textContent).toContain('Profesional');
    expect(element.querySelector('.amount')?.textContent).toContain('S/39');
    expect(element.querySelectorAll('.checkout-features li').length).toBe(1);
  });

  it('should pay with the selected method and return to the plan list', async () => {
    element.querySelector<HTMLInputElement>('input[value="PAYPAL"]')?.click();
    element.querySelector<HTMLButtonElement>('.btn-primary')?.click();
    await settle();

    const request = http.expectOne(`${subscriptionsUrl}/1`);
    expect(request.request.method).toBe('PUT');
    expect(request.request.body.planId).toBe(2);
    expect(request.request.body.paymentMethod).toBe('PAYPAL');
    request.flush(request.request.body);
    await settle();

    expect(TestBed.inject(Router).url).toBe('/subscription/plans');
  });
});
