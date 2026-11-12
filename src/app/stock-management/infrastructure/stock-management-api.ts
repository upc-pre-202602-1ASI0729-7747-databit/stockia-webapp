import {inject, Service} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {BaseApi} from '../../shared/infrastructure/base-api';
import {InventoryItem} from '../domain/model/inventory-item.entity';
import {InventoryItemsApiEndpoint} from './inventory-items-api-endpoint';

/**
 * Facade of the Stock Management API.
 * @author DataBit
 */
@Service()
export class StockManagementApi extends BaseApi {
  private readonly inventoryItemsEndpoint = new InventoryItemsApiEndpoint(inject(HttpClient));

  getInventoryItems(): Observable<InventoryItem[]> {
    return this.inventoryItemsEndpoint.getAll();
  }

  createInventoryItem(item: InventoryItem): Observable<InventoryItem> {
    return this.inventoryItemsEndpoint.create(item);
  }

  updateInventoryItem(item: InventoryItem): Observable<InventoryItem> {
    return this.inventoryItemsEndpoint.update(item, item.id);
  }

  deleteInventoryItem(id: number): Observable<void> {
    return this.inventoryItemsEndpoint.delete(id);
  }
}
