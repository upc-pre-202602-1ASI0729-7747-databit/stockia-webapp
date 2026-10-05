import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, firstValueFrom } from 'rxjs';
import { Plan } from '../domain/model/plan.entity';
import { SubscribeToPlanCommand } from '../domain/model/subscribe-to-plan.command';
import { Subscription } from '../domain/model/subscription.entity';
import { SubscriptionService } from '../infrastructure/subscription.service';

/**
 * Copies a subscription so it can be changed without touching the stored one.
 *
 * @param subscription - Subscription to copy.
 * @param plan - Plan to attach to the copy.
 * @returns A new subscription with the same state.
 */
function copySubscription(subscription: Subscription, plan: Plan | null = null): Subscription {
  return new Subscription({
    id: subscription.id,
    planId: subscription.planId,
    status: subscription.status,
    renewalDate: subscription.renewalDate,
    paymentMethod: subscription.paymentMethod,
    plan,
  });
}

/** Application state and use cases of the Subscription and Payment Management context. */
@Injectable({ providedIn: 'root' })
export class SubscriptionStore {
  /** API facade of the bounded context. */
  private readonly subscriptionService = inject(SubscriptionService);

  /** Plans offered by the platform. */
  private readonly plansSignal = signal<Plan[]>([]);
  /** Subscription of the restaurant, as stored in the API. */
  private readonly subscriptionSignal = signal<Subscription | null>(null);
  /** Number of load requests in flight. */
  private readonly pendingLoadsSignal = signal(0);
  /** Whether a payment, renewal or cancellation is in flight. */
  private readonly processingSignal = signal(false);
  /** Message of the last failed use case. */
  private readonly errorSignal = signal<string | null>(null);

  /** Plans offered by the platform. */
  readonly plans = this.plansSignal.asReadonly();
  /** Whether a payment, renewal or cancellation is in flight. */
  readonly processing = this.processingSignal.asReadonly();
  /** Message of the last failed use case, or `null` when it succeeded. */
  readonly error = this.errorSignal.asReadonly();
  /** Whether plans or the subscription are being loaded. */
  readonly loading = computed(() => this.pendingLoadsSignal() > 0);

  /** Subscription of the restaurant with its plan attached, or `null` when there is none. */
  readonly currentSubscription = computed(() => {
    const subscription = this.subscriptionSignal();
    if (!subscription) {
      return null;
    }
    const plan = this.plansSignal().find((candidate) => candidate.id === subscription.planId);
    return copySubscription(subscription, plan ?? null);
  });

  /** Plan of the current subscription, or `null` when it is unknown. */
  readonly currentPlan = computed(() => this.currentSubscription()?.plan ?? null);

  /**
   * Looks up a loaded plan.
   *
   * @param id - Identifier of the plan.
   * @returns The plan, or `null` when it is not loaded.
   */
  findPlan(id: number): Plan | null {
    return this.plansSignal().find((plan) => plan.id === id) ?? null;
  }

  /** Loads the plans offered by the platform. */
  async loadPlans(): Promise<void> {
    const plans = await this.load(
      this.subscriptionService.getPlans(),
      'No se pudieron cargar los planes',
    );
    if (plans) {
      this.plansSignal.set(plans);
    }
  }

  /** Loads the subscription of the restaurant: the first one returned by the API. */
  async loadCurrentSubscription(): Promise<void> {
    const subscriptions = await this.load(
      this.subscriptionService.getSubscriptions(),
      'No se pudo cargar la suscripción',
    );
    if (subscriptions) {
      this.subscriptionSignal.set(subscriptions[0] ?? null);
    }
  }

  /**
   * Subscribes the restaurant to a plan.
   * Moves the current subscription to the plan, or creates one when there is none.
   *
   * @param command - Plan and payment method chosen by the user.
   * @returns `true` when the subscription was saved.
   */
  subscribeToPlan(command: SubscribeToPlanCommand): Promise<boolean> {
    const current = this.subscriptionSignal();
    if (current) {
      const subscription = copySubscription(current);
      subscription.changePlan(command.planId, command.paymentMethod);
      return this.save(
        this.subscriptionService.updateSubscription(subscription),
        'No se pudo procesar el pago',
      );
    }
    const subscription = new Subscription({
      id: 0,
      planId: command.planId,
      status: 'ACTIVE',
      renewalDate: Subscription.nextRenewalDate(),
      paymentMethod: command.paymentMethod,
    });
    return this.save(
      this.subscriptionService.createSubscription(subscription),
      'No se pudo procesar el pago',
    );
  }

  /**
   * Cancels the current subscription.
   *
   * @returns `true` when the cancellation was saved.
   */
  cancelSubscription(): Promise<boolean> {
    return this.changeCurrentSubscription(
      (subscription) => subscription.cancel(),
      'No se pudo cancelar la suscripción',
    );
  }

  /**
   * Renews the current subscription for another billing period.
   *
   * @returns `true` when the renewal was saved.
   */
  renewSubscription(): Promise<boolean> {
    return this.changeCurrentSubscription(
      (subscription) => subscription.renew(),
      'No se pudo renovar la suscripción',
    );
  }

  /**
   * Applies a domain change to a copy of the current subscription and saves it.
   *
   * @param change - Domain behavior to apply.
   * @param failureMessage - Message shown when the change cannot be saved.
   * @returns `true` when the change was saved.
   */
  private changeCurrentSubscription(
    change: (subscription: Subscription) => void,
    failureMessage: string,
  ): Promise<boolean> {
    const current = this.subscriptionSignal();
    if (!current) {
      this.errorSignal.set('No tienes una suscripción activa.');
      return Promise.resolve(false);
    }
    const subscription = copySubscription(current);
    change(subscription);
    return this.save(this.subscriptionService.updateSubscription(subscription), failureMessage);
  }

  /**
   * Runs a load request while tracking the loading and error state.
   *
   * @param request - Request to run.
   * @param failureMessage - Message shown when the request fails.
   * @returns The loaded value, or `null` when the request failed.
   */
  private async load<T>(request: Observable<T>, failureMessage: string): Promise<T | null> {
    this.pendingLoadsSignal.update((pending) => pending + 1);
    this.errorSignal.set(null);
    try {
      return await firstValueFrom(request);
    } catch (error) {
      this.errorSignal.set(this.formatError(error, failureMessage));
      return null;
    } finally {
      this.pendingLoadsSignal.update((pending) => pending - 1);
    }
  }

  /**
   * Saves a subscription while tracking the processing and error state.
   *
   * @param request - Request that saves the subscription.
   * @param failureMessage - Message shown when the request fails.
   * @returns `true` when the subscription was saved.
   */
  private async save(request: Observable<Subscription>, failureMessage: string): Promise<boolean> {
    this.processingSignal.set(true);
    this.errorSignal.set(null);
    try {
      this.subscriptionSignal.set(await firstValueFrom(request));
      return true;
    } catch (error) {
      this.errorSignal.set(this.formatError(error, failureMessage));
      return false;
    } finally {
      this.processingSignal.set(false);
    }
  }

  /**
   * Builds the message shown to the user when a use case fails.
   *
   * @param error - Error raised by the request.
   * @param fallback - Description of what could not be done.
   * @returns The fallback, followed by the error detail when there is one.
   */
  private formatError(error: unknown, fallback: string): string {
    return error instanceof Error && error.message
      ? `${fallback} (${error.message}).`
      : `${fallback}.`;
  }
}
