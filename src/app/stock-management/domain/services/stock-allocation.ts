import {DecimalQuantity} from '../../../shared/domain/model/decimal-quantity';
import {InventoryItem, productKeyOf} from '../model/inventory-item.entity';

/** What a dish needs from one supply per portion. */
export interface IngredientNeed {
  inventoryItemId: number;
  inventoryItemName: string;
  unit: string;
  quantityRequired: string;
}

/** Whether a dish can be sold now: READY, NO_STOCK or EXPIRED (only expired lots left). */
export type DishAvailability = 'READY' | 'NO_STOCK' | 'EXPIRED';

/**
 * Same allocation rule as the API (Ingredient Deduction Engine): the freshest usable lot is used first
 * and an expired lot is never used. The web application uses it to preview availability; the API
 * decides the sale.
 * @author DataBit
 */
export class StockAllocation {
  static lotsFor(need: IngredientNeed, items: InventoryItem[]): InventoryItem[] {
    const linked = items.find(item => item.id === need.inventoryItemId);
    const key = linked ? linked.productKey : productKeyOf(need.inventoryItemName, need.unit);
    return items.filter(item => item.productKey === key);
  }

  static usableLotsFreshestFirst(lots: InventoryItem[]): InventoryItem[] {
    return lots.filter(lot => !lot.isExpired && lot.hasStock)
      .sort((a, b) => b.expirationDate.localeCompare(a.expirationDate) || b.id - a.id);
  }

  /** Id of the lot each product uses first in sales (only for products with more than one lot). */
  static preferredLotIds(items: InventoryItem[]): Set<number> {
    const groups = new Map<string, InventoryItem[]>();
    items.forEach(item => groups.set(item.productKey, [...(groups.get(item.productKey) ?? []), item]));
    const ids = new Set<number>();
    groups.forEach(lots => {
      const freshest = StockAllocation.usableLotsFreshestFirst(lots)[0];
      if (lots.length > 1 && freshest) ids.add(freshest.id);
    });
    return ids;
  }

  static availabilityOf(needs: IngredientNeed[], items: InventoryItem[], portions = 1): DishAvailability {
    let expired = false;
    for (const need of needs) {
      const lots = StockAllocation.lotsFor(need, items);
      const required = DecimalQuantity.of(need.quantityRequired).times(portions);
      const usable = StockAllocation.usableLotsFreshestFirst(lots)
        .reduce((total, lot) => total.plus(DecimalQuantity.of(lot.quantity)), DecimalQuantity.of(0));
      if (usable.lt(required)) {
        if (lots.some(lot => lot.isExpired && lot.hasStock)) expired = true;
        else return 'NO_STOCK';
      }
    }
    return expired ? 'EXPIRED' : 'READY';
  }
}
