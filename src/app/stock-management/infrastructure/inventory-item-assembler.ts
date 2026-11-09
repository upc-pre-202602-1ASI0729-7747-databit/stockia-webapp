import {BaseAssembler} from '../../shared/infrastructure/base-assembler';
import {DecimalQuantity} from '../../shared/domain/model/decimal-quantity';
import {InventoryItem} from '../domain/model/inventory-item.entity';
import {InventoryItemResource, InventoryItemsResponse} from './inventory-items-response';

/**
 * Translates supply lots between the API resources and the domain. The expiration date, value and
 * status are calculated by the API, so they are not sent back.
 * @author DataBit
 */
export class InventoryItemAssembler implements BaseAssembler<InventoryItem, InventoryItemResource, InventoryItemsResponse> {
  toEntityFromResource(resource: InventoryItemResource): InventoryItem {
    return new InventoryItem({
      id: resource.id, name: resource.name, unit: resource.unit, quantity: String(resource.quantity),
      minThreshold: String(resource.minThreshold), storageType: resource.storageType, shelfLifeDays: resource.shelfLifeDays,
      expirationDate: resource.expirationDate, unitCost: Number(resource.unitCost), stockValue: Number(resource.stockValue ?? 0),
      status: resource.status
    });
  }

  toResourceFromEntity(entity: InventoryItem): InventoryItemResource {
    return {
      id: entity.id, name: entity.name.trim(), unit: entity.unit.trim(), quantity: DecimalQuantity.toText(entity.quantity),
      minThreshold: DecimalQuantity.toText(entity.minThreshold), storageType: entity.storageType, shelfLifeDays: entity.shelfLifeDays,
      unitCost: entity.unitCost
    };
  }

  toEntitiesFromResponse(response: InventoryItemsResponse): InventoryItem[] {
    return response.inventoryItems.map(resource => this.toEntityFromResource(resource));
  }
}
