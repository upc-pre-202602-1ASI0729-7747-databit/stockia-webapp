import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {BaseApiEndpoint} from '../../shared/infrastructure/base-api-endpoint';
import {environment} from '../../../environments/environment';
import {Sale, SaleChannel} from '../domain/model/sale.entity';
import {SaleAssembler} from './sale-assembler';
import {SaleResource, SalesResponse} from './sales-response';

/**
 * Endpoint /sales: sales history, sale registration (Ingredient Deduction Engine) and void.
 * @author DataBit
 */
export class SalesApiEndpoint extends BaseApiEndpoint<Sale, SaleResource, SalesResponse, SaleAssembler> {
  constructor(http: HttpClient) {
    super(http, `${environment.platformProviderApiBaseUrl}${environment.platformProviderSalesEndpointPath}`, new SaleAssembler());
  }

  register(recipeId: number, quantity: number, channel: SaleChannel): Observable<Sale> {
    return this.http.post<SaleResource>(this.endpointUrl, {recipeId, quantity, channel}).pipe(
      map(resource => this.assembler.toEntityFromResource(resource)), catchError(this.handleError));
  }

  voidSale(id: number): Observable<Sale> {
    return this.http.post<SaleResource>(`${this.endpointUrl}/${id}/void`, {}).pipe(
      map(resource => this.assembler.toEntityFromResource(resource)), catchError(this.handleError));
  }
}
