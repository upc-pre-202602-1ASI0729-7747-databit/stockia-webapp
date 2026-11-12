/** A supply that blocks a sale (422 CannotSell): reason NOT_FOUND, EXPIRED or INSUFFICIENT. */
export interface Shortage {
  itemName: string;
  unit: string;
  reason: 'NOT_FOUND' | 'EXPIRED' | 'INSUFFICIENT';
  required: string;
  available: string;
  expired: string;
}

/**
 * Why a dish could not be sold; nothing was recorded and the stock did not change.
 * @author DataBit
 */
export interface SaleBlocked {
  dish: string;
  shortages: Shortage[];
}
