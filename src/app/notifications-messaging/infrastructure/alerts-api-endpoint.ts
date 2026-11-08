import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { BaseApiEndpoint } from '../../shared/infrastructure/base-api-endpoint';
import { environment } from '../../../environments/environment';
import { Alert } from '../domain/model/alert.entity';
import { AlertAssembler } from './alert-assembler';
import { AlertResource, AlertsResponse } from './alerts-response';

/**
 * Endpoint /alerts: CRUD, delivery retries and acknowledgement.
 * @author DataBit
 */
export class AlertsApiEndpoint extends BaseApiEndpoint<
  Alert,
  AlertResource,
  AlertsResponse,
  AlertAssembler
> {
  constructor(http: HttpClient) {
    super(
      http,
      `${environment.platformProviderApiBaseUrl}${environment.platformProviderAlertsEndpointPath}`,
      new AlertAssembler(),
    );
  }

  retryDelivery(id: number): Observable<Alert> {
    return this.http.post<AlertResource>(`${this.endpointUrl}/${id}/deliveries`, {}).pipe(
      map((resource) => this.assembler.toEntityFromResource(resource)),
      catchError(this.handleError),
    );
  }

  acknowledge(id: number): Observable<Alert> {
    return this.http.post<AlertResource>(`${this.endpointUrl}/${id}/acknowledge`, {}).pipe(
      map((resource) => this.assembler.toEntityFromResource(resource)),
      catchError(this.handleError),
    );
  }
}
