import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Alert } from '../domain/alert.entity';
import { Recommendation } from '../domain/recommendation.entity';

@Injectable({ providedIn: 'root' })
export class AlertsApiService {
  private http = inject(HttpClient);
  private readonly alertsEndpoint = `${environment.platformProviderApiBaseUrl}/alerts`;
  private readonly recommendationsEndpoint = `${environment.platformProviderApiBaseUrl}/recommendations`;

  getAlerts() {
    return this.http.get<Alert[]>(this.alertsEndpoint);
  }

  create(alert: Partial<Alert>) {
    return this.http.post<Alert>(this.alertsEndpoint, alert);
  }

  update(id: number, alert: Partial<Alert>) {
    return this.http.put<Alert>(`${this.alertsEndpoint}/${id}`, { ...alert, id });
  }

  delete(id: number) {
    return this.http.delete(`${this.alertsEndpoint}/${id}`);
  }

  acknowledge(alert: Alert) {
    return this.http.put<Alert>(`${this.alertsEndpoint}/${alert.id}`, {
      ...alert,
      acknowledged: true,
    });
  }

  updateDeliveredChannels(alert: Alert) {
    return this.http.put<Alert>(`${this.alertsEndpoint}/${alert.id}`, { ...alert });
  }

  getRecommendations() {
    return this.http.get<Recommendation[]>(this.recommendationsEndpoint);
  }
  markApplied(recommendation: Recommendation) {
    return this.http.put<Recommendation>(`${this.recommendationsEndpoint}/${recommendation.id}`, {
      ...recommendation,
      applied: true,
    });
  }
}
