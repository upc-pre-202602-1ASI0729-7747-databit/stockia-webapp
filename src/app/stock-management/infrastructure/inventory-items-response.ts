import {BaseResource, BaseResponse} from '../../shared/infrastructure/base-response';
import {StockStatus, StorageType} from '../domain/model/inventory-item.entity';

/** A supply lot as the API sends it; quantity and minThreshold are exact texts. */
export interface InventoryItemResource extends BaseResource {
  id: number;
  name: string;
  unit: string;
  quantity: string;
  minThreshold: string;
  storageType: StorageType;
  shelfLifeDays: number;
  expirationDate?: string;
  unitCost: number;
  stockValue?: number;
  status?: StockStatus;
}

export interface InventoryItemsResponse extends BaseResponse {
  inventoryItems: InventoryItemResource[];
}
