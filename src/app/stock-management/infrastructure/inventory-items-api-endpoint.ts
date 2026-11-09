import {HttpClient} from '@angular/common/http';
import {BaseApiEndpoint} from '../../shared/infrastructure/base-api-endpoint';
import {environment} from '../../../environments/environment';
import {InventoryItem} from '../domain/model/inventory-item.entity';
import {InventoryItemAssembler} from './inventory-item-assembler';
import {InventoryItemResource, InventoryItemsResponse} from './inventory-items-response';

/**
 * Endpoint /inventory-items (CRUD of supply lots).
 * @author DataBit
 */
export class InventoryItemsApiEndpoint extends BaseApiEndpoint<InventoryItem, InventoryItemResource, InventoryItemsResponse, InventoryItemAssembler> {
  constructor(http: HttpClient) {
    super(http, `${environment.platformProviderApiBaseUrl}${environment.platformProviderInventoryItemsEndpointPath}`,
      new InventoryItemAssembler());
  }
}
