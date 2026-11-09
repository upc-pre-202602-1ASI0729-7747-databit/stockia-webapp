import {BaseAssembler} from '../../shared/infrastructure/base-assembler';
import {Sale} from '../domain/model/sale.entity';
import {SaleResource, SalesResponse} from './sales-response';

/**
 * Translates sales between the API resources and the domain (saleDate becomes a Date).
 * @author DataBit
 */
export class SaleAssembler implements BaseAssembler<Sale, SaleResource, SalesResponse> {
  toEntityFromResource(resource: SaleResource): Sale {
    return new Sale({
      id: resource.id, saleDate: new Date(resource.saleDate), channel: resource.channel, status: resource.status,
      lineItems: resource.lineItems.map(line => ({...line, unitPrice: Number(line.unitPrice)})), total: Number(resource.total)
    });
  }

  toResourceFromEntity(entity: Sale): SaleResource {
    return {id: entity.id, saleDate: entity.saleDate.toISOString(), channel: entity.channel, status: entity.status,
      lineItems: entity.lineItems, total: entity.total};
  }

  toEntitiesFromResponse(response: SalesResponse): Sale[] {
    return response.sales.map(resource => this.toEntityFromResource(resource));
  }
}
