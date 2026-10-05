import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { SubscribeToPlanCommand } from '../domain/model/subscribe-to-plan.command';
import { Subscription } from '../domain/model/subscription.entity';
import { SubscriptionStore } from './subscription.store';

const plansUrl = `${environment.platformProviderApiBaseUrl}${environment.platformProviderPlansEndpointPath}`;
const subscriptionsUrl = `${environment.platformProviderApiBaseUrl}${environment.platformProviderSubscriptionsEndpointPath}`;

const planResources = [
  { id: 1, name: 'Esencial', monthlyPrice: 0, features: ['1 usuario'], highlighted: false },
  { id: 2, name: 'Profesional', monthlyPrice: 39, features: ['5 usuarios'], highlighted: true },
];
const subscriptionResource = {
  id: 1,
  planId: 1,
  status: 'ACTIVE',
  renewalDate: '2026-10-31',
  paymentMethod: 'STRIPE',
};

describe('SubscriptionStore', () => {
  let store: SubscriptionStore;
  let http: HttpTestingController;

  /** Loads plans and the current subscription into the store. */
  async function loadAll(subscriptions: unknown[] = [subscriptionResource]): Promise<void> {
    const loaded = Promise.all([store.loadPlans(), store.loadCurrentSubscription()]);
    http.expectOne(plansUrl).flush(planResources);
    http.expectOne(subscriptionsUrl).flush(subscriptions);
    await loaded;
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    store = TestBed.inject(SubscriptionStore);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should expose the current subscription with its plan', async () => {
    const loaded = Promise.all([store.loadPlans(), store.loadCurrentSubscription()]);
    expect(store.loading()).toBe(true);
    http.expectOne(plansUrl).flush(planResources);
    http.expectOne(subscriptionsUrl).flush([subscriptionResource]);
    await loaded;

    expect(store.loading()).toBe(false);
    expect(store.plans().length).toBe(2);
    expect(store.currentSubscription()?.isActive()).toBe(true);
    expect(store.currentPlan()?.name).toBe('Esencial');
    expect(store.currentPlan()?.formattedPrice()).toBe('S/0');
  });

  it('should update the existing subscription when subscribing to a plan', async () => {
    await loadAll();

    const saved = store.subscribeToPlan(
      new SubscribeToPlanCommand({ planId: 2, paymentMethod: 'PAYPAL' }),
    );
    expect(store.processing()).toBe(true);
    const request = http.expectOne(`${subscriptionsUrl}/1`);
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual({
      id: 1,
      planId: 2,
      status: 'ACTIVE',
      renewalDate: Subscription.nextRenewalDate(),
      paymentMethod: 'PAYPAL',
    });
    request.flush(request.request.body);

    expect(await saved).toBe(true);
    expect(store.processing()).toBe(false);
    expect(store.currentPlan()?.name).toBe('Profesional');
  });

  it('should create a subscription without id when there is none', async () => {
    await loadAll([]);
    expect(store.currentSubscription()).toBeNull();

    const saved = store.subscribeToPlan(
      new SubscribeToPlanCommand({ planId: 2, paymentMethod: 'STRIPE' }),
    );
    const request = http.expectOne(subscriptionsUrl);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      planId: 2,
      status: 'ACTIVE',
      renewalDate: Subscription.nextRenewalDate(),
      paymentMethod: 'STRIPE',
    });
    request.flush({ id: 7, ...request.request.body });

    expect(await saved).toBe(true);
    expect(store.currentSubscription()?.id).toBe(7);
  });

  it('should cancel and renew the current subscription', async () => {
    await loadAll();

    const cancelled = store.cancelSubscription();
    const cancelRequest = http.expectOne(`${subscriptionsUrl}/1`);
    expect(cancelRequest.request.body.status).toBe('CANCELLED');
    cancelRequest.flush(cancelRequest.request.body);
    expect(await cancelled).toBe(true);
    expect(store.currentSubscription()?.isActive()).toBe(false);

    const renewed = store.renewSubscription();
    const renewRequest = http.expectOne(`${subscriptionsUrl}/1`);
    expect(renewRequest.request.body.status).toBe('ACTIVE');
    expect(renewRequest.request.body.renewalDate).toBe('2026-11-30');
    renewRequest.flush(renewRequest.request.body);
    expect(await renewed).toBe(true);
    expect(store.currentSubscription()?.renewalDate).toBe('2026-11-30');
  });

  it('should keep the subscription and report the error when saving fails', async () => {
    await loadAll();

    const saved = store.cancelSubscription();
    http
      .expectOne(`${subscriptionsUrl}/1`)
      .flush('boom', { status: 500, statusText: 'Server Error' });

    expect(await saved).toBe(false);
    expect(store.error()).toContain('No se pudo cancelar la suscripción');
    expect(store.currentSubscription()?.status).toBe('ACTIVE');
  });
});
