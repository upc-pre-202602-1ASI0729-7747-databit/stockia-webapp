import { BaseEntity } from '../../../shared/domain/model/base-entity';
import { PaymentMethod } from './payment-method';
import { Plan } from './plan.entity';
import { SubscriptionStatus } from './subscription-status';

/** Number of milliseconds in a day. */
const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Parses a `YYYY-MM-DD` date as local midnight.
 *
 * @param isoDate - Date in `YYYY-MM-DD` format.
 * @returns The matching local date.
 */
function parseIsoDate(isoDate: string): Date {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Formats the local calendar day of a date as `YYYY-MM-DD`.
 *
 * @param date - Date to format.
 * @returns The date in `YYYY-MM-DD` format.
 */
function toIsoDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

/**
 * Adds a number of calendar days to a date.
 *
 * @param date - Starting date.
 * @param days - Days to add.
 * @returns A new date at local midnight.
 */
function addDays(date: Date, days: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

/** Subscription of a restaurant to a plan. */
export class Subscription implements BaseEntity {
  /** Length of a billing period, in days. */
  static readonly BILLING_PERIOD_DAYS = 30;

  /** Unique identifier of the subscription. */
  #id: number;
  /** Identifier of the subscribed plan. */
  #planId: number;
  /** Current lifecycle state. */
  #status: SubscriptionStatus;
  /** Date of the next renewal, in `YYYY-MM-DD` format. */
  #renewalDate: string;
  /** Payment provider used to pay the subscription. */
  #paymentMethod: PaymentMethod;
  /** Subscribed plan. Lives only in the domain; it is not sent to the API. */
  #plan: Plan | null;

  /**
   * @param subscription - Initial state of the subscription.
   */
  constructor(subscription: {
    id: number;
    planId: number;
    status: SubscriptionStatus;
    renewalDate: string;
    paymentMethod: PaymentMethod;
    plan?: Plan | null;
  }) {
    this.#id = subscription.id;
    this.#planId = subscription.planId;
    this.#status = subscription.status;
    this.#renewalDate = subscription.renewalDate;
    this.#paymentMethod = subscription.paymentMethod;
    this.#plan = subscription.plan ?? null;
  }

  /**
   * Computes the renewal date of a billing period starting on the given day.
   *
   * @param from - First day of the billing period. Defaults to today.
   * @returns The renewal date in `YYYY-MM-DD` format.
   */
  static nextRenewalDate(from: Date = new Date()): string {
    return toIsoDate(addDays(from, Subscription.BILLING_PERIOD_DAYS));
  }

  /** Unique identifier of the subscription. */
  get id(): number {
    return this.#id;
  }

  set id(value: number) {
    this.#id = value;
  }

  /** Identifier of the subscribed plan. */
  get planId(): number {
    return this.#planId;
  }

  set planId(value: number) {
    this.#planId = value;
  }

  /** Current lifecycle state. */
  get status(): SubscriptionStatus {
    return this.#status;
  }

  set status(value: SubscriptionStatus) {
    this.#status = value;
  }

  /** Date of the next renewal, in `YYYY-MM-DD` format. */
  get renewalDate(): string {
    return this.#renewalDate;
  }

  set renewalDate(value: string) {
    this.#renewalDate = value;
  }

  /** Payment provider used to pay the subscription. */
  get paymentMethod(): PaymentMethod {
    return this.#paymentMethod;
  }

  set paymentMethod(value: PaymentMethod) {
    this.#paymentMethod = value;
  }

  /** Subscribed plan. Lives only in the domain; it is not sent to the API. */
  get plan(): Plan | null {
    return this.#plan;
  }

  set plan(value: Plan | null) {
    this.#plan = value;
  }

  /**
   * Tells whether the subscription currently grants access to its plan.
   *
   * @returns `true` when the status is `ACTIVE`.
   */
  isActive(): boolean {
    return this.#status === 'ACTIVE';
  }

  /**
   * Counts the calendar days left until the renewal date.
   *
   * @param today - Day to count from. Defaults to today.
   * @returns The remaining days; zero or negative once the renewal date is reached.
   */
  daysUntilRenewal(today: Date = new Date()): number {
    const from = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const renewal = parseIsoDate(this.#renewalDate);
    return Math.round((renewal.getTime() - from.getTime()) / MILLISECONDS_PER_DAY);
  }

  /** Cancels the subscription. */
  cancel(): void {
    this.#status = 'CANCELLED';
  }

  /** Extends the renewal date by one billing period and activates the subscription. */
  renew(): void {
    const renewal = parseIsoDate(this.#renewalDate);
    this.#renewalDate = toIsoDate(addDays(renewal, Subscription.BILLING_PERIOD_DAYS));
    this.#status = 'ACTIVE';
  }

  /**
   * Moves the subscription to another plan and starts a new billing period.
   *
   * @param planId - Identifier of the new plan.
   * @param paymentMethod - Payment provider used to pay the new plan.
   * @param today - First day of the new billing period. Defaults to today.
   */
  changePlan(planId: number, paymentMethod: PaymentMethod, today: Date = new Date()): void {
    this.#planId = planId;
    this.#paymentMethod = paymentMethod;
    this.#status = 'ACTIVE';
    this.#renewalDate = Subscription.nextRenewalDate(today);
    this.#plan = null;
  }
}
