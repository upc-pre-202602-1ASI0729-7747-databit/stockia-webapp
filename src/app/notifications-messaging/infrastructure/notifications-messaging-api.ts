import { inject, Service } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseApi } from '../../shared/infrastructure/base-api';
import { Alert } from '../domain/model/alert.entity';
import { AlertsApiEndpoint } from './alerts-api-endpoint';

/**
 * Facade of the Notifications &amp; Messaging API.
 * @author DataBit
 */
@Service()
export class NotificationsMessagingApi extends BaseApi {
  private readonly alertsEndpoint = new AlertsApiEndpoint(inject(HttpClient));

  getAlerts(): Observable<Alert[]> {
    return this.alertsEndpoint.getAll();
  }

  createAlert(alert: Alert): Observable<Alert> {
    return this.alertsEndpoint.create(alert);
  }

  updateAlert(alert: Alert): Observable<Alert> {
    return this.alertsEndpoint.update(alert, alert.id);
  }

  deleteAlert(id: number): Observable<void> {
    return this.alertsEndpoint.delete(id);
  }

  retryDelivery(id: number): Observable<Alert> {
    return this.alertsEndpoint.retryDelivery(id);
  }

  acknowledge(id: number): Observable<Alert> {
    return this.alertsEndpoint.acknowledge(id);
  }
}
