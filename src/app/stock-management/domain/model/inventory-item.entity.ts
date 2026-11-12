import {BaseEntity} from '../../../shared/domain/model/base-entity';
import {DecimalQuantity} from '../../../shared/domain/model/decimal-quantity';

/** Storage of a supply lot. */
export type StorageType = 'AMBIENT' | 'REFRIGERATED' | 'FROZEN';
export const STORAGE_TYPES: StorageType[] = ['AMBIENT', 'REFRIGERATED', 'FROZEN'];

/** Status calculated by the API: EXPIRED, CRITICAL (no stock), LOW (at or below the minimum) or AVAILABLE. */
export type StockStatus = 'AVAILABLE' | 'LOW' | 'CRITICAL' | 'EXPIRED';

/** Days before the expiration date when a lot counts as "expiring soon". */
export const EXPIRING_SOON_DAYS = 3;

/** Same normalization as the API: the lots of one product share name and unit. */
export function productKeyOf(name: string, unit: string): string {
  const normalize = (text: string) => text.trim().toLowerCase().split(/\s+/).filter(Boolean).join(' ');
  return `${normalize(name)}|${normalize(unit)}`;
}

/**
 * A supply lot of the restaurant. Quantities are exact texts with up to 32 decimals.
 * @author DataBit
 */
export class InventoryItem implements BaseEntity {
  #id: number;
  #name: string;
  #unit: string;
  #quantity: string;
  #minThreshold: string;
  #storageType: StorageType;
  #shelfLifeDays: number;
  #expirationDate: string;
  #unitCost: number;
  #stockValue: number;
  #status: StockStatus;

  constructor(item: {id?: number; name?: string; unit?: string; quantity?: string; minThreshold?: string; storageType?: StorageType;
    shelfLifeDays?: number; expirationDate?: string; unitCost?: number; stockValue?: number; status?: StockStatus}) {
    this.#id = item.id ?? 0;
    this.#name = item.name ?? '';
    this.#unit = item.unit ?? '';
    this.#quantity = item.quantity ?? '0';
    this.#minThreshold = item.minThreshold ?? '0';
    this.#storageType = item.storageType ?? 'AMBIENT';
    this.#shelfLifeDays = item.shelfLifeDays ?? 1;
    this.#expirationDate = item.expirationDate ?? '';
    this.#unitCost = item.unitCost ?? 0;
    this.#stockValue = item.stockValue ?? 0;
    this.#status = item.status ?? 'AVAILABLE';
  }

  get id(): number { return this.#id; }
  set id(value: number) { this.#id = value; }
  get name(): string { return this.#name; }
  set name(value: string) { this.#name = value; }
  get unit(): string { return this.#unit; }
  set unit(value: string) { this.#unit = value; }
  get quantity(): string { return this.#quantity; }
  set quantity(value: string) { this.#quantity = value; }
  get minThreshold(): string { return this.#minThreshold; }
  set minThreshold(value: string) { this.#minThreshold = value; }
  get storageType(): StorageType { return this.#storageType; }
  set storageType(value: StorageType) { this.#storageType = value; }
  get shelfLifeDays(): number { return this.#shelfLifeDays; }
  set shelfLifeDays(value: number) { this.#shelfLifeDays = value; }
  get expirationDate(): string { return this.#expirationDate; }
  get unitCost(): number { return this.#unitCost; }
  set unitCost(value: number) { this.#unitCost = value; }
  get stockValue(): number { return this.#stockValue; }
  get status(): StockStatus { return this.#status; }

  get productKey(): string {
    return productKeyOf(this.#name, this.#unit);
  }

  get isExpired(): boolean {
    return this.#status === 'EXPIRED';
  }

  /** Whole days until the expiration date (negative once expired). */
  get daysToExpire(): number {
    if (!this.#expirationDate) return Number.MAX_SAFE_INTEGER;
    const today = new Date();
    const start = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
    const [year, month, day] = this.#expirationDate.split('-').map(Number);
    return Math.round((Date.UTC(year!, month! - 1, day!) - start) / 86_400_000);
  }

  get isExpiringSoon(): boolean {
    return !this.isExpired && this.daysToExpire >= 0 && this.daysToExpire <= EXPIRING_SOON_DAYS;
  }

  get hasStock(): boolean {
    return DecimalQuantity.of(this.#quantity).gt(0);
  }

  /** Low, critical or expired lots appear in "Supplies that need attention". */
  get needsAttention(): boolean {
    return this.#status !== 'AVAILABLE' || this.isExpiringSoon;
  }
}
