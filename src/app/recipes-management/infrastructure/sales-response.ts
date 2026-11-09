import {BaseResource, BaseResponse} from '../../shared/infrastructure/base-response';
import {SaleChannel, SaleLineItem, SaleStatus} from '../domain/model/sale.entity';

export interface SaleResource extends BaseResource {
  id: number;
  saleDate: string;
  channel: SaleChannel;
  status: SaleStatus;
  lineItems: SaleLineItem[];
  total: number;
}

export interface SalesResponse extends BaseResponse {
  sales: SaleResource[];
}
