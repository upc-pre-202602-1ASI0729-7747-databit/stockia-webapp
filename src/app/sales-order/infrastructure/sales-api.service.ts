import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Sale, SaleStatus } from '../domain/sale.entity';

// Infraestructura del Bounded Context Sales / Order Management: implementa el
// Repository SaleRepository contra el fake API (angular-in-memory-web-api).
@Injectable({ providedIn: 'root' })
export class SalesApiService {
  private http = inject(HttpClient);

  private readonly salesEndpoint = `${environment.platformProviderApiBaseUrl}${environment.platformProviderSalesEndpointPath}`;

  getAll() {
    return this.http.get<Sale[]>(this.salesEndpoint);
  }

  create(sale: Partial<Sale>) {
    return this.http.post<Sale>(this.salesEndpoint, sale);
  }

  // El fake API (angular-in-memory-web-api) no soporta PATCH: solo GET/POST/PUT/DELETE.
  // Por eso anular una venta es un PUT con el objeto completo y status = VOIDED.
  void(sale: Sale) {
    return this.http.put<Sale>(`${this.salesEndpoint}/${sale.id}`, {
      ...sale,
      status: SaleStatus.VOIDED,
    });
  }
}
