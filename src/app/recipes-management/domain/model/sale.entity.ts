import {BaseEntity} from '../../../shared/domain/model/base-entity';

export type SaleChannel = 'POS' | 'MANUAL';
export type SaleStatus = 'CONFIRMED' | 'VOIDED';

/** A dish of a sale, priced at the cost of its ingredients when it was sold. */
export interface SaleLineItem {
  recipeId: number;
  dishName: string;
  unitPrice: number;
  quantity: number;
}

/**
 * A sale of the restaurant. It is only recorded after the stock was validated by the API.
 * @author DataBit
 */
export class Sale implements BaseEntity {
  #id: number;
  #saleDate: Date;
  #channel: SaleChannel;
  #status: SaleStatus;
  #lineItems: SaleLineItem[];
  #total: number;

  constructor(sale: {id?: number; saleDate?: Date; channel?: SaleChannel; status?: SaleStatus; lineItems?: SaleLineItem[]; total?: number}) {
    this.#id = sale.id ?? 0;
    this.#saleDate = sale.saleDate ?? new Date();
    this.#channel = sale.channel ?? 'POS';
    this.#status = sale.status ?? 'CONFIRMED';
    this.#lineItems = sale.lineItems ?? [];
    this.#total = sale.total ?? 0;
  }

  get id(): number { return this.#id; }
  get saleDate(): Date { return this.#saleDate; }
  get channel(): SaleChannel { return this.#channel; }
  get status(): SaleStatus { return this.#status; }
  get lineItems(): SaleLineItem[] { return this.#lineItems; }
  get total(): number { return this.#total; }

  get isConfirmed(): boolean {
    return this.#status === 'CONFIRMED';
  }

  /** "2 × Lomo Saltado, 1 × Margherita Pizza" */
  get dishesSummary(): string {
    return this.#lineItems.map(line => `${line.quantity} × ${line.dishName}`).join(', ');
  }

  get portions(): number {
    return this.#lineItems.reduce((total, line) => total + line.quantity, 0);
  }
}
